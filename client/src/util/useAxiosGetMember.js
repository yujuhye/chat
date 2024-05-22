import React, { useEffect } from "react";
import { setIsLoginAction, setUserIdAction } from '../component/action/loginActions';
import { useDispatch } from "react-redux";
import axios from "axios";
import cookie from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from '../util/url';

const useAxiosGetMember = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const AxiosGetUser = async () => {
            console.log('[AxiosGetUser] AxiosGetUser()');
            const userToken = cookie.get('userToken');
            if (!userToken) {
                navigate('/member/login');
                return;
            }

            try {
                const response = await axios.get(
                    // 'http://localhost:3001/member/getMember',
                    `${SERVER_URL.TARGET_URL()}/member/getMember`, 
                    {
                        headers: {
                            Authorization: `Bearer ${userToken}`
                        },
                        withCredentials: true
                    }
                );

                console.log('[AxiosGetUser] AXIOS GET USER COMMUNICATION SUCCESS');

                if (response.data !== null) {
                    console.log('response.data ---> ', response.data);
                    dispatch(setIsLoginAction(true));
                    const userIdFromCookie = response.data.member.USER_ID;
                    console.log('userIdFromCookie ---> ', userIdFromCookie);
                    dispatch(setUserIdAction(userIdFromCookie));
                    console.log('[AxiosGetUser] setIdAction', dispatch(setUserIdAction(userIdFromCookie)));
                }
            } catch (error) {
                console.log('[AxiosGetUser] AXIOS GET USER COMMUNICATION ERROR');
            }
        }

        AxiosGetUser();

    }, []);

    return null;
}

export default useAxiosGetMember;