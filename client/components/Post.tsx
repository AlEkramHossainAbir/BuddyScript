'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

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
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const [showLikes, setShowLikes] = useState(false);

  const isLiked = post.likes.some(like => like._id === user?.id);

  const loadComments = async () => {
    try {
      const response = await api.get(`/comments/post/${post._id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to load comments');
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
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await api.post('/comments', {
        postId: post._id,
        content: commentContent,
      });
      setCommentContent('');
      loadComments();
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await api.post(`/comments/${commentId}/like`);
      loadComments();
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const handleReply = async (commentId: string) => {
    const content = replyContent[commentId];
    if (!content?.trim()) return;

    try {
      await api.post(`/comments/${commentId}/reply`, { content });
      setReplyContent({ ...replyContent, [commentId]: '' });
      loadComments();
      toast.success('Reply added!');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleLikeReply = async (replyId: string) => {
    try {
      await api.post(`/comments/reply/${replyId}/like`);
      loadComments();
    } catch (error) {
      toast.error('Failed to like reply');
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} minute${diff > 1 ? 's' : ''} ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src={post.author.profilePicture} alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author.firstName} {post.author.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatDate(post.createdAt)} · <a href="#0">{post.isPrivate ? 'Private' : 'Public'}</a>
              </p>
            </div>
          </div>
        </div>
        <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
        {post.image && (
          <div className="_feed_inner_timeline_image">
            <img src={`http://localhost:8000${post.image}`} alt="" className="_time_img" />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image" style={{ cursor: 'pointer' }} onClick={() => setShowLikes(!showLikes)}>
          {post.likes.length > 0 && (
            <>
              <img src="/assets/images/react_img1.png" alt="Image" className="_react_img1" />
              <p className="_feed_inner_timeline_total_reacts_para">{post.likes.length}</p>
            </>
          )}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1" style={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
            <span>{comments.length}</span> Comment{comments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {showLikes && post.likes.length > 0 && (
        <div className="_padd_r24 _padd_l24 _mar_b16">
          <strong>Liked by:</strong>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {post.likes.map(like => (
              <li key={like._id}>
                {like.firstName} {like.lastName}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="_feed_inner_timeline_reaction">
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${isLiked ? '_feed_reaction_active' : ''}`}
          onClick={handleLike}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>{isLiked ? 'Unlike' : 'Like'}</span>
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

      {showComments && (
        <>
          <div className="_feed_inner_timeline_cooment_area">
            <div className="_feed_inner_comment_box">
              <form className="_feed_inner_comment_box_form" onSubmit={handleComment}>
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <img src={user?.profilePicture} alt="" className="_comment_img" />
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
                <button type="submit" style={{ display: 'none' }}>Submit</button>
              </form>
            </div>
          </div>

          {comments.map((comment) => {
            const isCommentLiked = comment.likes.some(like => like._id === user?.id);
            
            return (
              <div key={comment._id} className="_timline_comment_main _padd_r24 _padd_l24">
                <div className="_comment_main">
                  <div className="_comment_image">
                    <img src={comment.author.profilePicture} alt="" className="_comment_img1" />
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
                              <span style={{ cursor: 'pointer' }} onClick={() => handleLikeComment(comment._id)}>
                                {isCommentLiked ? 'Unlike' : 'Like'}
                              </span>
                            </li>
                            <li>
                              <span style={{ cursor: 'pointer' }} onClick={() => setShowReplies({ ...showReplies, [comment._id]: !showReplies[comment._id] })}>
                                Reply
                              </span>
                            </li>
                            <li>
                              <span className="_time_link">{formatDate(comment.createdAt)}</span>
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
                              <img src={user?.profilePicture} alt="" className="_comment_img" />
                            </div>
                            <div className="_feed_inner_comment_box_content_txt">
                              <textarea
                                className="form-control _comment_textarea"
                                placeholder="Write a reply"
                                value={replyContent[comment._id] || ''}
                                onChange={(e) => setReplyContent({ ...replyContent, [comment._id]: e.target.value })}
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                    )}

                    {comment.replies.map((reply) => {
                      const isReplyLiked = reply.likes.some(like => like._id === user?.id);
                      
                      return (
                        <div key={reply._id} className="_comment_main _mar_t16 _mar_l24">
                          <div className="_comment_image">
                            <img src={reply.author.profilePicture} alt="" className="_comment_img1" />
                          </div>
                          <div className="_comment_area">
                            <div className="_comment_details">
                              <div className="_comment_name">
                                <h4 className="_comment_name_title">
                                  {reply.author.firstName} {reply.author.lastName}
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
                                    <span style={{ cursor: 'pointer' }} onClick={() => handleLikeReply(reply._id)}>
                                      {isReplyLiked ? 'Unlike' : 'Like'}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="_time_link">{formatDate(reply.createdAt)}</span>
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
    </div>
  );
}
