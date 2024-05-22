import React, { useEffect } from "react";
import { setIsAdminLoginAction, setAdminIdAction } from '../component/action/adminLoginActions';
import { useDispatch } from "react-redux";
import axios from "axios";
import cookie from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from '../util/url';

const useAxiosGetAdmin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const AxiosGetAdmin = async () => {
            console.log('[useAxiosGetAdmin] AxiosGetAdmin()');
            const adminToken = cookie.get('adminToken');
            if (!adminToken) {
                navigate('/admin/adminlogin');
                return;
            }

            try {
                const response = await axios.get(
                    // 'http://localhost:3001/admin/getAdmin',
                    `${SERVER_URL.TARGET_URL()}/admin/getAdmin`, 
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        },
                        withCredentials: true
                    }
                );

                console.log('[useAxiosGetAdmin] AXIOS GET ADMIN COMMUNICATION SUCCESS');

                if (response.data !== null) {
                    console.log('response.data ---> ', response.data);
                    dispatch(setIsAdminLoginAction(true));
                    const adminIdFromCookie = response.data.admin.ADMIN_ID;
                    console.log('adminIdFromCookie ---> ', adminIdFromCookie);
                    dispatch(setAdminIdAction(adminIdFromCookie));
                    console.log('[useAxiosGetAdmin] setAdminIdAction', dispatch(setAdminIdAction(adminIdFromCookie)));
                }
            } catch (error) {
                console.log('[useAxiosGetAdmin] AXIOS GET ADMIN COMMUNICATION ERROR');
            }
        }

        AxiosGetAdmin();

    }, []);

    return null;
}

export default useAxiosGetAdmin;