
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface Comment {
  id: string;
  content: string;
  rating: number | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CarCommentsProps {
  carId: number;
  carName: string;
}

const CarComments = ({ carId, carName }: CarCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchComments();
    
    // Set up realtime subscription with proper cleanup
    const channel = supabase
      .channel(`car-comments-${carId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "car_comments",
          filter: `car_id=eq.${carId}`,
        },
        () => {
          console.log("Realtime event triggered, refetching comments");
          fetchComments();
        }
      )
      .subscribe();

    console.log("Subscribed to realtime for car comments:", carId);

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [carId]);

  const fetchComments = async () => {
    try {
      console.log("Fetching comments for car:", carId);
      
      // Use a single query with join to get comments and profiles together
      const { data: commentsData, error: commentsError } = await supabase
        .from("car_comments")
        .select(`
          *,
          profiles!car_comments_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("car_id", carId)
        .order("created_at", { ascending: false });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        throw commentsError;
      }

      console.log("Fetched comments data:", commentsData);
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setFetchingComments(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to leave a comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log("Submitting comment for car:", carId, "by user:", user.id);
      
      const { data, error } = await supabase
        .from("car_comments")
        .insert({
          car_id: carId,
          user_id: user.id,
          content: newComment.trim(),
          rating: newRating,
        })
        .select()
        .single();

      if (error) {
        console.error("Error submitting comment:", error);
        throw error;
      }

      console.log("Comment submitted successfully:", data);

      setNewComment("");
      setNewRating(5);
      
      // Immediately fetch comments to ensure the new comment appears
      await fetchComments();
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    );
  };

  if (fetchingComments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t("commentsReviews")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {t("common.loading")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {t("commentsReviews")} ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={submitComment} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("ratingLabel")}</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {newRating}/5
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">{t("yourComment")}</Label>
              <Textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("commentPlaceholder", { carName })}
                className="min-h-[100px]"
              />
            </div>
            
            <Button type="submit" disabled={loading || !newComment.trim()}>
              {loading ? t("common.loading") : t("postComment")}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>{t("auth.login") || "Please log in to leave a comment"}</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t("noCommentsMsg")}</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {comment.profiles?.avatar_url ? (
                        <img
                          src={comment.profiles.avatar_url}
                          alt="User avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {comment.profiles?.full_name || t("auth.carRenter")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                  </div>
                  {renderStars(comment.rating)}
                </div>
                
                <p className="text-sm leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CarComments;
