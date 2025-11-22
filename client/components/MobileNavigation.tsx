'use client';

export default function MobileNavigation() {
  return (
    <>
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
    </>
  );
}
