import React from "react";
import SideNav from "../../include/SideNav";
import Nav from "../../include/Nav";

import '../../css/common.css';
import '../../css/profile.css';
import { Outlet } from "react-router-dom";

function Layout() {
    return(
        <>
        <div className="friendListContainer">
            <SideNav />
            <div className="friendListWrap">
                <Nav />
                <Outlet /> 
            </div>
        </div>
        </>
    );
}

export default Layout;