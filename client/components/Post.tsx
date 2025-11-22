"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

interface Comment {
  _id: string;
  content: string;
  author: User;
  likes: User[];
  replies: Reply[];
  createdAt: string;
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

interface PostType {
  _id: string;
  content: string;
  image?: string;
  author: User;
  likes: User[];
  reactions: Reaction[];
  isPrivate: boolean;
  createdAt: string;
}

interface PostProps {
  post: PostType;
  onUpdate: () => void;
}

export default function Post({ post, onUpdate }: PostProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>(
    {}
  );
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showLikes, setShowLikes] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Find user's reaction if any
  const userReaction = post.reactions?.find(
    (reaction) => reaction.user._id === user?.id
  );
  const isLiked = post.likes.some((like) => like._id === user?.id);

  const loadComments = async () => {
    try {
      const response = await api.get(`/comments/post/${post._id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error("Failed to load comments");
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const handleReaction = async (
    reactionType: "like" | "love" | "haha" | "sad" | "care" | "angry"
  ) => {
    try {
      await api.post(`/posts/${post._id}/like`, { reactionType });
      setShowReactionPicker(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to react to post");
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
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
            width="19"
            height="19"
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
            width="19"
            height="19"
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
            width="19"
            height="19"
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
            width="19"
            height="19"
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
            width="19"
            height="19"
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

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await api.post("/comments", {
        postId: post._id,
        content: commentContent,
      });
      setCommentContent("");
      loadComments();
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await api.post(`/comments/${commentId}/like`);
      loadComments();
    } catch (error) {
      toast.error("Failed to like comment");
    }
  };

  const handleReply = async (commentId: string) => {
    const content = replyContent[commentId];
    if (!content?.trim()) return;

    try {
      await api.post(`/comments/${commentId}/reply`, { content });
      setReplyContent({ ...replyContent, [commentId]: "" });
      loadComments();
      toast.success("Reply added!");
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const handleLikeReply = async (replyId: string) => {
    try {
      await api.post(`/comments/reply/${replyId}/like`);
      loadComments();
    } catch (error) {
      toast.error("Failed to like reply");
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000 / 60);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} minute${diff > 1 ? "s" : ""} ago`;
    if (diff < 1440)
      return `${Math.floor(diff / 60)} hour${
        Math.floor(diff / 60) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(diff / 1440)} day${
      Math.floor(diff / 1440) > 1 ? "s" : ""
    } ago`;
  };

  const handleEditPost = async () => {
    if (!editContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    try {
      await api.put(`/posts/${post._id}`, { content: editContent });
      toast.success("Post updated successfully!");
      setIsEditing(false);
      setShowDropdown(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update post");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await api.delete(`/posts/${post._id}`);
      toast.success("Post deleted successfully!");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete post");
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const isOwnPost = user?.id === post.author._id;

  console.log(
    "post author ID:",
    post.author._id,
    "Current user ID:",
    user?.id,
    isOwnPost
  );

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img
                src={post.author.profilePicture}
                alt=""
                className="_post_img"
              />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author.firstName} {post.author.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatDate(post.createdAt)} ·{" "}
                <a href="#0">{post.isPrivate ? "Private" : "Public"}</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button
                className="_feed_timeline_post_dropdown_link"
                onClick={toggleDropdown}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="4"
                  height="17"
                  fill="none"
                  viewBox="0 0 4 17"
                >
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>

            <div
              className={`_feed_timeline_dropdown ${
                showDropdown ? "show" : ""
              }`}
              style={{
                opacity: showDropdown ? 1 : 0,
                visibility: showDropdown ? "visible" : "hidden",
              }}
            >
              <ul className="_feed_timeline_dropdown_list">
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 18 18"
                      >
                        <path
                          stroke="#1890FF"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.2"
                          d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z"
                        />
                      </svg>
                    </span>
                    Save Post
                  </a>
                </li>
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="22"
                        fill="none"
                        viewBox="0 0 20 22"
                      >
                        <path
                          fill="#377DFF"
                          fill-rule="evenodd"
                          d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                    Turn On Notification
                  </a>
                </li>
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 18 18"
                      >
                        <path
                          stroke="#1890FF"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.2"
                          d="M14.25 2.25H3.75a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V3.75a1.5 1.5 0 00-1.5-1.5zM6.75 6.75l4.5 4.5M11.25 6.75l-4.5 4.5"
                        />
                      </svg>
                    </span>
                    Hide
                  </a>
                </li>
                {isOwnPost && (
                  <>
                    <li className="_feed_timeline_dropdown_item">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowDropdown(false);
                        }}
                        className="_feed_timeline_dropdown_link"
                        style={{
                          background: "none",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="none"
                            viewBox="0 0 18 18"
                          >
                            <path
                              stroke="#1890FF"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.2"
                              d="M8.25 3H3a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75"
                            />
                            <path
                              stroke="#1890FF"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.2"
                              d="M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z"
                            />
                          </svg>
                        </span>
                        Edit Post
                      </button>
                    </li>
                    <li className="_feed_timeline_dropdown_item">
                      <button
                        onClick={handleDeletePost}
                        className="_feed_timeline_dropdown_link"
                        style={{
                          background: "none",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="none"
                            viewBox="0 0 18 18"
                          >
                            <path
                              stroke="#1890FF"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.2"
                              d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5"
                            />
                          </svg>
                        </span>
                        Delete Post
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
        {isEditing ? (
          <div className="_mar_b16">
            <textarea
              className="form-control _textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              style={{ marginBottom: "10px" }}
            />
            <button
              className="btn btn-primary btn-sm _mar_r8"
              onClick={handleEditPost}
            >
              Save
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
        )}
        {post.image && (
          <div className="_feed_inner_timeline_image">
            <img
              src={`http://localhost:8000${post.image}`}
              alt=""
              className="_time_img"
            />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          <img
            src="assets/images/react_img1.png"
            alt="Image"
            className="_react_img1"
          />
          <img
            src="assets/images/react_img2.png"
            alt="Image"
            className="_react_img"
          />
          <img
            src="assets/images/react_img3.png"
            alt="Image"
            className="_react_img _rect_img_mbl_none"
          />
          <img
            src="assets/images/react_img4.png"
            alt="Image"
            className="_react_img _rect_img_mbl_none"
          />
          <img
            src="assets/images/react_img5.png"
            alt="Image"
            className="_react_img _rect_img_mbl_none"
          />
          <p className="_feed_inner_timeline_total_reacts_para">
            {post.reactions?.length || post.likes.length > 0
              ? `${post.reactions?.length || post.likes.length}`
              : ""}
          </p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <span>12</span> Comment
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>122</span> Share
          </p>
        </div>
      </div>

      <div
        className="_feed_inner_timeline_reaction"
        style={{ position: "relative" }}
      >
        <div
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${
            userReaction || isLiked ? "_feed_reaction_active" : ""
          }`}
          style={{ position: "relative"}}
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <div onClick={() => handleReaction(userReaction?.type || "like")}>
            <span className="_feed_inner_timeline_reaction_link">
              <span>
                {userReaction ? (
                  getReactionIcon(userReaction.type)
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill={isLiked ? "#1877F2" : "currentColor"}
                  >
                    <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
                  </svg>
                )}
                {userReaction ? getReactionText(userReaction.type) : "Like"}
              </span>
            </span>
          </div>

          {/* Reaction Picker */}
          {showReactionPicker && (
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
            >
              {["like", "love", "haha", "sad", "care", "angry"].map(
                (reactionType) => (
                  <button
                    key={reactionType}
                    onClick={() => handleReaction(reactionType as any)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      transform: "scale(1)",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    title={getReactionText(reactionType)}
                  >
                    {getReactionIcon(reactionType)}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <button className="_feed_inner_timeline_reaction_comment _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            {" "}
            <span>
              <svg
                className="_reaction_svg"
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                fill="none"
                viewBox="0 0 21 21"
              >
                <path
                  stroke="#000"
                  d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"
                ></path>
                <path
                  stroke="#000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.938 9.313h7.125M10.5 14.063h3.563"
                ></path>
              </svg>
              Comment
            </span>
          </span>
        </button>
        <button className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            {" "}
            <span>
              <svg
                className="_reaction_svg"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="21"
                fill="none"
                viewBox="0 0 24 21"
              >
                <path
                  stroke="#000"
                  stroke-linejoin="round"
                  d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"
                ></path>
              </svg>
              Share
            </span>
          </span>
        </button>
      </div>

      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <form className="_feed_inner_comment_box_form">
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img
                  src="assets/images/comment_img.png"
                  alt=""
                  className="_comment_img"
                />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea
                  className="form-control _comment_textarea"
                  placeholder="Write a comment"
                  id="floatingTextarea1"
                ></textarea>
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
                    d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="_timline_comment_main">
        <div className="_previous_comment">
          <button type="button" className="_previous_comment_txt">
            View 4 previous comments
          </button>
        </div>
        <div className="_comment_main">
          <div className="_comment_image">
            <a href="profile.html" className="_comment_image_link">
              <img
                src="assets/images/txt_img.png"
                alt=""
                className="_comment_img1"
              />
            </a>
          </div>
          <div className="_comment_area">
            <div className="_comment_details">
              <div className="_comment_details_top">
                <div className="_comment_name">
                  <a href="profile.html ">
                    <h4 className="_comment_name_title">Radovan SkillArena</h4>
                  </a>
                </div>
              </div>
              <div className="_comment_status">
                <p className="_comment_status_text">
                  <span>
                    It is a long established fact that a reader will be
                    distracted by the readable content of a page when looking at
                    its layout.{" "}
                  </span>
                </p>
              </div>
              <div className="_total_reactions">
                <div className="_total_react">
                  <span className="_reaction_like">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-thumbs-up"
                    >
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  </span>
                  <span className="_reaction_heart">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-heart"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </span>
                </div>
                <span className="_total">198</span>
              </div>
              <div className="_comment_reply">
                <div className="_comment_reply_num">
                  <ul className="_comment_reply_list">
                    <li>
                      <span>Like.</span>
                    </li>
                    <li>
                      <span>Reply.</span>
                    </li>
                    <li>
                      <span>Share</span>
                    </li>
                    <li>
                      <span className="_time_link">.21m</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="_feed_inner_comment_box">
              <form className="_feed_inner_comment_box_form">
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <img
                      src="assets/images/comment_img.png"
                      alt=""
                      className="_comment_img"
                    />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a comment"
                      id="floatingTextarea2"
                    ></textarea>
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
                      ></path>
                    </svg>
                  </button>
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
                        d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
