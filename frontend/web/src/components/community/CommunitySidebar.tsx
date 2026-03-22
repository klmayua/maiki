"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Award,
  MessageSquare,
  Flame,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const TRENDING_TOPICS = [
  { name: "AI Tools", posts: 234 },
  { name: "Rate Negotiation", posts: 189 },
  { name: "Time Management", posts: 156 },
  { name: "Client Relations", posts: 142 },
  { name: "Skill Development", posts: 128 },
];

const TOP_GUILDS = [
  { name: "Tech VAs", members: 1240, color: "bg-blue-500" },
  { name: "Creative", members: 890, color: "bg-purple-500" },
  { name: "Administrative", members: 756, color: "bg-green-500" },
  { name: "Marketing", members: 643, color: "bg-orange-500" },
];

const LEADERBOARD = [
  {
    name: "Sarah Chen",
    tier: "legend",
    karma: 15420,
    avatar: "",
    contribution: "Top Contributor",
  },
  {
    name: "Mike Johnson",
    tier: "master",
    karma: 12350,
    avatar: "",
    contribution: "Mentor",
  },
  {
    name: "Emma Wilson",
    tier: "expert",
    karma: 9870,
    avatar: "",
    contribution: "Rising Star",
  },
];

export function CommunitySidebar() {
  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      apprentice: "bg-gray-500",
      associate: "bg-blue-500",
      professional: "bg-green-500",
      expert: "bg-purple-500",
      master: "bg-orange-500",
      legend: "bg-yellow-500",
    };
    return colors[tier.toLowerCase()] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold">12.5K</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold">3.2K</div>
              <div className="text-xs text-muted-foreground">Posts Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TRENDING_TOPICS.map((topic, index) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/community/topic/${topic.name.toLowerCase().replace(" ", "-")}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-sm font-bold w-6",
                        index < 3 ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      #{index + 1}
                    </span>
                    <span className="font-medium">{topic.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {topic.posts} posts
                  </Badge>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Guilds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Top Guilds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TOP_GUILDS.map((guild) => (
              <Link
                key={guild.name}
                href={`/community/g/${guild.name.toLowerCase().replace(" ", "-")}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className={cn("w-3 h-3 rounded-full", guild.color)} />
                <div className="flex-1">
                  <div className="font-medium">{guild.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {guild.members.toLocaleString()} members
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4" asChild>
            <Link href="/guilds">View All Guilds</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Karma Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Karma Leaders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LEADERBOARD.map((user, index) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="text-lg font-bold text-muted-foreground w-6">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{user.name}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] px-1 h-4 text-white",
                        getTierColor(user.tier)
                      )}
                    >
                      {user.tier}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.karma.toLocaleString()} karma
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
