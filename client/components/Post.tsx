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

interface PostType {
  _id: string;
  content: string;
  image?: string;
  author: User;
  likes: User[];
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

  const handleLike = async () => {
    try {
      await api.post(`/posts/${post._id}/like`);
      onUpdate();
    } catch (error) {
      toast.error("Failed to like post");
    }
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
        </div>
        <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
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
          <p className="_feed_inner_timeline_total_reacts_para">9+</p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <span>12</span> Comment
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>122</span> Share
          </p>
        </div>
        <div
          className="_feed_inner_timeline_total_reacts_image"
          style={{ cursor: "pointer" }}
          onClick={() => setShowLikes(!showLikes)}
        >
          {post.likes.length > 0 && (
            <>
              <img
                src="/assets/images/react_img1.png"
                alt="Image"
                className="_react_img1"
              />
              <p className="_feed_inner_timeline_total_reacts_para">
                {post.likes.length}
              </p>
            </>
          )}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p
            className="_feed_inner_timeline_total_reacts_para1"
            style={{ cursor: "pointer" }}
            onClick={() => setShowComments(!showComments)}
          >
            <span>{comments.length}</span> Comment
            {comments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {showLikes && post.likes.length > 0 && (
        <div className="_padd_r24 _padd_l24 _mar_b16">
          <strong>Liked by:</strong>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {post.likes.map((like) => (
              <li key={like._id}>
                {like.firstName} {like.lastName}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="_feed_inner_timeline_reaction">
        <button className="_feed_inner_timeline_reaction_emoji _feed_reaction _feed_reaction_active">
          <span className="_feed_inner_timeline_reaction_link">
            {" "}
            <span>
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
                ></path>
                <path
                  fill="#664500"
                  d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
                ></path>
                <path
                  fill="#fff"
                  d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"
                ></path>
                <path
                  fill="#664500"
                  d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
                ></path>
              </svg>
              Haha
            </span>
          </span>
        </button>
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
      <div className="_feed_inner_timeline_reaction">
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${
            isLiked ? "_feed_reaction_active" : ""
          }`}
          onClick={handleLike}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>{isLiked ? "Unlike" : "Like"}</span>
          </span>
        </button>
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>Comment</span>
          </span>
        </button>
      </div>

      <div className="_feed_inner_timeline_cooment_area">
											<div className="_feed_inner_comment_box">
												<form className="_feed_inner_comment_box_form">
													<div className="_feed_inner_comment_box_content">
														<div className="_feed_inner_comment_box_content_image">
															<img src="assets/images/comment_img.png" alt="" className="_comment_img" />
														</div>
														<div className="_feed_inner_comment_box_content_txt">
															<textarea className="form-control _comment_textarea" placeholder="Write a comment" id="floatingTextarea1"></textarea>
														</div>
													</div>
													<div className="_feed_inner_comment_box_icon">
														<button className="_feed_inner_comment_box_icon_btn">
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
																<path fill="#000" fill-opacity=".46" fill-rule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clip-rule="evenodd" />
															</svg>
														</button>
														<button className="_feed_inner_comment_box_icon_btn">
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
																<path fill="#000" fill-opacity=".46" fill-rule="evenodd" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z" clip-rule="evenodd" />
															</svg>
														</button>
													</div>
												</form>
											</div>
										</div>

      {showComments && (
        <>
          <div className="_feed_inner_timeline_cooment_area">
            <div className="_feed_inner_comment_box">
              <form
                className="_feed_inner_comment_box_form"
                onSubmit={handleComment}
              >
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <img
                      src={user?.profilePicture}
                      alt=""
                      className="_comment_img"
                    />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a comment"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" style={{ display: "none" }}>
                  Submit
                </button>
              </form>
            </div>
          </div>

          {comments.map((comment) => {
            const isCommentLiked = comment.likes.some(
              (like) => like._id === user?.id
            );

            return (
              <div
                key={comment._id}
                className="_timline_comment_main _padd_r24 _padd_l24"
              >
                <div className="_comment_main">
                  <div className="_comment_image">
                    <img
                      src={comment.author.profilePicture}
                      alt=""
                      className="_comment_img1"
                    />
                  </div>
                  <div className="_comment_area">
                    <div className="_comment_details">
                      <div className="_comment_details_top">
                        <div className="_comment_name">
                          <h4 className="_comment_name_title">
                            {comment.author.firstName} {comment.author.lastName}
                          </h4>
                        </div>
                      </div>
                      <div className="_comment_status">
                        <p className="_comment_status_text">
                          <span>{comment.content}</span>
                        </p>
                      </div>
                      {comment.likes.length > 0 && (
                        <div className="_total_reactions">
                          <div className="_total_react">
                            <span>{comment.likes.length}</span>
                          </div>
                        </div>
                      )}
                      <div className="_comment_reply">
                        <div className="_comment_reply_num">
                          <ul className="_comment_reply_list">
                            <li>
                              <span
                                style={{ cursor: "pointer" }}
                                onClick={() => handleLikeComment(comment._id)}
                              >
                                {isCommentLiked ? "Unlike" : "Like"}
                              </span>
                            </li>
                            <li>
                              <span
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setShowReplies({
                                    ...showReplies,
                                    [comment._id]: !showReplies[comment._id],
                                  })
                                }
                              >
                                Reply
                              </span>
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

                    {showReplies[comment._id] && (
                      <div className="_feed_inner_comment_box _mar_t16">
                        <form
                          className="_feed_inner_comment_box_form"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleReply(comment._id);
                          }}
                        >
                          <div className="_feed_inner_comment_box_content">
                            <div className="_feed_inner_comment_box_content_image">
                              <img
                                src={user?.profilePicture}
                                alt=""
                                className="_comment_img"
                              />
                            </div>
                            <div className="_feed_inner_comment_box_content_txt">
                              <textarea
                                className="form-control _comment_textarea"
                                placeholder="Write a reply"
                                value={replyContent[comment._id] || ""}
                                onChange={(e) =>
                                  setReplyContent({
                                    ...replyContent,
                                    [comment._id]: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                    )}

                    {comment.replies.map((reply) => {
                      const isReplyLiked = reply.likes.some(
                        (like) => like._id === user?.id
                      );

                      return (
                        <div
                          key={reply._id}
                          className="_comment_main _mar_t16 _mar_l24"
                        >
                          <div className="_comment_image">
                            <img
                              src={reply.author.profilePicture}
                              alt=""
                              className="_comment_img1"
                            />
                          </div>
                          <div className="_comment_area">
                            <div className="_comment_details">
                              <div className="_comment_name">
                                <h4 className="_comment_name_title">
                                  {reply.author.firstName}{" "}
                                  {reply.author.lastName}
                                </h4>
                              </div>
                              <div className="_comment_status">
                                <p className="_comment_status_text">
                                  <span>{reply.content}</span>
                                </p>
                              </div>
                              {reply.likes.length > 0 && (
                                <div className="_total_reactions">
                                  <span>{reply.likes.length}</span>
                                </div>
                              )}
                              <div className="_comment_reply">
                                <ul className="_comment_reply_list">
                                  <li>
                                    <span
                                      style={{ cursor: "pointer" }}
                                      onClick={() => handleLikeReply(reply._id)}
                                    >
                                      {isReplyLiked ? "Unlike" : "Like"}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="_time_link">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

<div className="_timline_comment_main">
											<div className="_previous_comment">
												<button type="button" className="_previous_comment_txt">View 4 previous comments</button>
											</div>
											<div className="_comment_main">
												<div className="_comment_image">
													<a href="profile.html" className="_comment_image_link">
														<img src="assets/images/txt_img.png" alt="" className="_comment_img1" />
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
															<p className="_comment_status_text"><span>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. </span></p>
														</div>
														<div className="_total_reactions">
															<div className="_total_react">
																<span className="_reaction_like">
																	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
																</span>
																<span className="_reaction_heart">
																	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
																</span>
															</div>
															<span className="_total">
																198
															</span>
														</div>
														<div className="_comment_reply">
															<div className="_comment_reply_num">
																<ul className="_comment_reply_list">
																	<li><span>Like.</span></li>
																	<li><span>Reply.</span></li>
																	<li><span>Share</span></li>
																	<li><span className="_time_link">.21m</span></li>
																</ul>
															</div>
														</div>
													</div>
													<div className="_feed_inner_comment_box">
														<form className="_feed_inner_comment_box_form">
															<div className="_feed_inner_comment_box_content">
																<div className="_feed_inner_comment_box_content_image">
																	<img src="assets/images/comment_img.png" alt="" className="_comment_img" />
																</div>
																<div className="_feed_inner_comment_box_content_txt">
																	<textarea className="form-control _comment_textarea" placeholder="Write a comment" id="floatingTextarea2"></textarea>
																</div>
															</div>
															<div className="_feed_inner_comment_box_icon">
																<button className="_feed_inner_comment_box_icon_btn">
																	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
																		<path fill="#000" fill-opacity=".46" fill-rule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clip-rule="evenodd"></path>
																	</svg>
																</button>
																<button className="_feed_inner_comment_box_icon_btn">
																	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
																		<path fill="#000" fill-opacity=".46" fill-rule="evenodd" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z" clip-rule="evenodd"></path>
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
