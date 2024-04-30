import React, { useEffect } from "react";
import { setIsLoginAction, setUserIdAction } from '../component/action/loginActions';
import { useDispatch } from "react-redux";
import axios from "axios";

const GET_MEMBER = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('[getMember] useEffect()');

        const sessionID = sessionStorage.getItem('sessionID');
        axiosGetMember(sessionID);

    }, [dispatch]);

    const axiosGetMember = (sessionID) => {
        console.log('[getMember] axiosGetMember()');

        axios({
            url: 'http://localhost:3001/member/getMember',
            method: 'get',
            params: {
                'sessionID': sessionID,
            }
        })
            .then(response => {
                console.log('[getMember] AJAX GET MEMBER COMMUNICATION SUCCESS()');
                const data = response.data;

                if (data !== null) {
                    dispatch(setIsLoginAction(true));
                    dispatch(setUserIdAction(data.member.USER_ID));
                } else {
                    dispatch(setIsLoginAction(false));
                    dispatch(setUserIdAction(''));
                }
            })
            .catch(error => {
                console.log('[getMember] AJAX GET MEMBER COMMUNICATION ERROR()');
            })
            .finally(() => {
                console.log('[getMember] AJAX GET MEMBER COMMUNICATION COMPLETE');
            });
    }

    // Return null or JSX if needed
    return null;
}

export default GET_MEMBER;