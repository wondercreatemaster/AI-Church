"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  getUserConversationsAction, 
  deleteConversationAction, 
  renameConversationAction,
  exportConversationAction 
} from "@/app/actions/conversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Download, 
  Share2,
  ArrowLeft,
  Loader2,
  Calendar,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { ConversationStage } from "@/lib/db/models/conversation";

interface ConversationsPageClientProps {
  session: {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  };
}

export default function ConversationsPageClient({ session }: ConversationsPageClientProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Rename dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterAndSortConversations();
  }, [conversations, searchQuery, stageFilter, sortBy]);

  const loadConversations = async () => {
    setIsLoading(true);
    const result = await getUserConversationsAction();
    if (result.success) {
      setConversations(result.conversations);
    } else {
      toast.error(result.message || "Failed to load conversations");
    }
    setIsLoading(false);
  };

  const filterAndSortConversations = () => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply stage filter
    if (stageFilter !== "all") {
      filtered = filtered.filter(conv => conv.stage === stageFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredConversations(filtered);
  };

  const handleRenameClick = (conversation: any) => {
    setSelectedConversation(conversation);
    setNewTitle(conversation.title);
    setRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (!selectedConversation || !newTitle.trim()) return;

    setIsRenaming(true);
    const result = await renameConversationAction(selectedConversation.id, newTitle.trim());
    
    if (result.success) {
      toast.success("Conversation renamed");
      await loadConversations();
      setRenameDialogOpen(false);
    } else {
      toast.error(result.message || "Failed to rename");
    }
    setIsRenaming(false);
  };

  const handleDeleteClick = (conversation: any) => {
    setSelectedConversation(conversation);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedConversation) return;

    setIsDeleting(true);
    const result = await deleteConversationAction(selectedConversation.id);
    
    if (result.success) {
      toast.success("Conversation deleted");
      await loadConversations();
      setDeleteDialogOpen(false);
    } else {
      toast.error(result.message || "Failed to delete");
    }
    setIsDeleting(false);
  };

  const handleExport = async (conversation: any) => {
    const result = await exportConversationAction(conversation.id);
    
    if (result.success && result.data) {
      // Create download
      const blob = new Blob([result.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversation.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Conversation exported");
    } else {
      toast.error(result.message || "Failed to export");
    }
  };

  const handleShare = (conversation: any) => {
    setSelectedConversation(conversation);
    // Generate shareable URL (in production, you'd create a public share link)
    const url = `${window.location.origin}/chat?conversation=${conversation.id}`;
    setShareUrl(url);
    setShareDialogOpen(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };

  const getStageName = (stage: ConversationStage) => {
    const names = {
      A: "Getting to Know You",
      B: "Understanding Differences",
      C: "Exploring Together",
      D: "Next Steps"
    };
    return names[stage];
  };

  const getStageColor = (stage: ConversationStage) => {
    const colors = {
      A: "bg-blue-100 text-blue-700",
      B: "bg-purple-100 text-purple-700",
      C: "bg-green-100 text-green-700",
      D: "bg-orange-100 text-orange-700"
    };
    return colors[stage];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAF8F3] via-white to-byzantine-50/30">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/chat">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
          <h1 className="text-4xl font-display font-bold text-orthodox-600 mb-2">
            My Conversations
          </h1>
          <p className="text-gray-600">
            Browse, search, and manage your theological discussions
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <Label htmlFor="search" className="mb-2 block text-sm font-medium">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stage Filter */}
            <div>
              <Label htmlFor="stage-filter" className="mb-2 block text-sm font-medium">
                Filter by Stage
              </Label>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger id="stage-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="A">Stage A</SelectItem>
                  <SelectItem value="B">Stage B</SelectItem>
                  <SelectItem value="C">Stage C</SelectItem>
                  <SelectItem value="D">Stage D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Label htmlFor="sort" className="mb-2 block text-sm font-medium">
                Sort By
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || stageFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredConversations.length} of {conversations.length} conversations
              </span>
              {(searchQuery || stageFilter !== "all") && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStageFilter("all");
                  }}
                  className="text-byzantine-600 p-0 h-auto"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Conversations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-byzantine-500" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {conversations.length === 0 ? "No conversations yet" : "No matching conversations"}
            </h3>
            <p className="text-gray-500 mb-6">
              {conversations.length === 0
                ? "Start a new theological discussion to see it here"
                : "Try adjusting your filters or search query"}
            </p>
            <Link href="/chat">
              <Button className="bg-byzantine-500 hover:bg-byzantine-600">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start New Conversation
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div 
                    className="flex-1 pr-4"
                    onClick={() => router.push(`/chat?conversation=${conversation.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-byzantine-600 transition-colors">
                      {conversation.title}
                    </h3>
                    <Badge className={`${getStageColor(conversation.stage)} mb-2`}>
                      Stage {conversation.stage}: {getStageName(conversation.stage)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Updated {new Date(conversation.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRenameClick(conversation)}
                    className="flex-1"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Rename
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(conversation)}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(conversation)}
                    className="flex-1"
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(conversation)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Give this conversation a new title
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-title">New Title</Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new title..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isRenaming) {
                    handleRename();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isRenaming || !newTitle.trim()}
              className="bg-byzantine-500 hover:bg-byzantine-600"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                "Rename"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedConversation?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Conversation</DialogTitle>
            <DialogDescription>
              Copy this link to share your conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={copyShareUrl} variant="outline">
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Note: This is a direct link. Anyone with this URL can view the conversation.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

