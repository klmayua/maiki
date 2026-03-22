'use client'

import { motion } from 'framer-motion'
import { User, Bell, Shield, CreditCard, Globe, Moon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-maiki-400">Manage your account preferences</p>
      </motion.div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-maiki-400" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-maiki-400 block mb-2">First Name</label>
                <Input defaultValue="John" />
              </div>
              <div>
                <label className="text-sm text-maiki-400 block mb-2">Last Name</label>
                <Input defaultValue="Doe" />
              </div>
            </div>
            <div>
              <label className="text-sm text-maiki-400 block mb-2">Email</label>
              <Input defaultValue="john@example.com" type="email" />
            </div>
            <div>
              <label className="text-sm text-maiki-400 block mb-2">Bio</label>
              <textarea
                className="w-full bg-maiki-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-maiki-500 min-h-[100px]"
                defaultValue="Experienced virtual assistant specializing in executive support and social media management."
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-maiki-400" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['New job matches', 'Message notifications', 'Payment received', 'Course updates'].map((item) => (
              <label key={item} className="flex items-center justify-between">
                <span className="text-white">{item}</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 bg-maiki-950" />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Shield className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
