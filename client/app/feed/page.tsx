'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import CreatePost from '@/components/CreatePost';
import Post from '@/components/Post';

interface PostType {
  _id: string;
  content: string;
  image?: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  likes: any[];
  isPrivate: boolean;
  createdAt: string;
}

export default function FeedPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">
        {/* Desktop Menu */}
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="/feed">
                <img src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
              </a>
            </div>
            <div className="_header_nav_profile">
              <div className="_header_nav_profile_image">
                <img src={user.profilePicture} alt="Image" className="_nav_profile_img" />
              </div>
              <div className="_header_nav_dropdown">
                <p className="_header_nav_para">
                  {user.firstName} {user.lastName}
                </p>
                <button type="button" className="_header_nav_dropdown_btn _dropdown_toggle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                    <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                  </svg>
                </button>
              </div>
              <div className="_nav_profile_dropdown _profile_dropdown" style={{ display: 'none' }}>
                <div className="_nav_profile_dropdown_info">
                  <div className="_nav_profile_dropdown_image">
                    <img src={user.profilePicture} alt="Image" className="_nav_drop_img" />
                  </div>
                  <div className="_nav_profile_dropdown_info_txt">
                    <h4 className="_nav_dropdown_title">
                      {user.firstName} {user.lastName}
                    </h4>
                  </div>
                </div>
                <hr />
                <ul className="_nav_dropdown_list">
                  <li className="_nav_dropdown_list_item">
                    <button onClick={logout} className="_nav_dropdown_link" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
                      <div className="_nav_drop_info">
                        <span>Log Out</span>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Layout Structure */}
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Welcome</h4>
                      <p>Welcome to BuddyScript Social Network</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Middle - Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <CreatePost onPostCreated={loadPosts} />
                    
                    {posts.length === 0 ? (
                      <div className="_b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _feed_inner_area">
                        <p>No posts yet. Create your first post!</p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <Post key={post._id} post={post} onUpdate={loadPosts} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_right_inner_area_info_content_title _title5">Activity</h4>
                      <p className="_mar_t16">Total Posts: {posts.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
