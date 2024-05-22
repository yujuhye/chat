import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import axios from "axios";
import Login from './member/Login';
import Join from './member/Join';
import FriendList from './friend/FriendList';
import ChatRoom from './chat/ChatRoom';
import Chat from './chat/Chat';
import AdminLogin from './admin/adminmember/AdminLogin';
import AdminJoin from './admin/adminmember/AdminJoin';
import AdminHome from './admin/AdminHome';
import UserStatus from './admin/adminmanagement/UserStatus';
import NewsList from './admin/adminmanagement/NewsList';
import RequestFriend from './friend/RequestFriend';
import ManagementFriend from './friend/ManagementFriend';
import NewsForm from './admin/adminmanagement/NewsForm';
import Setting from './member/Setting';
import MemberModify from './member/MemberModify';
import FindPassword from './member/FindPassword';
import AdminDashboard from './admin/adminmanagement/AdminDashboard';
import ChatStatusHourly from './admin/adminmanagement/ChatStatusHourly';
import ChatStatusDaily from './admin/adminmanagement/ChatStatusDaily';
import ChatStatusWeekly from './admin/adminmanagement/ChatStatusWeekly';
import ChatStatusMonthly from './admin/adminmanagement/ChatStatusMonthly';
import ChatStatusPeriod from './admin/adminmanagement/ChatStatusPeriod';
import ChatPage from './chat/ChatPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import OpenChatPage from './open_chat/page/OpenChatPage';

const CLIENT_ID = '113858365495-jl2hl92heunsnv028li58n6aum139hcr.apps.googleusercontent.com';

axios.defaults.withCredentials = true;

const MainHome = () => {

    const isLogin = useSelector(state => state.login.isLogin);

    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={isLogin ? <Navigate to="/friend/friendList" /> : <Login />} />
                    <Route path="/member/findpassword" element={<FindPassword />} />
                    <Route path="/member/join" element={<Join />} />
                    <Route path="/member/login" element={<Login />} />
                    <Route path="/member/modify" element={<MemberModify />} />
                    <Route path="/member/setting" element={<Setting />} />
                    <Route path='/chatRoom/list' element={<ChatRoom />}></Route>
                    <Route path='/chat/details/:roomId' element={<Chat />}></Route>
                    <Route path='/chatPage' element={<ChatPage />}></Route>
                    <Route path='/friend/managementFriend' element={<ManagementFriend />}></Route>
                    <Route path="/admin" element={<AdminHome />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/adminlogin" element={<AdminLogin />} />
                    <Route path="/admin/adminjoin" element={<AdminJoin />} />
                    <Route path="/admin/news" element={<NewsList />} />
                    <Route path="/admin/newsform" element={<NewsForm />} />
                    <Route path="/admin/userstatus" element={<UserStatus />} />
                    <Route path="/admin/chatstatushourly" element={<ChatStatusHourly />} />
                    <Route path="/admin/chatstatusdaily" element={<ChatStatusDaily />} />
                    <Route path="/admin/chatstatusweekly" element={<ChatStatusWeekly />} />
                    <Route path="/admin/chatstatusmonthly" element={<ChatStatusMonthly />} />
                    <Route path="/admin/chatstatusperiod" element={<ChatStatusPeriod />} />
                    <Route path='/friend/friendList' element={<FriendList />} />
                    <Route path='/friend/requestFriend' element={<RequestFriend />} />
                    <Route path='/openChatHome' element={<OpenChatPage />} />
                </Routes>

            </BrowserRouter>
        </GoogleOAuthProvider>
    );
};

export default MainHome;