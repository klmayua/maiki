"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  TrendingUp,
  Clock,
  Flame,
  Search,
  Plus,
  Filter,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

interface CommunityPost {
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
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("hot");
  const [filterGuild, setFilterGuild] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [sortBy, filterGuild]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/community/posts", {
        params: {
          sort: sortBy,
          guild: filterGuild !== "all" ? filterGuild : undefined,
          q: searchQuery || undefined,
        },
      });
      setPosts(response.data.posts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    try {
      await api.post(`/community/posts/${postId}/vote`, { vote_type: voteType });
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const isUpvoting = voteType === "up";
          const wasUpvoted = post.isUpvoted;
          const wasDownvoted = post.isDownvoted;
          return {
            ...post,
            upvotes: wasUpvoted
              ? post.upvotes - 1
              : isUpvoting
                ? post.upvotes + 1
                : post.upvotes - (wasDownvoted ? 0 : 0),
            downvotes: wasDownvoted
              ? post.downvotes - 1
              : !isUpvoting
                ? post.downvotes + 1
                : post.downvotes - (wasUpvoted ? 0 : 0),
            isUpvoted: isUpvoting ? !wasUpvoted : false,
            isDownvoted: !isUpvoting ? !wasDownvoted : false,
          };
        })
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register vote",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async (data: {
    title: string;
    content: string;
    guildId?: string;
    tags: string[];
  }) => {
    try {
      const response = await api.post("/community/posts", data);
      setPosts((prev) => [response.data, ...prev]);
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                Community
              </h1>
              <p className="text-muted-foreground mt-1">
                Connect, share, and grow with fellow VAs
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, topics, or users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPosts()}
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      Hot
                    </span>
                  </SelectItem>
                  <SelectItem value="new">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      New
                    </span>
                  </SelectItem>
                  <SelectItem value="top">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Top
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterGuild} onValueChange={setFilterGuild}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by guild" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Guilds</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="tech">Tech VAs</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="admin">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-3 bg-muted rounded w-full mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a conversation!
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CommunityPostCard
                    post={post}
                    onVote={handleVote}
                  />
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <CommunitySidebar />
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
