import React from 'react';
import { Link } from "react-router-dom";

import '../css/common.css';
import { useSelector } from 'react-redux';

const Nav = () => {

    const isAdminLogin = useSelector(state => state.adminlogin.isAdminLogin);

    return (
        <nav>
            {isAdminLogin ?
                <>
                    <Link to="/admin">관리자 홈</Link> &nbsp;
                    <Link to="/admin/news">공지사항</Link> &nbsp;
                    <Link to="/admin/userstatus">유저 통계</Link> &nbsp;
                    <Link to="/admin/chatstatushourly">채팅 통계</Link> &nbsp;
                </>
                :

                <>
                    <Link to="/">Home</Link> &nbsp;
                    <Link to="/friend/friendList">친구목록</Link> &nbsp;
                    <Link to="/friend/requestFriend">친구추가</Link> &nbsp;
                    <Link to="/friend/managementFriend">친구관리</Link> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Link to="/member/setting">설정</Link> &nbsp;
                    {/* <Link to="/chatRoom/list">chat</Link> &nbsp; */}
                    {/* 추가 부분 */}
                    <Link to="/chatPage">Chat</Link> &nbsp;
                </>
            }

        </nav>
    );
};

export default Nav;