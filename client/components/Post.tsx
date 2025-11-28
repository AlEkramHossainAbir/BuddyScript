"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import Comments, { CommentsHandle } from "./Comments";
import { ReactionBarSelector } from "@charkour/react-reactions";
import ReactorsModal from "./ReactorsModal";
import ConfirmModal from "./ConfirmModal";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

interface Reaction {
  user: User;
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
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
  onPostUpdate?: (postId: string, updatedPost: PostType) => void;
}

export default function Post({ post, onUpdate, onPostUpdate }: PostProps) {
  const { user } = useAuth();
  const commentsRef = useRef<CommentsHandle>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [showReactorsModal, setShowReactorsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  // Update local post when prop changes
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const handleFocusComment = () => {
    commentsRef.current?.focusInput();
  };

  // Find user's reaction if any
  const userReaction = localPost.reactions?.find(
    (reaction) => reaction.user._id === user?.id
  );
  const isLiked = localPost.likes.some((like) => like._id === user?.id);

  const handleReaction = async (
    reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry"
  ) => {
    try {
      // Optimistic update - update UI immediately
      const optimisticReactions = [...(localPost.reactions || [])];
      const existingReactionIndex = optimisticReactions.findIndex(
        (r) => r.user._id === user?.id
      );

      if (existingReactionIndex !== -1) {
        // User already reacted, update or remove
        if (optimisticReactions[existingReactionIndex].type === reactionType) {
          // Same reaction - remove it (toggle off)
          optimisticReactions.splice(existingReactionIndex, 1);
        } else {
          // Different reaction - update it
          optimisticReactions[existingReactionIndex] = {
            ...optimisticReactions[existingReactionIndex],
            type: reactionType,
          };
        }
      } else {
        // New reaction - add it
        optimisticReactions.push({
          user: {
            _id: user!.id,
            firstName: user!.firstName,
            lastName: user!.lastName,
            profilePicture: user!.profilePicture,
          },
          type: reactionType,
        });
      }

      // Update local state immediately
      const optimisticPost = {
        ...localPost,
        reactions: optimisticReactions,
      };
      setLocalPost(optimisticPost);
      setShowReactionPicker(false);

      // Make API call
      const response = await api.post(`/posts/${localPost._id}/like`, { reactionType });
      
      // Update with server response if callback provided
      if (onPostUpdate && response.data.post) {
        onPostUpdate(localPost._id, response.data.post);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalPost(post);
      toast.error("Failed to react to post");
    }
  };

  const getReactionText = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleMouseEnterReaction = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setShowReactionPicker(true);
  };

  const handleMouseLeaveReaction = () => {
    const timeout = setTimeout(() => {
      setShowReactionPicker(false);
    }, 500); // 500ms delay before hiding
    setHideTimeout(timeout);
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000 / 60);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} minute${diff > 1 ? "s" : ""} ago`;
    if (diff < 1440)
      return `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) > 1 ? "s" : ""
        } ago`;
    return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? "s" : ""
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to update post");
    }
  };

  const confirmDeletePost = async () => {
    setShowDeleteConfirm(false);
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success("Post deleted successfully!");
      onUpdate();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to delete post");
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const isOwnPost = user?.id === localPost.author._id;

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img
                src={localPost.author.profilePicture}
                alt=""
                className="_post_img"
              />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {localPost.author.firstName} {localPost.author.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatDate(localPost.createdAt)} ·{" "}
                <a href="#0">{localPost.isPrivate ? "Private" : "Public"}</a>
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
              className={`_feed_timeline_dropdown ${showDropdown ? "show" : ""
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
                          fillRule="evenodd"
                          d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z"
                          clipRule="evenodd"
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.2"
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
                        onClick={() => {
                          setShowDeleteConfirm(true);
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
                setEditContent(localPost.content);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <h4 className="_feed_inner_timeline_post_title">{localPost.content}</h4>
        )}
        {localPost.image && (
          <div className="_feed_inner_timeline_image">
            <img
              src={localPost.image.startsWith('http') ? localPost.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${localPost.image}`}
              alt=""
              className="_time_img"
            />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div 
          className="_feed_inner_timeline_total_reacts_image"
          onClick={() => post.reactions && post.reactions.length > 0 && setShowReactorsModal(true)}
          style={{ cursor: post.reactions && post.reactions.length > 0 ? 'pointer' : 'default' }}
        >
          {(() => {
            // Get unique users who reacted or liked
            const uniqueUsers = new Map<string, User>();

            localPost.reactions?.forEach(r => uniqueUsers.set(r.user._id, r.user));
            localPost.likes?.forEach(l => uniqueUsers.set(l._id, l));

            const users = Array.from(uniqueUsers.values()).slice(0, 5);
            const totalCount = uniqueUsers.size;

            return (
              <>
                {users.map((u, index) => (
                  <img
                    key={u._id}
                    src={u.profilePicture}
                    alt={`${u.firstName} ${u.lastName}`}
                    className={`_react_img ${index === 0 ? '_react_img1' : ''} ${index > 1 ? '_rect_img_mbl_none' : ''}`}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      marginLeft: index === 0 ? '0' : '-8px',
                      objectFit: 'cover',
                      display: index > 4 ? 'none' : 'block'
                    }}
                  />
                ))}
                {
                  totalCount > 5 && (
                    <p className="_feed_inner_timeline_total_reacts_para">
                      {totalCount - 5}+
                    </p>
                  )
                }

              </>
            );
          })()}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p
            className="_feed_inner_timeline_total_reacts_para1"
            onClick={handleFocusComment}
            style={{ cursor: "pointer" }}
          >
            <span>{commentCount}</span> Comment
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
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${userReaction || isLiked ? "_feed_reaction_active" : ""
            }`}
          style={{ position: "relative" }}
          onMouseEnter={handleMouseEnterReaction}
          onMouseLeave={handleMouseLeaveReaction}
        >
          <div onClick={() => {
            handleReaction(userReaction?.type as "like" | "love" | "haha" | "wow" | "sad" | "angry");
          }}>
            <span className="_feed_inner_timeline_reaction_link">
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {userReaction ? (
                  <span style={{ fontSize: "16px" }}>
                    {userReaction.type === "like" && "👍"}
                    {userReaction.type === "love" && "❤️"}
                    {userReaction.type === "haha" && "😂"}
                    {userReaction.type === "wow" && "😮"}
                    {userReaction.type === "sad" && "😢"}
                    {userReaction.type === "angry" && "😠"}
                  </span>
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
                <span>{userReaction ? getReactionText(userReaction.type) : "Like"}</span>
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
                marginBottom: "8px",
                zIndex: 1000,
              }}
              onMouseEnter={handleMouseEnterReaction}
              onMouseLeave={handleMouseLeaveReaction}
            >
              <div style={{ fontSize: "20px", transform: "scale(0.85)" }}>
                <ReactionBarSelector
                  reactions={[
                    { label: "like", node: <div style={{ fontSize: "24px" }}>👍</div>, key: "like" },
                    { label: "love", node: <div style={{ fontSize: "24px" }}>❤️</div>, key: "love" },
                    { label: "haha", node: <div style={{ fontSize: "24px" }}>😂</div>, key: "haha" },
                    { label: "wow", node: <div style={{ fontSize: "24px" }}>😮</div>, key: "wow" },
                    { label: "sad", node: <div style={{ fontSize: "24px" }}>😢</div>, key: "sad" },
                    { label: "angry", node: <div style={{ fontSize: "24px" }}>😠</div>, key: "angry" },
                  ]}
                  onSelect={(key) => handleReaction(key as "like" | "love" | "haha" | "wow" | "sad" | "angry")}
                />
              </div>
            </div>
          )}
        </div>

        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={handleFocusComment}
        >
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
                  strokeLinejoin="round"
                  d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"
                ></path>
              </svg>
              Share
            </span>
          </span>
        </button>
      </div>

      <Comments postId={localPost._id} ref={commentsRef} onCommentsCountChange={setCommentCount} />

      {/* Reactors Modal */}
      {showReactorsModal && localPost.reactions && localPost.reactions.length > 0 && (
        <ReactorsModal
          reactions={localPost.reactions}
          onClose={() => setShowReactorsModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDeletePost}
          onCancel={() => setShowDeleteConfirm(false)}
          danger={true}
        />
      )}
    </div>
  );
}
