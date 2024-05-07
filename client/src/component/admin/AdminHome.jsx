import React, { useState, useEffect } from 'react';
import { setIsAdminLoginAction, setAdminIdAction } from '../../component/action/adminLoginActions';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminHome = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        console.log('[MainHome] useEffect()');

        const adminSessionID = sessionStorage.getItem('adminSessionID');
        if (adminSessionID) {
            AxiosGetAdmin(adminSessionID);
        }
    }, []);

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
        <div>
            <Link to="/admin/news">공지사항</Link><br />
            <Link to="/admin/cleancenter">신고 센터 관리</Link><br />
            <Link to="/admin/userstatus">유저 통계</Link><br />
            <Link to="/admin/chattimestatus">채팅 시간 통계</Link>
        </div>

    );
};

export default AdminHome;