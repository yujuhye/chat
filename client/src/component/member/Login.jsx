import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUIdAction, setUPwAction, setIsLoginAction, setUserIdAction } from '../action/loginActions';
import useAxiosGetMember from "../../util/useAxiosGetMember";

axios.defaults.withCredentials = true;

const Login = () => {

    const dispatch = useDispatch();
    const [uId, setUId] = useState('');
    const [uPw, setUPw] = useState('');

    const navigate = useNavigate();

    useAxiosGetMember();

    // handler
    const memberInfoChangeHandler = (e) => {
        console.log('[LOGIN] memberInfoChangeHandler()');

        let input_name = e.target.name;
        let input_value = e.target.value;
        if (input_name === 'uId') {
            setUId(input_value);
            dispatch(setUIdAction(input_value));
        } else if (input_name === 'uPw') {
            setUPw(input_value);
            dispatch(setUPwAction(input_value));

        }
    }

    const loginSubmitBtnClickHandler = () => {
        console.log('[LOGIN] loginSubmitBtnClickHandler()');

        let form = document.memberLoginForm;
        if (uId === '') {
            alert('아이디를 입력하세요!');
            form.uId.focus();

        } else if (uPw === '') {
            alert('비밀번호를 입력하세요!');
            form.uPw.focus();

        } else {
            axiosMemberLogin();
        }
    }

    const loginResetBtnClickHandler = () => {
        console.log('[LOGIN] loginResetBtnClickHandler()');

        setUId(''); setUPw('');
        dispatch(setUIdAction(''));
        dispatch(setUPwAction(''));
    }

    // axios
    const axiosMemberLogin = () => {

        console.log('[LOGIN] axiosMemberLogin()');

        axios.post('http://localhost:3001/member/signinConfirm', {
            uId: uId,
            uPw: uPw
        }, { withCredentials: true })
            .then(response => {
                console.log('[LOGIN] AXIOS MEMBER_LOGIN COMMUNICATION SUCCESS');
                const { userToken } = response.data;
                if (userToken) {
                    alert('MEMBER LOGIN PROCESS SUCCESS!!');

                    document.cookie = `userToken=${userToken}`;
                    dispatch(setIsLoginAction(true));
                    dispatch(setUserIdAction(uId));

                    console.log('dispatch(setUserIdAction(uId) --> ', dispatch(setUserIdAction(uId)));

                    navigate('/friend/friendList');

                } else {

                    alert('MEMBER LOGIN PROCESS FAIL!!');
                    dispatch(setIsLoginAction(false));
                    dispatch(setUserIdAction(''));
                }
            })
            .catch(error => {
                console.log('[LOGIN] AXIOS MEMBER_LOGIN COMMUNICATION ERROR');

            })
            .finally(() => {
                console.log('[LOGIN] AXIOS MEMBER_LOGIN COMMUNICATION COMPLETE');
            });
    };

    const handleGoogleLogin = async () => {
        try {
            const response = await axios.get('http://localhost:3001/auth/google', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.userToken) {
                console.log('[LOGIN] response.data ---> ', response.data);
                const { userToken, userId } = response.data;
                console.log('[LOGIN] AXIOS GOOGLE MEMBER LOGIN COMMUNICATION SUCCESS');
                document.cookie = `userToken=${userToken}; path=/`;
                dispatch(setIsLoginAction(true));
                dispatch(setUserIdAction(userId));

                navigate('/friend/friendList');
            } else {
                alert('MEMBER LOGIN PROCESS FAIL!!');
                dispatch(setIsLoginAction(false));
                dispatch(setUserIdAction(''));
            }
        } catch (error) {
            console.log('Error:', error);
        }
    }

    return (
        <div>
            <div>
                <img src='/resource/img/logo.jpg' />

                <p>MEMBER LOGIN FORM</p>
                <form name="memberLoginForm">
                    <input type="text" name="uId" value={uId} onChange={(e) => memberInfoChangeHandler(e)} placeholder="아이디를 입력하세요." /><br />
                    <input type="password" name="uPw" value={uPw} onChange={(e) => memberInfoChangeHandler(e)} placeholder="비밀번호를 입력하세요." /><br />
                    <input type="button" value="로그인" onClick={loginSubmitBtnClickHandler} />
                    <input type="button" value="RESET" onClick={loginResetBtnClickHandler} />
                </form>

            </div>
            <div>
                <Link to="/member/join">회원가입</Link><br />
                <Link to="/member/findpassword">비밀번호 찾기</Link><br />
                <Link to="/admin">ADMIN</Link><br />
                <button onClick={handleGoogleLogin}>with Google</button>
            </div>
        </div>

    );
};

export default Login;