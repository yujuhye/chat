import React from "react";
import { Link } from "react-router-dom";
import { BsFillChatLeftDotsFill, BsChatLeftDots } from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";
import { IoSettingsOutline  } from "react-icons/io5";
import '../css/common.css';

const SideNav = () => {
    return(
        <>
            <div className='sideNav'>
                <Link to="/friend/friendList"><FaUserFriends size="30px" color="#505050" /></Link> &nbsp;
                <Link to="/friend/managementFriend"><FaUserPlus size="30px" color="#505050" /></Link> &nbsp;
                <Link to="/chatPage"><BsFillChatLeftDotsFill size="30px" color="#505050"/></Link> &nbsp;
                <Link to="/OpenChatHome"><BsChatLeftDots size="30px" color="#505050"/></Link> &nbsp;
                <Link to="/member/setting"><IoSettingsOutline  size="30px" color="#505050" /></Link> &nbsp;
            </div>
        </>
    );
}

export default SideNav;