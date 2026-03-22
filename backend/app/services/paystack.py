"""Paystack payment service for African markets."""
import os
import requests
from typing import Dict, Any, Optional
from datetime import datetime

from app.core.config import settings


class PaystackService:
    """Paystack API integration for payments."""

    def __init__(self):
        self.secret_key = os.getenv("PAYSTACK_SECRET_KEY")
        self.public_key = os.getenv("PAYSTACK_PUBLIC_KEY")
        self.base_url = "https://api.paystack.co"
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    def initialize_transaction(
        self,
        email: str,
        amount: int,  # Amount in kobo (smallest currency unit)
        reference: str,
        callback_url: Optional[str] = None,
        metadata: Optional[Dict] = None,
        channels: Optional[list] = None,  # ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer", "eft"]
    ) -> Dict[str, Any]:
        """Initialize a payment transaction."""
        try:
            payload = {
                "email": email,
                "amount": amount,
                "reference": reference,
                "callback_url": callback_url or f"{settings.FRONTEND_URL}/payment/callback",
                "metadata": metadata or {},
            }

            if channels:
                payload["channels"] = channels

            response = requests.post(
                f"{self.base_url}/transaction/initialize",
                headers=self.headers,
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """Verify a transaction by reference."""
        try:
            response = requests.get(
                f"{self.base_url}/transaction/verify/{reference}",
                headers=self.headers,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def create_transfer_recipient(
        self,
        account_type: str,  # nuban, ghipss, mobile_money, etc
        account_number: str,
        bank_code: str,
        name: str,
        currency: str = "NGN",
    ) -> Dict[str, Any]:
        """Create a transfer recipient (for withdrawals)."""
        try:
            payload = {
                "type": account_type,
                "name": name,
                "account_number": account_number,
                "bank_code": bank_code,
                "currency": currency,
            }

            response = requests.post(
                f"{self.base_url}/transferrecipient",
                headers=self.headers,
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def initiate_transfer(
        self,
        amount: int,
        recipient_code: str,
        reference: str,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Initiate a transfer to a recipient."""
        try:
            payload = {
                "source": "balance",
                "amount": amount,
                "recipient": recipient_code,
                "reference": reference,
                "reason": reason or "Withdrawal",
            }

            response = requests.post(
                f"{self.base_url}/transfer",
                headers=self.headers,
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def verify_transfer(self, transfer_code: str) -> Dict[str, Any]:
        """Verify a transfer."""
        try:
            response = requests.get(
                f"{self.base_url}/transfer/{transfer_code}",
                headers=self.headers,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def create_subaccount(
        self,
        business_name: str,
        settlement_bank: str,
        account_number: str,
        percentage_charge: float,
    ) -> Dict[str, Any]:
        """Create a subaccount for split payments."""
        try:
            payload = {
                "business_name": business_name,
                "settlement_bank": settlement_bank,
                "account_number": account_number,
                "percentage_charge": percentage_charge,
            }

            response = requests.post(
                f"{self.base_url}/subaccount",
                headers=self.headers,
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def list_banks(self, country: str = "nigeria") -> Dict[str, Any]:
        """List supported banks."""
        try:
            response = requests.get(
                f"{self.base_url}/bank",
                headers=self.headers,
                params={"country": country},
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def resolve_account(
        self,
        account_number: str,
        bank_code: str,
    ) -> Dict[str, Any]:
        """Resolve bank account details."""
        try:
            response = requests.get(
                f"{self.base_url}/bank/resolve",
                headers=self.headers,
                params={
                    "account_number": account_number,
                    "bank_code": bank_code,
                },
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def fetch_balance(self) -> Dict[str, Any]:
        """Fetch Paystack balance."""
        try:
            response = requests.get(
                f"{self.base_url}/balance",
                headers=self.headers,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}


# Currency multipliers (convert to smallest unit)
CURRENCY_MULTIPLIERS = {
    "NGN": 100,  # kobo
    "GHS": 100,  # pesewas
    "ZAR": 100,  # cents
    "USD": 100,  # cents
    "KES": 100,  # cents
}


def convert_to_smallest_unit(amount: float, currency: str = "NGN") -> int:
    """Convert amount to smallest currency unit."""
    multiplier = CURRENCY_MULTIPLIERS.get(currency, 100)
    return int(amount * multiplier)


def convert_from_smallest_unit(amount: int, currency: str = "NGN") -> float:
    """Convert from smallest currency unit."""
    multiplier = CURRENCY_MULTIPLIERS.get(currency, 100)
    return amount / multiplier


# Singleton instance
paystack_service = PaystackService()
