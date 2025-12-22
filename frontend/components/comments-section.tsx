"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send } from "lucide-react"

interface Comment {
  id: number
  deal_id: number
  comment_text: string
  created_by: string | null
  created_at: string
}

interface CommentsSectionProps {
  dealId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommentsSection({ dealId, open, onOpenChange }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchComments()
    }
  }, [open, dealId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${dealId}/comments`)
      if (!response.ok) throw new Error("Failed to fetch comments")
      const data = await response.json()
      setComments(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to load comments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${dealId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: newComment }),
      })
      if (!response.ok) throw new Error("Failed to post comment")
      const data = await response.json()
      setComments([...comments, data])
      setNewComment("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex h-[calc(100vh-180px)] flex-col">
          {/* Comments List */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm text-foreground">{comment.comment_text}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mt-4 border-t border-border pt-4">
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px] resize-none"
                disabled={submitting}
              />
              <Button type="submit" size="icon" disabled={submitting || !newComment.trim()} className="shrink-0">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
