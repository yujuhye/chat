import React from "react";
import { Link } from "react-router-dom";

import '../css/common.css';

const SideNav = () => {
    return(
        <>
         <div className='sideNav'>
                <Link to="/friend/friendList">친구</Link> &nbsp;
                <Link to="/chatPage">Chat</Link> &nbsp; 
        </div>
        </>
    );
}

export default SideNav;