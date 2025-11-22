'use client';

export default function RightSidebar() {
  return (
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
  );
}
