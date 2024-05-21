import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUIdAction, setUPwAction, setIsLoginAction, setUserIdAction } from '../action/loginActions';
import useAxiosGetMember from "../../util/useAxiosGetMember";
import cookie from 'js-cookie';
import { GoogleLogin } from '@react-oauth/google';
import '../../css/member/login.css';
import * as jwt_decode from 'jwt-decode';
import io from 'socket.io-client'; // 0519 추가
const socket = io('http://localhost:3001'); // 0519 추가


axios.defaults.withCredentials = true;
const CLIENT_ID = 'here!!!!';

const Login = () => {
    const dispatch = useDispatch();
    const [uId, setUId] = useState('');
    const [uPw, setUPw] = useState('');
    const navigate = useNavigate();
    useAxiosGetMember();

    const memberInfoChangeHandler = (e) => {
        const { name, value } = e.target;
        if (name === 'uId') {
            setUId(value);
            dispatch(setUIdAction(value));
        } else if (name === 'uPw') {
            setUPw(value);
            dispatch(setUPwAction(value));
        }
    };

    const loginSubmitBtnClickHandler = () => {
        if (uId === '') {
            alert('아이디를 입력하세요!');
        } else if (uPw === '') {
            alert('비밀번호를 입력하세요!');
        } else {
            axiosMemberLogin();
        }
    };


    const axiosMemberLogin = () => {
        axios.post('http://localhost:3001/member/signinConfirm', { uId, uPw }, { withCredentials: true })
            .then(response => {
                const { userToken } = response.data;
                if (userToken) {
                    alert('MEMBER LOGIN PROCESS SUCCESS!!');
                    cookie.set('userToken', userToken);
                    dispatch(setIsLoginAction(true));
                    dispatch(setUserIdAction(uId));


                    console.log('dispatch(setUserIdAction(uId) --> ', dispatch(setUserIdAction(uId)));
                    // 0519 소켓 서버에 로그인 이벤트 보내기
                    socket.emit('login', uId);

                    navigate('/friend/friendList');
                } else {
                    alert('MEMBER LOGIN PROCESS FAIL!!');
                    dispatch(setIsLoginAction(false));
                    dispatch(setUserIdAction(''));
                }
            })
            .catch(() => {
                console.log('[LOGIN] AXIOS MEMBER_LOGIN COMMUNICATION ERROR');
            });
    };

    const onGoogleLoginSuccess = async (response) => {
        try {
            const res = await axios.post('http://localhost:3001/auth/google', { token: response.credential });
            const { token } = res.data;
            if (token) {
                alert('Google Login Successful!');
                cookie.set('userToken', token);
                dispatch(setIsLoginAction(true));
                dispatch(setUserIdAction('GoogleUser'));
                navigate('/friend/friendList');
            }
        } catch (error) {
            console.error('Error sending token to backend:', error);
        }
    };

    const onGoogleLoginFailure = (response) => {
        console.log('Google Login failed:', response);
    };

    return (
        <div className="loginContainer">
            <div className="loginForm">
                <img src='/resource/img/logo.jpg' alt="Logo" className="loginLogo" />
                <p>CHAT SQUARE</p>
                <form name="memberLoginForm">
                    <input type="text" name="uId" value={uId} onChange={memberInfoChangeHandler} placeholder="아이디를 입력하세요." /><br />
                    <input type="password" name="uPw" value={uPw} onChange={memberInfoChangeHandler} placeholder="비밀번호를 입력하세요." /><br />
                    <input type="button" value="로그인" onClick={loginSubmitBtnClickHandler} />
                </form>

                <div className="googleLoginButton">
                    <GoogleLogin
                        clientId={CLIENT_ID}
                        onSuccess={onGoogleLoginSuccess}
                        onFailure={onGoogleLoginFailure}
                        render={(renderProps) => (
                            <button
                                onClick={renderProps.onClick}
                                disabled={renderProps.disabled}
                                style={{ width: '100%', height: '50px', fontSize: '1rem' }}
                            >
                                Login with Google
                            </button>
                        )}
                    />
                </div>
            </div>

            <div className="loginFooter">
                <div className="left">
                    <Link to="/admin">ADMIN</Link>
                </div>
                <div className="right">
                    <Link to="/member/join">회원가입</Link>
                    <Link to="/member/findpassword">비밀번호 찾기</Link>
                </div>
            </div>

        </div>
    );
};

export default Login;