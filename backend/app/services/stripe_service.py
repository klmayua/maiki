"""Stripe payment service for handling payments."""
from typing import Optional, Dict, Any, List
from decimal import Decimal

import stripe
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import User, Payment, Contract, PaymentStatus, PaymentType

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY
stripe.api_version = "2024-01-01"


class StripeService:
    """Service for handling Stripe payments."""

    @staticmethod
    def create_customer(user: User) -> stripe.Customer:
        """Create a Stripe customer for a user."""
        if user.stripe_customer_id:
            # Return existing customer
            return stripe.Customer.retrieve(user.stripe_customer_id)

        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}",
            phone=user.phone,
            metadata={
                "user_id": str(user.id),
                "role": user.role,
            }
        )

        # Store customer ID on user
        user.stripe_customer_id = customer.id

        return customer

    @staticmethod
    def create_payment_intent(
        amount: Decimal,
        currency: str = "usd",
        customer_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        capture_method: str = "automatic",
    ) -> stripe.PaymentIntent:
        """
        Create a payment intent.

        Args:
            amount: Amount in smallest currency unit (cents for USD)
            currency: Currency code (usd, eur, etc.)
            customer_id: Stripe customer ID
            metadata: Additional metadata
            capture_method: automatic or manual (for escrow)
        """
        # Convert Decimal to cents (integer)
        amount_cents = int(amount * 100)

        params = {
            "amount": amount_cents,
            "currency": currency.lower(),
            "capture_method": capture_method,
            "metadata": metadata or {},
        }

        if customer_id:
            params["customer"] = customer_id

        return stripe.PaymentIntent.create(**params)

    @staticmethod
    def capture_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
        """Capture an authorized payment intent (for escrow release)."""
        return stripe.PaymentIntent.capture(payment_intent_id)

    @staticmethod
    def cancel_payment_intent(
        payment_intent_id: str,
        cancellation_reason: Optional[str] = None
    ) -> stripe.PaymentIntent:
        """Cancel an uncaptured payment intent."""
        return stripe.PaymentIntent.cancel(
            payment_intent_id,
            cancellation_reason=cancellation_reason
        )

    @staticmethod
    def create_refund(
        payment_intent_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> stripe.Refund:
        """Create a refund for a payment."""
        params = {
            "payment_intent": payment_intent_id,
            "reason": reason,
        }

        if amount:
            params["amount"] = int(amount * 100)

        return stripe.Refund.create(**params)

    @staticmethod
    def create_transfer(
        amount: Decimal,
        destination: str,  # Connected account ID
        currency: str = "usd",
        metadata: Optional[Dict[str, Any]] = None
    ) -> stripe.Transfer:
        """Transfer funds to a connected account (for VA payouts)."""
        return stripe.Transfer.create(
            amount=int(amount * 100),
            currency=currency.lower(),
            destination=destination,
            metadata=metadata or {}
        )

    @staticmethod
    def create_connected_account(
        email: str,
        country: str = "US",
        metadata: Optional[Dict[str, Any]] = None
    ) -> stripe.Account:
        """Create a Stripe Connect account for VA payouts."""
        return stripe.Account.create(
            type="express",
            country=country,
            email=email,
            capabilities={
                "transfers": {"requested": True},
            },
            metadata=metadata or {}
        )

    @staticmethod
    def create_account_link(
        account_id: str,
        refresh_url: str,
        return_url: str
    ) -> stripe.AccountLink:
        """Create onboarding link for a connected account."""
        return stripe.AccountLink.create(
            account=account_id,
            refresh_url=refresh_url,
            return_url=return_url,
            type="account_onboarding"
        )

    @staticmethod
    def construct_webhook_event(payload: bytes, sig_header: str, secret: str):
        """Verify and construct webhook event."""
        return stripe.Webhook.construct_event(
            payload, sig_header, secret
        )


class PaymentService:
    """High-level payment service for Maiki transactions."""

    def __init__(self, db: Session):
        self.db = db
        self.stripe = StripeService()

    def create_escrow_payment(
        self,
        client: User,
        contract: Contract,
        amount: Decimal,
        description: str
    ) -> Dict[str, Any]:
        """
        Create an escrow payment for a job.

        Flow:
        1. Client is charged immediately (authorized)
        2. Funds held by Stripe (captured but not transferred)
        3. On job completion, funds are released to VA
        """
        # Ensure client has Stripe customer
        customer = self.stripe.create_customer(client)

        # Create payment intent with manual capture (escrow)
        metadata = {
            "contract_id": str(contract.id),
            "client_id": str(client.id),
            "va_id": str(contract.va_id),
            "type": "escrow",
        }

        payment_intent = self.stripe.create_payment_intent(
            amount=amount,
            customer_id=customer.id,
            metadata=metadata,
            capture_method="manual"  # Hold for escrow
        )

        # Create payment record
        payment = Payment(
            user_id=client.id,
            contract_id=contract.id,
            amount=amount,
            currency="USD",
            type=PaymentType.JOB_PAYMENT,
            status=PaymentStatus.HELD,  # In escrow
            stripe_payment_intent_id=payment_intent.id,
            description=description,
        )

        self.db.add(payment)
        self.db.commit()

        return {
            "payment": payment,
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id,
        }

    def release_escrow(self, payment_id: int) -> Payment:
        """Release held funds to the VA."""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()

        if not payment or payment.status != PaymentStatus.HELD:
            raise ValueError("Payment not found or not in escrow")

        # Capture the payment intent
        self.stripe.capture_payment_intent(payment.stripe_payment_intent_id)

        # Get VA's Stripe connected account
        va = self.db.query(User).filter(User.id == payment.contract.va_id).first()

        if va and va.stripe_account_id:
            # Calculate amount after platform fee (e.g., 15%)
            platform_fee = payment.amount * Decimal("0.15")
            transfer_amount = payment.amount - platform_fee

            # Transfer to VA's connected account
            self.stripe.create_transfer(
                amount=transfer_amount,
                destination=va.stripe_account_id,
                metadata={
                    "payment_id": str(payment.id),
                    "contract_id": str(payment.contract_id),
                }
            )

        # Update payment status
        payment.status = PaymentStatus.RELEASED
        self.db.commit()

        return payment

    def refund_payment(self, payment_id: int, reason: str = "requested_by_customer") -> Payment:
        """Refund a payment to the client."""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()

        if not payment:
            raise ValueError("Payment not found")

        if payment.status == PaymentStatus.RELEASED:
            # Create refund
            self.stripe.create_refund(
                payment_intent_id=payment.stripe_payment_intent_id,
                reason=reason
            )
        elif payment.status == PaymentStatus.HELD:
            # Cancel the authorization
            self.stripe.cancel_payment_intent(
                payment_intent_id=payment.stripe_payment_intent_id,
                cancellation_reason="abandoned"
            )

        payment.status = PaymentStatus.REFUNDED
        self.db.commit()

        return payment

    def create_va_payout_account(self, user: User) -> Dict[str, Any]:
        """Set up a VA to receive payouts via Stripe Connect."""
        if user.stripe_account_id:
            # Return existing account
            account = stripe.Account.retrieve(user.stripe_account_id)
            return {
                "account_id": account.id,
                "charges_enabled": account.charges_enabled,
                "payouts_enabled": account.payouts_enabled,
                "onboarding_complete": account.details_submitted,
            }

        # Create new connected account
        account = self.stripe.create_connected_account(
            email=user.email,
            country=user.country or "US",
            metadata={"user_id": str(user.id)}
        )

        user.stripe_account_id = account.id
        self.db.commit()

        # Create onboarding link
        base_url = settings.FRONTEND_URL or "https://maiki.io"
        account_link = self.stripe.create_account_link(
            account_id=account.id,
            refresh_url=f"{base_url}/dashboard/settings/payments?error=stripe_onboarding",
            return_url=f"{base_url}/dashboard/settings/payments?success=stripe_connected"
        )

        return {
            "account_id": account.id,
            "onboarding_url": account_link.url,
            "charges_enabled": False,
            "payouts_enabled": False,
        }

    def handle_webhook(self, event: stripe.Event) -> Optional[Payment]:
        """Handle Stripe webhook events."""
        event_type = event.type
        payment = None

        if event_type == "payment_intent.succeeded":
            payment_intent = event.data.object
            # Update payment status if captured
            payment = self.db.query(Payment).filter(
                Payment.stripe_payment_intent_id == payment_intent.id
            ).first()

            if payment:
                payment.status = PaymentStatus.RELEASED
                self.db.commit()

        elif event_type == "payment_intent.payment_failed":
            payment_intent = event.data.object
            payment = self.db.query(Payment).filter(
                Payment.stripe_payment_intent_id == payment_intent.id
            ).first()

            if payment:
                payment.status = PaymentStatus.PENDING  # Retry possible
                self.db.commit()

        elif event_type == "charge.refunded":
            charge = event.data.object
            # Find associated payment
            payment = self.db.query(Payment).filter(
                Payment.stripe_payment_intent_id == charge.payment_intent
            ).first()

            if payment:
                payment.status = PaymentStatus.REFUNDED
                self.db.commit()

        return payment
