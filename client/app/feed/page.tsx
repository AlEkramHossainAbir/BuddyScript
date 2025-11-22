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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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
      {/* Switching Btn Start */}
      <div className="_layout_mode_swithing_btn">
        <button type="button" className="_layout_swithing_btn_link">
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round"></div>
          </div>
          <div className="_layout_change_btn_ic1">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
              <path fill="#fff" d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z"/>
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)"/>
              <path stroke="#fff" strokeLinecap="round" d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05"/>
            </svg>
          </div>
        </button>
      </div>
      {/* Switching Btn End */}

      <div className="_main_layout">
        {/* Desktop Menu Start */}
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="/feed">
                <img src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
              </a>
            </div>
            <button className="navbar-toggler bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <div className="_header_form ms-auto">
                <form className="_header_form_grp">
                  <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                    <circle cx="7" cy="7" r="6" stroke="#666" />
                    <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                  </svg>
                  <input className="form-control me-2 _inpt1" type="search" placeholder="input search text" aria-label="Search" />
                </form>
              </div>
              <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                <li className="nav-item _header_nav_item">
                  <a className="nav-link _header_nav_link_active _header_nav_link" aria-current="page" href="/feed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                      <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                      <path className="_home_active" stroke="#000" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
                    </svg>
                  </a>
                </li>
                <li className="nav-item _header_nav_item">
                  <a className="nav-link _header_nav_link" aria-current="page" href="#0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="20" fill="none" viewBox="0 0 26 20">
                      <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M12.79 12.15h.429c2.268.015 7.45.243 7.45 3.732 0 3.466-5.002 3.692-7.415 3.707h-.894c-2.268-.015-7.452-.243-7.452-3.727 0-3.47 5.184-3.697 7.452-3.711l.297-.001h.132zm0 1.75c-2.792 0-6.12.34-6.12 1.962 0 1.585 3.13 1.955 5.864 1.976l.255.002c2.792 0 6.118-.34 6.118-1.958 0-1.638-3.326-1.982-6.118-1.982zm9.343-2.224c2.846.424 3.444 1.751 3.444 2.79 0 .636-.251 1.794-1.931 2.43a.882.882 0 01-1.137-.506.873.873 0 01.51-1.13c.796-.3.796-.633.796-.793 0-.511-.654-.868-1.944-1.06a.878.878 0 01-.741-.996.886.886 0 011.003-.735zm-17.685.735a.878.878 0 01-.742.997c-1.29.19-1.944.548-1.944 1.059 0 .16 0 .491.798.793a.873.873 0 01-.314 1.693.897.897 0 01-.313-.057C.25 16.259 0 15.1 0 14.466c0-1.037.598-2.366 3.446-2.79.485-.06.929.257 1.002.735zM12.789 0c2.96 0 5.368 2.392 5.368 5.33 0 2.94-2.407 5.331-5.368 5.331h-.031a5.329 5.329 0 01-3.782-1.57 5.253 5.253 0 01-1.553-3.764C7.423 2.392 9.83 0 12.789 0zm0 1.75c-1.987 0-3.604 1.607-3.604 3.58a3.526 3.526 0 001.04 2.527 3.58 3.58 0 002.535 1.054l.03.875v-.875c1.987 0 3.605-1.605 3.605-3.58S14.777 1.75 12.789 1.75zm7.27-.607a4.222 4.222 0 013.566 4.172c-.004 2.094-1.58 3.89-3.665 4.181a.88.88 0 01-.994-.745.875.875 0 01.75-.989 2.494 2.494 0 002.147-2.45 2.473 2.473 0 00-2.09-2.443.876.876 0 01-.726-1.005.881.881 0 011.013-.721zm-13.528.72a.876.876 0 01-.726 1.006 2.474 2.474 0 00-2.09 2.446A2.493 2.493 0 005.86 7.762a.875.875 0 11-.243 1.734c-2.085-.29-3.66-2.087-3.664-4.179 0-2.082 1.5-3.837 3.566-4.174a.876.876 0 011.012.72z" clipRule="evenodd" />
                    </svg>
                  </a>
                </li>
                <li className="nav-item _header_nav_item">
                  <span className="nav-link _header_nav_link _header_notify_btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                      <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
                    </svg>
                    <span className="_counting">6</span>
                  </span>
                </li>
                <li className="nav-item _header_nav_item">
                  <a className="nav-link _header_nav_link" aria-current="page" href="#0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="22" fill="none" viewBox="0 0 23 22">
                      <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M11.43 0c2.96 0 5.743 1.143 7.833 3.22 4.32 4.29 4.32 11.271 0 15.562C17.145 20.886 14.293 22 11.405 22c-1.575 0-3.16-.33-4.643-1.012-.437-.174-.847-.338-1.14-.338-.338.002-.793.158-1.232.308-.9.307-2.022.69-2.852-.131-.826-.822-.445-1.932-.138-2.826.152-.44.307-.895.307-1.239 0-.282-.137-.642-.347-1.161C-.57 11.46.322 6.47 3.596 3.22A11.04 11.04 0 0111.43 0zm0 1.535A9.5 9.5 0 004.69 4.307a9.463 9.463 0 00-1.91 10.686c.241.592.474 1.17.474 1.77 0 .598-.207 1.201-.39 1.733-.15.439-.378 1.1-.231 1.245.143.147.813-.085 1.255-.235.53-.18 1.133-.387 1.73-.391.597 0 1.161.225 1.758.463 3.655 1.679 7.98.915 10.796-1.881 3.716-3.693 3.716-9.7 0-13.391a9.5 9.5 0 00-6.74-2.77zm4.068 8.867c.57 0 1.03.458 1.03 1.024 0 .566-.46 1.023-1.03 1.023a1.023 1.023 0 11-.01-2.047h.01zm-4.131 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.03 1.03 0 01-1.035-1.024c0-.566.455-1.023 1.025-1.023h.01zm-4.132 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.022 1.022 0 11-.01-2.047h.01z" clipRule="evenodd" />
                    </svg>
                    <span className="_counting">2</span>
                  </a>
                </li>
              </ul>
              <div className="_header_nav_profile">
                <div className="_header_nav_profile_image">
                  <img src={user.profilePicture || '/assets/images/profile.png'} alt="Image" className="_nav_profile_img" />
                </div>
                <div className="_header_nav_dropdown">
                  <p className="_header_nav_para">{user.firstName} {user.lastName}</p>
                  <button 
                    id="_profile_drop_show_btn" 
                    className="_header_nav_dropdown_btn _dropdown_toggle" 
                    type="button"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                      <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                    </svg>
                  </button>
                </div>
                <div id="_prfoile_drop" className={`_nav_profile_dropdown _profile_dropdown ${showProfileDropdown ? 'show' : ''}`}>
                  <div className="_nav_profile_dropdown_info">
                    <div className="_nav_profile_dropdown_image">
                      <img src={user.profilePicture || '/assets/images/profile.png'} alt="Image" className="_nav_drop_img" />
                    </div>
                    <div className="_nav_profile_dropdown_info_txt">
                      <h4 className="_nav_dropdown_title">{user.firstName} {user.lastName}</h4>
                      <a href="#0" className="_nav_drop_profile">View Profile</a>
                    </div>
                  </div>
                  <hr />
                  <ul className="_nav_dropdown_list">
                    <li className="_nav_dropdown_list_item">
                      <button onClick={logout} className="_nav_dropdown_link" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                        <div className="_nav_drop_info">
                          <span>Log Out</span>
                        </div>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {/* Desktop Menu End */}

        {/* Mobile Menu Start */}
        <div className="_header_mobile_menu">
          <div className="_header_mobile_menu_wrap">
            <div className="container">
              <div className="_header_mobile_menu">
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_header_mobile_menu_top_inner">
                      <div className="_header_mobile_menu_logo">
                        <a href="/feed" className="_mobile_logo_link">
                          <img src="/assets/images/logo.svg" alt="Image" className="_mobile_menu_logo" />
                        </a>
                      </div>
                      <div className="_header_mobile_menu_right">
                        <form className="_header_form_grp">
                          <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                            <circle cx="7" cy="7" r="6" stroke="#666" />
                            <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                          </svg>
                          <input className="form-control me-2 _inpt1" type="search" placeholder="input search text" aria-label="Search" />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Menu End */}

        {/* Mobile Bottom Navigation */}
        <div className="_mobile_navigation_bottom_wrapper">
          <div className="_mobile_navigation_bottom_wrap">
            <div className="conatiner">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12">
                  <ul className="_mobile_navigation_bottom_list">
                    <li className="_mobile_navigation_bottom_item">
                      <a href="/feed" className="_mobile_navigation_bottom_link _mobile_navigation_bottom_link_active">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="27" fill="none" viewBox="0 0 24 27">
                          <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                        </svg>
                      </a>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <a href="#0" className="_mobile_navigation_bottom_link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="27" height="20" fill="none" viewBox="0 0 27 20">
                          <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M12.79 12.15h.429c2.268.015 7.45.243 7.45 3.732 0 3.466-5.002 3.692-7.415 3.707h-.894c-2.268-.015-7.452-.243-7.452-3.727 0-3.47 5.184-3.697 7.452-3.711l.297-.001h.132z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <a href="#0" className="_mobile_navigation_bottom_link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" fill="none" viewBox="0 0 25 27">
                          <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002z" clipRule="evenodd" />
                        </svg>
                        <span className="_counting">6</span>
                      </a>
                    </li>
                    <li className="_mobile_navigation_bottom_item">
                      <a href="#0" className="_mobile_navigation_bottom_link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M11.43 0c2.96 0 5.743 1.143 7.833 3.22 4.32 4.29 4.32 11.271 0 15.562C17.145 20.886 14.293 22 11.405 22z" clipRule="evenodd" />
                        </svg>
                        <span className="_counting">2</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Bottom Navigation End */}

        {/* Main Layout Structure */}
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5  _mar_b24">Explore</h4>
                      <ul className="_left_inner_area_explore_list">
                        <li className="_left_inner_area_explore_item _explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                              <path fill="#666" d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21zm-1.233 4.65l.104.01c.188.028.443.113.668.203 1.026.398 3.033 1.746 3.8 2.563l.223.239.08.092a1.16 1.16 0 01.025 1.405c-.04.053-.086.105-.19.215l-.269.28c-.812.794-2.57 1.971-3.569 2.391-.277.117-.675.25-.865.253a1.167 1.167 0 01-1.07-.629c-.053-.104-.12-.353-.171-.586l-.051-.262c-.093-.57-.143-1.437-.142-2.347l.001-.288c.01-.858.063-1.64.157-2.147.037-.207.12-.563.167-.678.104-.25.291-.45.523-.575a1.15 1.15 0 01.58-.14zm.14 1.467l-.027.126-.034.198c-.07.483-.112 1.233-.111 2.036l.001.279c.009.737.053 1.414.123 1.841l.048.235.192-.07c.883-.372 2.636-1.56 3.23-2.2l.08-.087-.212-.218c-.711-.682-2.38-1.79-3.167-2.095l-.124-.045z" />
                            </svg>
                            Learning
                          </a>
                          <span className="_left_inner_area_explore_link_txt">New</span>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                              <path fill="#666" d="M14.96 2c3.101 0 5.159 2.417 5.159 5.893v8.214c0 3.476-2.058 5.893-5.16 5.893H6.989c-3.101 0-5.159-2.417-5.159-5.893V7.893C1.83 4.42 3.892 2 6.988 2h7.972zm0 1.395H6.988c-2.37 0-3.883 1.774-3.883 4.498v8.214c0 2.727 1.507 4.498 3.883 4.498h7.972c2.375 0 3.883-1.77 3.883-4.498V7.893c0-2.727-1.508-4.498-3.883-4.498zM7.036 9.63c.323 0 .59.263.633.604l.005.094v6.382c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-6.382c0-.385.286-.697.638-.697zm3.97-3.053c.323 0 .59.262.632.603l.006.095v9.435c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094V7.274c0-.386.286-.698.638-.698zm3.905 6.426c.323 0 .59.262.632.603l.006.094v3.01c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-3.01c0-.385.286-.697.638-.697z" />
                            </svg>
                            Insights
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                              <path fill="#666" d="M9.032 14.456l.297.002c4.404.041 6.907 1.03 6.907 3.678 0 2.586-2.383 3.573-6.615 3.654l-.589.005c-4.588 0-7.203-.972-7.203-3.68 0-2.704 2.604-3.659 7.203-3.659zm0 1.5l-.308.002c-3.645.038-5.523.764-5.523 2.157 0 1.44 1.99 2.18 5.831 2.18 3.847 0 5.832-.728 5.832-2.159 0-1.44-1.99-2.18-5.832-2.18zm8.53-8.037c.347 0 .634.282.679.648l.006.102v1.255h1.185c.38 0 .686.336.686.75 0 .38-.258.694-.593.743l-.093.007h-1.185v1.255c0 .414-.307.75-.686.75-.347 0-.634-.282-.68-.648l-.005-.102-.001-1.255h-1.183c-.379 0-.686-.336-.686-.75 0-.38.258-.694.593-.743l.093-.007h1.183V8.669c0-.414.308-.75.686-.75zM9.031 2c2.698 0 4.864 2.369 4.864 5.319 0 2.95-2.166 5.318-4.864 5.318-2.697 0-4.863-2.369-4.863-5.318C4.17 4.368 6.335 2 9.032 2zm0 1.5c-1.94 0-3.491 1.697-3.491 3.819 0 2.12 1.552 3.818 3.491 3.818 1.94 0 3.492-1.697 3.492-3.818 0-2.122-1.551-3.818-3.492-3.818z" />
                            </svg>
                            Find friends
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                              <path fill="#666" d="M13.704 2c2.8 0 4.585 1.435 4.585 4.258V20.33c0 .443-.157.867-.436 1.18-.279.313-.658.489-1.063.489a1.456 1.456 0 01-.708-.203l-5.132-3.134-5.112 3.14c-.615.36-1.361.194-1.829-.405l-.09-.126-.085-.155a1.913 1.913 0 01-.176-.786V6.434C3.658 3.5 5.404 2 8.243 2h5.46zm0 1.448h-5.46c-2.191 0-3.295.948-3.295 2.986V20.32c0 .044.01.088 0 .07l.034.063c.059.09.17.12.247.074l5.11-3.138c.38-.23.84-.23 1.222.001l5.124 3.128a.252.252 0 00.114.035.188.188 0 00.14-.064.236.236 0 00.058-.157V6.258c0-1.9-1.132-2.81-3.294-2.81zm.386 4.869c.357 0 .646.324.646.723 0 .367-.243.67-.559.718l-.087.006H7.81c-.357 0-.646-.324-.646-.723 0-.367.243-.67.558-.718l.088-.006h6.28z" />
                            </svg>
                            Bookmarks
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Group
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item _explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                              <path fill="#666" d="M7.625 2c.315-.015.642.306.645.69.003.309.234.558.515.558h.928c1.317 0 2.402 1.169 2.419 2.616v.24h2.604c2.911-.026 5.255 2.337 5.377 5.414.005.12.006.245.004.368v4.31c.062 3.108-2.21 5.704-5.064 5.773-.117.003-.228 0-.34-.005a199.325 199.325 0 01-7.516 0c-2.816.132-5.238-2.292-5.363-5.411a6.262 6.262 0 01-.004-.371V11.87c-.03-1.497.48-2.931 1.438-4.024.956-1.094 2.245-1.714 3.629-1.746a3.28 3.28 0 01.342.005l3.617-.001v-.231c-.008-.676-.522-1.23-1.147-1.23h-.93c-.973 0-1.774-.866-1.785-1.937-.003-.386.28-.701.631-.705zm-.614 5.494h-.084C5.88 7.52 4.91 7.987 4.19 8.812c-.723.823-1.107 1.904-1.084 3.045v4.34c-.002.108 0 .202.003.294.094 2.353 1.903 4.193 4.07 4.08 2.487.046 5.013.046 7.55-.001.124.006.212.007.3.004 2.147-.05 3.86-2.007 3.812-4.361V11.87a5.027 5.027 0 00-.002-.291c-.093-2.338-1.82-4.082-4.029-4.082l-.07.002H7.209a4.032 4.032 0 00-.281-.004l.084-.001zm1.292 4.091c.341 0 .623.273.667.626l.007.098-.001 1.016h.946c.372 0 .673.325.673.725 0 .366-.253.669-.582.717l-.091.006h-.946v1.017c0 .4-.3.724-.673.724-.34 0-.622-.273-.667-.626l-.006-.098v-1.017h-.945c-.372 0-.674-.324-.674-.723 0-.367.254-.67.582-.718l.092-.006h.945v-1.017c0-.4.301-.724.673-.724zm7.058 3.428c.372 0 .674.324.674.724 0 .366-.254.67-.582.717l-.091.007h-.09c-.373 0-.674-.324-.674-.724 0-.367.253-.67.582-.717l.091-.007h.09zm-1.536-3.322c.372 0 .673.324.673.724 0 .367-.253.67-.582.718l-.091.006h-.09c-.372 0-.674-.324-.674-.724 0-.366.254-.67.582-.717l.092-.007h.09z" />
                            </svg>
                            Gaming
                          </a>
                          <span className="_left_inner_area_explore_link_txt">New</span>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path fill="#666" d="M12.616 2c.71 0 1.388.28 1.882.779.495.498.762 1.17.74 1.799l.009.147c.017.146.065.286.144.416.152.255.402.44.695.514.292.074.602.032.896-.137l.164-.082c1.23-.567 2.705-.117 3.387 1.043l.613 1.043c.017.027.03.056.043.085l.057.111a2.537 2.537 0 01-.884 3.204l-.257.159a1.102 1.102 0 00-.33.356 1.093 1.093 0 00-.117.847c.078.287.27.53.56.695l.166.105c.505.346.869.855 1.028 1.439.18.659.083 1.36-.272 1.957l-.66 1.077-.1.152c-.774 1.092-2.279 1.425-3.427.776l-.136-.069a1.19 1.19 0 00-.435-.1 1.128 1.128 0 00-1.143 1.154l-.008.171C15.12 20.971 13.985 22 12.616 22h-1.235c-1.449 0-2.623-1.15-2.622-2.525l-.008-.147a1.045 1.045 0 00-.148-.422 1.125 1.125 0 00-.688-.519c-.29-.076-.6-.035-.9.134l-.177.087a2.674 2.674 0 01-1.794.129 2.606 2.606 0 01-1.57-1.215l-.637-1.078-.085-.16a2.527 2.527 0 011.03-3.296l.104-.065c.309-.21.494-.554.494-.923 0-.401-.219-.772-.6-.989l-.156-.097a2.542 2.542 0 01-.764-3.407l.65-1.045a2.646 2.646 0 013.552-.96l.134.07c.135.06.283.093.425.094.626 0 1.137-.492 1.146-1.124l.009-.194a2.54 2.54 0 01.752-1.593A2.642 2.642 0 0111.381 2h1.235zm0 1.448h-1.235c-.302 0-.592.118-.806.328a1.091 1.091 0 00-.325.66l-.013.306C10.133 6.07 9 7.114 7.613 7.114a2.619 2.619 0 01-1.069-.244l-.192-.1a1.163 1.163 0 00-1.571.43l-.65 1.045a1.103 1.103 0 00.312 1.464l.261.162A2.556 2.556 0 015.858 12c0 .845-.424 1.634-1.156 2.13l-.156.096c-.512.29-.71.918-.472 1.412l.056.107.63 1.063c.147.262.395.454.688.536.26.072.538.052.754-.042l.109-.052a2.652 2.652 0 011.986-.261 2.591 2.591 0 011.925 2.21l.02.353c.062.563.548 1 1.14 1h1.234c.598 0 1.094-.45 1.14-1l.006-.11a2.536 2.536 0 01.766-1.823 2.65 2.65 0 011.877-.75c.35.009.695.086 1.048.241l.316.158c.496.213 1.084.058 1.382-.361l.073-.111.644-1.052a1.1 1.1 0 00-.303-1.455l-.273-.17a2.563 2.563 0 01-1.062-1.462 2.513 2.513 0 01.265-1.944c.19-.326.451-.606.792-.838l.161-.099c.512-.293.71-.921.473-1.417l-.07-.134-.013-.028-.585-.995a1.157 1.157 0 00-1.34-.513l-.111.044-.104.051a2.661 2.661 0 01-1.984.272 2.607 2.607 0 01-1.596-1.18 2.488 2.488 0 01-.342-1.021l-.014-.253a1.11 1.11 0 00-.323-.814 1.158 1.158 0 00-.823-.34zm-.613 5.284c1.842 0 3.336 1.463 3.336 3.268 0 1.805-1.494 3.268-3.336 3.268-1.842 0-3.336-1.463-3.336-3.268 0-1.805 1.494-3.268 3.336-3.268zm0 1.448c-1.026 0-1.858.815-1.858 1.82 0 1.005.832 1.82 1.858 1.82 1.026 0 1.858-.815 1.858-1.82 0-1.005-.832-1.82-1.858-1.82z" />
                            </svg>
                            Settings
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 24" fill="none" stroke="#666"  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            Save post
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* Left Sidebar End */}

              {/* Layout Middle */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <CreatePost onPostCreated={loadPosts} />
                    
                    {posts.length === 0 ? (
                      <div className="_feed_inner_timeline_post_area _b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b16">
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
              {/* Layout Middle End */}

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <div className="_right_inner_area_info _padd_t24  _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_right_inner_area_info_content _mar_b24">
                        <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
                        <span className="_right_inner_area_info_content_txt">
                          <a className="_right_inner_area_info_content_txt_link" href="#0">See All</a>
                        </span>
                      </div>
                      <hr className="_underline" />
                      <div className="_right_inner_area_info_ppl">
                        <div className="_right_inner_area_info_box">
                          <div className="_right_inner_area_info_image">
                            <a href="#0">
                              <img src="/assets/images/people1.png" alt="Image" className="_right_info_img" />
                            </a>
                          </div>
                          <div className="_right_inner_area_info_txt">
                            <a href="#0">
                              <h4 className="_right_inner_area_info_title">Steve Jobs</h4>
                            </a>
                            <p className="_right_inner_area_info_para">CEO of Apple</p>
                          </div>
                        </div>
                        <div className="_right_info_btn_grp">
                          <button type="button" className="_right_info_grp_link">Connect</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Sidebar End */}
            </div>
          </div>
        </div>
        {/* Main Layout Structure End */}
      </div>
    </div>
  );
}
