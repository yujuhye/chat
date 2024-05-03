import React from 'react';
import { Link } from "react-router-dom";

const Nav = () => {
    return (
        <nav>
            <Link to="/">Home</Link> &nbsp;
            <Link to="/friend/friendList">친구목록</Link> &nbsp;
            <Link to="/friend/requestFriend">친구추가</Link> &nbsp;
            <Link to="/friend/managementFriend">친구관리</Link> &nbsp;
            <Link to="/admin/home">AdminHome</Link> &nbsp;
        </nav>
    );
};

export default Nav;