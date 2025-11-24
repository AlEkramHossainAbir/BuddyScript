'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import CreatePost from '@/components/CreatePost';
import Post from '@/components/Post';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import PeopleStory from '@/components/PeopleStory';

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

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
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
    } catch {
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
      <ThemeSwitcher />
      <div className="_main_layout">
        <Header />
        <MobileNavigation />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>

              {/* Layout Middle - Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <PeopleStory />
                    <CreatePost onPostCreated={loadPosts} />
                    
                    {posts.length === 0 ? (
                      <div className="_feed_inner_timeline_post_area _b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b16">
                        <p>No posts yet. Create your first post!</p>
                      </div>
                    ) : (
                      posts.map((post: PostType) => (
                        <Post key={post._id} post={post} onUpdate={loadPosts} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
