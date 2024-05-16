import React from "react";
import { Link } from "react-router-dom";

import '../css/common.css';

const SideNav = () => {
    return(
        <>
         <div className='sideNav'>
                <Link to="/">채팅</Link> &nbsp;
                <Link to="/friend/friendList">친구</Link> &nbsp;
        </div>
        </>
    );
}

export default SideNav;