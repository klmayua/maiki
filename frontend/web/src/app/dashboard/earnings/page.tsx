'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Wallet, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function EarningsPage() {
  const transactions = [
    { id: 1, description: 'Payment from Acme Corp', amount: 850, type: 'income', date: '2026-03-20' },
    { id: 2, description: 'Payment from Fashion Brand Co', amount: 600, type: 'income', date: '2026-03-18' },
    { id: 3, description: 'Platform Fee', amount: -145, type: 'fee', date: '2026-03-18' },
    { id: 4, description: 'Withdrawal to Bank', amount: -1200, type: 'withdrawal', date: '2026-03-15' },
    { id: 5, description: 'Payment from Data Solutions', amount: 400, type: 'income', date: '2026-03-12' },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Earnings</h1>
        <p className="text-maiki-400">Track your income and manage payouts</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-maiki-400">Available Balance</p>
                <p className="text-3xl font-bold text-white">$2,450.00</p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">Withdraw</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-maiki-400">This Month</p>
                <p className="text-3xl font-bold text-white">$3,200.00</p>
              </div>
              <div className="p-3 bg-maiki-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-maiki-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+15% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-maiki-400">Pending</p>
                <p className="text-3xl font-bold text-white">$850.00</p>
              </div>
              <div className="p-3 bg-gold-400/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <p className="text-sm text-maiki-400 mt-4">From 2 active jobs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-maiki-950/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{tx.description}</p>
                  <p className="text-sm text-maiki-400">{tx.date}</p>
                </div>
                <span className={`font-semibold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
