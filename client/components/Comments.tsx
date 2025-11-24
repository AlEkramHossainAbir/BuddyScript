"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

interface Reply {
  _id: string;
  content: string;
  author: User;
  likes: User[];
  createdAt: string;
}

interface Reaction {
  user: User;
  type: "like" | "love" | "haha" | "sad" | "care" | "angry";
  _id?: string;
}

interface Comment {
  _id: string;
  content: string;
  image?: string;
  author: User;
  likes: User[];
  reactions?: Reaction[];
  replies: Reply[];
  createdAt: string;
}

interface CommentsProps {
  postId: string;
  onCommentsCountChange?: (count: number) => void;
}

export interface CommentsHandle {
  focusInput: () => void;
}

const Comments = forwardRef<CommentsHandle, CommentsProps>(({ postId, onCommentsCountChange }, ref) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState<string>("");
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>(
    {}
  );
  const [replyImage, setReplyImage] = useState<{ [key: string]: File | null }>(
    {}
  );
  const [replyImagePreview, setReplyImagePreview] = useState<{
    [key: string]: string;
  }>({});
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showAllComments, setShowAllComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<{
    [key: string]: boolean;
  }>({});
  const [hideTimeout, setHideTimeout] = useState<{
    [key: string]: NodeJS.Timeout | null;
  }>({});
  const commentImageInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyImageInputRefs = useRef<{
    [key: string]: HTMLInputElement | null;
  }>({});
  const replyInputRefs = useRef<{
    [key: string]: HTMLTextAreaElement | null;
  }>({});

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      commentInputRef.current?.focus();
    },
  }));

  useEffect(() => {
    loadComments();
  }, [postId]);

  useEffect(() => {
    if (onCommentsCountChange) {
      const totalCount = comments.reduce((acc, comment) => {
        return acc + 1 + (comment.replies ? comment.replies.length : 0);
      }, 0);
      onCommentsCountChange(totalCount);
    }
  }, [comments, onCommentsCountChange]);

  const loadComments = async () => {
    try {
      const response = await api.get(`/comments/post/${postId}`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Failed to load comments");
    }
  };

  const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplyImageChange = (
    commentId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setReplyImage({ ...replyImage, [commentId]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImagePreview({
          ...replyImagePreview,
          [commentId]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCommentSubmit = async (
    e?: React.FormEvent | React.KeyboardEvent
  ) => {
    if (e) {
      if ("key" in e && e.key !== "Enter") return;
      if ("key" in e && e.shiftKey) return; // Allow shift+enter for new line
      e.preventDefault();
    }

    if (!commentContent.trim() && !commentImage) return;

    try {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", commentContent);
      if (commentImage) {
        formData.append("image", commentImage);
      }

      await api.post("/comments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setCommentContent("");
      setCommentImage(null);
      setCommentImagePreview("");
      loadComments();
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleReplySubmit = async (
    commentId: string,
    e?: React.FormEvent | React.KeyboardEvent
  ) => {
    if (e) {
      if ("key" in e && e.key !== "Enter") return;
      if ("key" in e && e.shiftKey) return;
      e.preventDefault();
    }

    const content = replyContent[commentId];
    if (!content?.trim() && !replyImage[commentId]) return;

    try {
      const formData = new FormData();
      formData.append("content", content || "");
      if (replyImage[commentId]) {
        formData.append("image", replyImage[commentId]!);
      }

      await api.post(`/comments/${commentId}/reply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setReplyContent({ ...replyContent, [commentId]: "" });
      setReplyImage({ ...replyImage, [commentId]: null });
      setReplyImagePreview({ ...replyImagePreview, [commentId]: "" });
      loadComments();
      toast.success("Reply added!");
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const handleReaction = async (
    commentId: string,
    reactionType: "like" | "love" | "haha" | "sad" | "care" | "angry"
  ) => {
    try {
      await api.post(`/comments/${commentId}/like`, { reactionType });
      setShowReactionPicker({ ...showReactionPicker, [commentId]: false });
      loadComments();
    } catch (error) {
      toast.error("Failed to react to comment");
    }
  };

  const handleMouseEnterReaction = (commentId: string) => {
    if (hideTimeout[commentId]) {
      clearTimeout(hideTimeout[commentId]!);
      setHideTimeout({ ...hideTimeout, [commentId]: null });
    }
    setShowReactionPicker({ ...showReactionPicker, [commentId]: true });
  };

  const handleMouseLeaveReaction = (commentId: string) => {
    const timeout = setTimeout(() => {
      setShowReactionPicker({ ...showReactionPicker, [commentId]: false });
    }, 500);
    setHideTimeout({ ...hideTimeout, [commentId]: timeout });
  };

  const toggleReplies = (commentId: string) => {
    const isOpening = !showReplies[commentId];
    setShowReplies({ ...showReplies, [commentId]: isOpening });
    if (isOpening) {
      setTimeout(() => {
        replyInputRefs.current[commentId]?.focus();
      }, 0);
    }
  };

  const getReactionIcon = (type: string, size: number = 16) => {
    const width = size;
    const height = size;

    switch (type) {
      case "like":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="#1877F2"
          >
            <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
          </svg>
        );
      case "love":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 19 19"
            fill="none"
          >
            <path
              fill="#F33E58"
              d="M9.5 17.5c-.2 0-.4-.1-.5-.2-1.6-1.4-3-2.6-4.1-3.7-1.5-1.4-2.6-2.6-3.3-3.5C.6 8.9.2 7.8.2 6.6c0-1.2.4-2.2 1.2-3 .8-.8 1.8-1.2 3-1.2 1 0 1.9.3 2.6.9.4.3.7.7 1 1.1.3-.4.6-.8 1-1.1.7-.6 1.6-.9 2.6-.9 1.2 0 2.2.4 3 1.2.8.8 1.2 1.8 1.2 3 0 1.2-.4 2.3-1.3 3.5-.7.9-1.8 2.1-3.3 3.5-1.1 1.1-2.5 2.3-4.1 3.7-.1.1-.3.2-.5.2z"
            />
          </svg>
        );
      case "haha":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 19 19"
          >
            <path
              fill="#FFCC4D"
              d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"
            />
            <path
              fill="#664500"
              d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
            />
            <path
              fill="#fff"
              d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"
            />
            <path
              fill="#664500"
              d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
            />
          </svg>
        );
      case "sad":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 19 19"
          >
            <path
              fill="#FFCC4D"
              d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"
            />
            <path
              fill="#5DADEC"
              d="M6.527 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.473 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
            />
            <path
              fill="#664500"
              d="M4.75 13.417c0-.359.698-.359 1.056-.289 1.569.305 2.838.527 4.75.527s3.181-.222 4.75-.527c.358-.07 1.056-.07 1.056.289 0 1.055-2.425 2.638-5.806 2.638-3.38 0-5.806-1.583-5.806-2.638z"
            />
            <path
              fill="#5DADEC"
              d="M6.916 12.4a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.084 12.4a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        );
      case "care":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 19 19"
          >
            <path
              fill="#FFCC4D"
              d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"
            />
            <path
              fill="#F4900C"
              d="M9.5 3.167c-3.5 0-6.333 2.833-6.333 6.333h1.583c0-2.617 2.133-4.75 4.75-4.75 2.617 0 4.75 2.133 4.75 4.75h1.583c0-3.5-2.833-6.333-6.333-6.333z"
            />
            <path
              fill="#F33E58"
              d="M12.667 10.292c0 1.75-1.417 3.166-3.167 3.166-1.75 0-3.167-1.416-3.167-3.166h6.334z"
            />
            <path
              fill="#664500"
              d="M7.125 8.208c.438 0 .792-.354.792-.791a.792.792 0 00-1.584 0c0 .437.355.791.792.791zM11.875 8.208c.438 0 .792-.354.792-.791a.792.792 0 00-1.584 0c0 .437.355.791.792.791z"
            />
          </svg>
        );
      case "angry":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill="none"
            viewBox="0 0 19 19"
          >
            <path
              fill="#F4900C"
              d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"
            />
            <path
              fill="#664500"
              d="M6.333 9.5c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847S5.604 9.5 6.333 9.5zM12.667 9.5c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
            />
            <path
              fill="#664500"
              d="M5.542 6.333L7.917 7.125 5.542 5.542zM13.458 6.333L11.083 7.125l2.375-1.583z"
            />
            <path
              fill="#664500"
              d="M9.5 14.25c1.912 0 3.181-.222 4.75-.527.358-.07 1.056 0 1.056 1.055 0 2.111-2.425 4.75-5.806 4.75-3.38 0-5.806-2.639-5.806-4.75 0-1.055.698-1.125 1.056-1.055 1.57.305 2.838.527 4.75.527z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getReactionText = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diff = Math.floor(
      (now.getTime() - commentDate.getTime()) / 1000 / 60
    );

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}d`;
    return commentDate.toLocaleDateString();
  };

  // Get reaction summary for display
  const getReactionSummary = (comment: Comment) => {
    if (!comment.reactions || comment.reactions.length === 0) {
      return null;
    }

    const reactionCounts: { [key: string]: number } = {};
    comment.reactions.forEach((reaction) => {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
    });

    const topReactions = Object.entries(reactionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      types: topReactions.map(([type]) => type),
      total: comment.reactions.length,
    };
  };

  const visibleComments = showAllComments ? comments : comments.slice(-2);
  const hiddenCommentsCount = comments.length - 2;

  return (
    <div className="_feed_inner_timeline_cooment_area">
      {/* Add Comment Box */}
      <div className="_feed_inner_comment_box">
        <form
          className="_feed_inner_comment_box_form"
          onSubmit={handleCommentSubmit}
        >
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <img
                src={user?.profilePicture || "assets/images/comment_img.png"}
                alt=""
                className="_comment_img"
              />
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              <textarea
                ref={commentInputRef}
                className="form-control _comment_textarea"
                placeholder="Write a comment"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleCommentSubmit(e);
                  }
                }}
                id="floatingTextarea1"
              />
              {commentImagePreview && (
                <div style={{ position: "relative", marginTop: "10px" }}>
                  <img
                    src={commentImagePreview}
                    alt="Preview"
                    style={{ maxWidth: "200px", borderRadius: "8px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCommentImage(null);
                      setCommentImagePreview("");
                    }}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="_feed_inner_comment_box_icon">
            <button className="_feed_inner_comment_box_icon_btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  fill="#000"
                  fill-opacity=".46"
                  fill-rule="evenodd"
                  d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <input
              type="file"
              ref={commentImageInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleCommentImageChange}
            />
            <button
              type="button"
              className="_feed_inner_comment_box_icon_btn"
              onClick={() => commentImageInputRef.current?.click()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  fill="#000"
                  fill-opacity=".46"
                  fill-rule="evenodd"
                  d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="_timline_comment_main">
          {/* View Previous Comments Button */}
          {!showAllComments && hiddenCommentsCount > 0 && (
            <div className="_previous_comment">
              <button
                type="button"
                className="_previous_comment_txt"
                onClick={() => setShowAllComments(true)}
              >
                View {hiddenCommentsCount} previous comment
                {hiddenCommentsCount > 1 ? "s" : ""}
              </button>
            </div>
          )}

          {/* Render Comments */}
          {visibleComments.map((comment) => {
            const userReaction = comment.reactions?.find(
              (r) => r.user._id === user?.id
            );
            const reactionSummary = getReactionSummary(comment);

            return (
              <div key={comment._id} className="_comment_main">
                <div className="_comment_image">
                  <a href="#" className="_comment_image_link">
                    <img
                      src={comment.author.profilePicture}
                      alt=""
                      className="_comment_img1"
                    />
                  </a>
                </div>
                <div className="_comment_area">
                  <div className="_comment_details">
                    <div className="_comment_details_top">
                      <div className="_comment_name">
                        <a href="#">
                          <h4 className="_comment_name_title">
                            {comment.author.firstName} {comment.author.lastName}
                          </h4>
                        </a>
                      </div>
                    </div>
                    <div className="_comment_status">
                      <p className="_comment_status_text">
                        <span>{comment.content}</span>
                      </p>
                      {comment.image && (
                        <div style={{ marginTop: "8px" }}>
                          <img
                            src={`http://localhost:8000${comment.image}`}
                            alt=""
                            style={{ maxWidth: "300px", borderRadius: "8px" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Reaction Summary */}
                    {reactionSummary && (
                      <div className="_total_reactions">
                        <div className="_total_react">
                          {reactionSummary.types.map((type, index) => (
                            <span key={index} className={`_reaction_${type}`}>
                              {getReactionIcon(type, 16)}
                            </span>
                          ))}
                        </div>
                        <span className="_total">{reactionSummary.total}</span>
                      </div>
                    )}

                    {/* Comment Actions */}
                    <div className="_comment_reply">
                      <div className="_comment_reply_num">
                        <ul className="_comment_reply_list">
                          <li style={{ position: "relative" }}>
                            <span
                              style={{
                                cursor: "pointer",
                                fontWeight: userReaction ? "bold" : "",
                                color: userReaction ? "#1877F2" : "inherit",
                              }}
                              onMouseEnter={() =>
                                handleMouseEnterReaction(comment._id)
                              }
                              onMouseLeave={() =>
                                handleMouseLeaveReaction(comment._id)
                              }
                            >
                              {userReaction
                                ? getReactionText(userReaction.type)
                                : "Like."}
                            </span>

                            {/* Reaction Picker for Comment */}
                            {showReactionPicker[comment._id] && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "100%",
                                  left: "0",
                                  backgroundColor: "white",
                                  borderRadius: "25px",
                                  padding: "8px 12px",
                                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                                  display: "flex",
                                  gap: "8px",
                                  marginBottom: "8px",
                                  zIndex: 1000,
                                }}
                                onMouseEnter={() =>
                                  handleMouseEnterReaction(comment._id)
                                }
                                onMouseLeave={() =>
                                  handleMouseLeaveReaction(comment._id)
                                }
                              >
                                {[
                                  "like",
                                  "love",
                                  "haha",
                                  "sad",
                                  "care",
                                  "angry",
                                ].map((reactionType) => (
                                  <button
                                    key={reactionType}
                                    onClick={() =>
                                      handleReaction(
                                        comment._id,
                                        reactionType as "like" | "love" | "haha" | "sad" | "care" | "angry"
                                      )
                                    }
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "4px",
                                      transform: "scale(1)",
                                      transition: "transform 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform =
                                        "scale(1.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform =
                                        "scale(1)";
                                    }}
                                    title={getReactionText(reactionType)}
                                  >
                                    {getReactionIcon(reactionType, 19)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </li>
                          <li>
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={() => toggleReplies(comment._id)}
                            >
                              Reply.
                            </span>
                          </li>
                          <li>
                            <span>Share</span>
                          </li>
                          <li>
                            <span className="_time_link">
                              {formatDate(comment.createdAt)}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Reply Box */}
                  {showReplies[comment._id] && (
                    <div className="_feed_inner_comment_box">
                      <form
                        className="_feed_inner_comment_box_form"
                        onSubmit={(e) => handleReplySubmit(comment._id, e)}
                      >
                        <div className="_feed_inner_comment_box_content">
                          <div className="_feed_inner_comment_box_content_image">
                            <img
                              src={
                                user?.profilePicture ||
                                "assets/images/comment_img.png"
                              }
                              alt=""
                              className="_comment_img"
                            />
                          </div>
                          <div className="_feed_inner_comment_box_content_txt">
                            <textarea
                              ref={(el) => {
                                replyInputRefs.current[comment._id] = el;
                              }}
                              className="form-control _comment_textarea"
                              placeholder="Write a reply"
                              value={replyContent[comment._id] || ""}
                              onChange={(e) =>
                                setReplyContent({
                                  ...replyContent,
                                  [comment._id]: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  handleReplySubmit(comment._id, e);
                                }
                              }}
                            />
                            {replyImagePreview[comment._id] && (
                              <div
                                style={{
                                  position: "relative",
                                  marginTop: "10px",
                                }}
                              >
                                <img
                                  src={replyImagePreview[comment._id]}
                                  alt="Preview"
                                  style={{
                                    maxWidth: "200px",
                                    borderRadius: "8px",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyImage({
                                      ...replyImage,
                                      [comment._id]: null,
                                    });
                                    setReplyImagePreview({
                                      ...replyImagePreview,
                                      [comment._id]: "",
                                    });
                                  }}
                                  style={{
                                    position: "absolute",
                                    top: "5px",
                                    right: "5px",
                                    background: "rgba(0,0,0,0.6)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="_feed_inner_comment_box_icon">
                          <input
                            type="file"
                            ref={(el) => {
                              replyImageInputRefs.current[comment._id] = el;
                            }}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={(e) =>
                              handleReplyImageChange(comment._id, e)
                            }
                          />
                          <button className="_feed_inner_comment_box_icon_btn">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fill="#000"
                                fill-opacity=".46"
                                fill-rule="evenodd"
                                d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="_feed_inner_comment_box_icon_btn"
                            onClick={() =>
                              replyImageInputRefs.current[comment._id]?.click()
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fill="#000"
                                fillOpacity=".46"
                                fillRule="evenodd"
                                d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Display Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div style={{ marginTop: "16px", paddingLeft: "20px" }}>
                      {comment.replies.map((reply) => (
                        <div
                          key={reply._id}
                          style={{
                            marginBottom: "12px",
                            display: "flex",
                            gap: "12px",
                          }}
                        >
                          <img
                            src={reply.author.profilePicture}
                            alt=""
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                background: "#f0f2f5",
                                padding: "8px 12px",
                                borderRadius: "18px",
                              }}
                            >
                              <h5
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  margin: "0 0 4px 0",
                                }}
                              >
                                {reply.author.firstName} {reply.author.lastName}
                              </h5>
                              <p style={{ fontSize: "13px", margin: 0 }}>
                                {reply.content}
                              </p>
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#65676b",
                                marginTop: "4px",
                                paddingLeft: "12px",
                              }}
                            >
                              {formatDate(reply.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default Comments;
