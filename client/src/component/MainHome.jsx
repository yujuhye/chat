import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoginAction, setUserIdAction } from '../component/action/loginActions';
import { setIsAdminLoginAction, setAdminIdAction } from '../component/action/adminLoginActions';
import axios from "axios";
import Login from './member/Login';
import Join from './member/Join';
import FriendList from './friend/FriendList';
import ChatRoom from './chat/ChatRoom';
import Chat from './chat/Chat';
import Nav from '../include/Nav';
import AdminLogin from './admin/adminmember/AdminLogin';
import AdminJoin from './admin/adminmember/AdminJoin';
import AdminHome from './admin/AdminHome';
import CleanCenter from './admin/adminmanagement/CleanCenter';
import UserStatus from './admin/adminmanagement/UserStatus';
import ChatTimeStatus from './admin/adminmanagement/ChatTimeStatus';
import News from './admin/adminmanagement/News';
import RequestFriend from './friend/RequestFriend';
import ManagementFriend from './friend/ManagementFriend';

const MainHome = () => {

    const isLogin = useSelector(state => state.login.isLogin);
    const isAdminLogin = useSelector(state => state.adminlogin.isAdminLogin);

    const dispatch = useDispatch();

    useEffect(() => {
        console.log('[MainHome] useEffect()');

        // user
        const sessionID = sessionStorage.getItem('sessionID');
        if (sessionID) {
            AxiosGetMember(sessionID);
        }

        // admin
        const adminSessionID = sessionStorage.getItem('adminSessionID');
        if (adminSessionID) {
            AxiosGetAdmin(adminSessionID);
        }
    }, []);

    const AxiosGetMember = async (sessionID) => {
        console.log('[MainHome] AxiosGetMember()');
        try {
            const response = await axios.get(
                'http://localhost:3001/member/getMember',
                {
                    params: { 'sessionID': sessionID },
                    withCredentials: true
                }
            );

            console.log('[MainHome] AXIOS GET MEMBER COMMUNICATION SUCCESS');

            if (response.data !== null) {
                dispatch(setIsLoginAction(true));
                dispatch(setUserIdAction(response.data.member.USER_ID));
            }
        } catch (error) {
            console.log('[MainHome] AXIOS GET MEMBER COMMUNICATION ERROR');
        }
    }

    const AxiosGetAdmin = async (adminSessionID) => {
        console.log('[MainHome] AxiosGetAdmin()');
        try {
            const response = await axios.get(
                'http://localhost:3001/admin/getAdmin',
                {
                    params: { 'adminSessionID': adminSessionID },
                    withCredentials: true
                }
            );

            console.log('[MainHome] AXIOS GET ADMIN COMMUNICATION SUCCESS');

            if (response.data !== null) {
                dispatch(setIsAdminLoginAction(true));
                dispatch(setAdminIdAction(response.data.amdin.ADMIN_ID));
            }
        } catch (error) {
            console.log('[MainHome] AXIOS GET ADMIN COMMUNICATION ERROR');
        }
    }


    return (
        <BrowserRouter>
            {isLogin || isAdminLogin ? <Nav /> : null}
            <Routes>
                <Route path="/" element={isLogin || isAdminLogin ? <Navigate to="/friend/friendList" /> : <Login />} />
                <Route path="/member/join" element={<Join />} />
                <Route path='/friend/friendList' element={<FriendList />}></Route>
                <Route path='/chatRoom/list' element={<ChatRoom />}></Route>
                <Route path='/chat/details/:roomId' element={<Chat />}></Route>
                <Route path='/friend/requestFriend' element={<RequestFriend />}></Route>
                <Route path='/friend/managementFriend' element={<ManagementFriend />}></Route>
                <Route path="/admin/home" element={isAdminLogin ? <AdminHome /> : <Navigate to="/admin/adminlogin" />} />
                    <Route path="/admin/adminlogin" element={<AdminLogin />} />
                    <Route path="/admin/adminjoin" element={<AdminJoin />} />
                    <Route path="/admin/news" element={<News />} />
                    <Route path="/admin/cleancenter" element={<CleanCenter />} />
                    <Route path="/admin/userstatus" element={<UserStatus />} />
                    <Route path="/admin/chattimestatus" element={<ChatTimeStatus />} />
            </Routes>

        </BrowserRouter>
    );
};

export default MainHome;