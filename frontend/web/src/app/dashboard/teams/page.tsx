'use client'

import { motion } from 'framer-motion'
import { Users, Plus, Crown, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TeamsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Guilds & Teams</h1>
        <p className="text-maiki-400">Connect with fellow VAs and build your network</p>
      </motion.div>

      <Card className="bg-gradient-to-br from-gold-400/10 to-maiki-500/10 border-gold-400/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-maiki-950" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">E-Commerce VA Guild</h3>
                <p className="text-maiki-300">542 members • Collective bargaining power for better rates</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="gold">Guild Member</Badge>
                  <Badge variant="soft">Since 2026</Badge>
                </div>
              </div>
            </div>
            <Button>Enter Guild</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center border border-dashed border-white/20 rounded-lg">
              <Users className="w-12 h-12 text-maiki-500 mx-auto mb-4" />
              <h3 className="font-medium text-white mb-2">No Teams Yet</h3>
              <p className="text-sm text-maiki-400 mb-4">Create or join a team to collaborate on projects</p>
              <Button variant="outline">Create Team</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Guilds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Social Media VAs', members: 320, focus: 'Instagram, TikTok, LinkedIn' },
              { name: 'Executive Assistants', members: 890, focus: 'C-Suite support' },
              { name: 'Customer Success', members: 456, focus: 'Support & retention' },
            ].map((guild) => (
              <div key={guild.name} className="flex items-center justify-between p-4 bg-maiki-950/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">{guild.name}</h4>
                  <p className="text-sm text-maiki-400">{guild.members} members • {guild.focus}</p>
                </div>
                <Button variant="outline" size="sm">Join</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
