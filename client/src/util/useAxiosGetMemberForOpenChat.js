import React, { useEffect, useState } from "react";
import { setIsLoginAction, setUserIdAction, setUserNoAction } from '../component/action/loginActions';
import { useDispatch } from "react-redux";
import axios from "axios";
import cookie from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from '../util/url';

const useAxiosGetMember = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userNo, setUserNo] = useState();

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
                    dispatch(setIsLoginAction(true));
                    const userNoFromCookie = response.data.member.USER_NO;
                    dispatch(setUserNoAction(userNoFromCookie));
                    setUserNo(userNoFromCookie);
                }
            } catch (error) {
                console.log('[AxiosGetUser] AXIOS GET USER COMMUNICATION ERROR');
            }
        }

        AxiosGetUser();

    }, [userNo]);

    return userNo;
}

export default useAxiosGetMember;