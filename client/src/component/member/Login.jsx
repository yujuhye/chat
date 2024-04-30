import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUIdAction, setUPwAction, setIsLoginAction, setUserIdAction } from '../action/loginActions';
import GET_MEMBER from '../../util/getmembers';
// import { SERVER_URL } from '../../util/url';

axios.defaults.withCredentials = true;

const Login = () => {

    // useEffect(() => {
    //     GET_MEMBER(); // useEffect 내에서 GET_MEMBER 함수 호출
    // }, []);

    const dispatch = useDispatch();
    const [uId, setUId] = useState(''); // mId와 mPw의 상태를 정의해주어야 합니다.
    const [uPw, setUPw] = useState('');

    const navigate = useNavigate();

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
            alert('INPUT USER ID');
            form.uId.focus();

        } else if (uPw === '') {
            alert('INPUT USER PW');
            form.uPw.focus();

        } else {
            axiosMemberLogin();

        }

    }

    const loginResetBtnClickHandler = () => {
        console.log('[LOGIN] loginResetBtnClickHandler()');

        setUId(''); setUPw('');
        dispatch(setUIdAction('')); // 상태 업데이트
        dispatch(setUPwAction('')); // 상태 업데이트
    }

    // axios
    const axiosMemberLogin = () => {

        console.log('[LOGIN] axiosMemberLogin()');

        axios({
            // url: `${SERVER_URL.TARGET_URL()}/member/signinConfirm`,
            url: `http://localhost:3001/member/signinConfirm`,
            method: 'get',
            params: {
                'uId': uId,
                'uPw': uPw,
            }
        })
            .then(response => {
                console.log('[LOGIN] AXIOS MEMBER_LOGIN COMMUNICATION SUCCESS');
                console.log('[LOGIN] data ---> ', response.data);
                console.log('[LOGIN] data.sessionID ---> ', response.data.sessionID);

                if (response.data !== null) {
                    alert('MEMBER LOGIN PROCESS SUCCESS!!');
                    // sessionStorage.setItem('sessionID', response.data.sessionID);
                    dispatch(setIsLoginAction(true));
                    dispatch(setUserIdAction(response.data.sessionID));

                    navigate('/List');

                } else {
                    alert('MEMBER LOGIN PROCESS FAIL!!');
                    dispatch(setIsLoginAction(false));
                    dispatch(setUserIdAction(''));

                }

            })
            .catch(error => {
                console.log('[LOGIN] AXIOS MEMBER_LOGIN COMMUNICATION ERROR');

            })
            .finally(data => {
                console.log('[LOGIN] AXIOS MEMBER_LOGIN COMMUNICATION COMPLETE');

            });

    }

    return (
        <div>
            <div>
                <img src='resource/img/logo.jpg' />

                <p>MEMBER LOGIN FORM</p>
                <form name="memberLoginForm">
                    <input type="text" name="uId" value={uId} onChange={(e) => memberInfoChangeHandler(e)} placeholder="INPUT USER ID" /><br />
                    <input type="password" name="uPw" value={uPw} onChange={(e) => memberInfoChangeHandler(e)} placeholder="INPUT USER PW" /><br />
                    <input type="button" value="LOGIN" onClick={loginSubmitBtnClickHandler} />
                    <input type="button" value="RESET" onClick={loginResetBtnClickHandler} />
                </form>

            </div>
            <div>
                <Link to="/join">회원가입</Link>
            </div>
        </div>

    );
};

export default Login;