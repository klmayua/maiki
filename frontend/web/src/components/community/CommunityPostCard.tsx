"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Award,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatRelativeTime } from "@/lib/utils";

interface CommunityPostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar: string;
      tier: string;
      karma: number;
    };
    guild?: {
      id: string;
      name: string;
      slug: string;
    };
    upvotes: number;
    downvotes: number;
    commentCount: number;
    tags: string[];
    createdAt: string;
    isUpvoted: boolean;
    isDownvoted: boolean;
  };
  onVote: (postId: string, voteType: "up" | "down") => void;
}

export function CommunityPostCard({ post, onVote }: CommunityPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const score = post.upvotes - post.downvotes;

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
    <div className="bg-card border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-l-lg">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onVote(post.id, "up")}
            className={cn(
              "p-1 rounded transition-colors",
              post.isUpvoted
                ? "text-orange-500 bg-orange-500/10"
                : "text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10"
            )}
          >
            <ArrowBigUp className="h-6 w-6" />
          </motion.button>
          <span
            className={cn(
              "font-bold text-sm my-1",
              post.isUpvoted
                ? "text-orange-500"
                : post.isDownvoted
                ? "text-blue-500"
                : "text-foreground"
            )}
          >
            {score}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onVote(post.id, "down")}
            className={cn(
              "p-1 rounded transition-colors",
              post.isDownvoted
                ? "text-blue-500 bg-blue-500/10"
                : "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
            )}
          >
            <ArrowBigDown className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {post.guild && (
              <>
                <Link
                  href={`/community/g/${post.guild.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  g/{post.guild.name}
                </Link>
                <span>•</span>
              </>
            )}
            <span>Posted by</span>
            <Link
              href={`/profile/${post.author.id}`}
              className="flex items-center gap-1 hover:underline"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{post.author.name}</span>
            </Link>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 text-white",
                getTierColor(post.author.tier)
              )}
            >
              {post.author.tier}
            </Badge>
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {post.author.karma.toLocaleString()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/community/post/${post.id}`}>
            <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
              {post.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <div className="text-muted-foreground mb-3">
            {isExpanded ? (
              <div className="whitespace-pre-wrap">{post.content}</div>
            ) : (
              <div className="line-clamp-3">{post.content}</div>
            )}
            {post.content.length > 300 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary text-sm hover:underline mt-2"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/community/post/${post.id}`}>
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.commentCount} Comments
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4 mr-1" />
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Hide</DropdownMenuItem>
                <DropdownMenuItem>Block user</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
