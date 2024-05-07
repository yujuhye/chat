import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAIdAction, setAPwAction, setIsAdminLoginAction, setAdminIdAction } from '../../action/adminLoginActions';

// import { SERVER_URL } from '../../util/url';

axios.defaults.withCredentials = true;

const AdminLogin = () => {

    const dispatch = useDispatch();
    const [aId, setAId] = useState(''); // mId와 mPw의 상태를 정의해주어야 합니다.
    const [aPw, setAPw] = useState('');

    const navigate = useNavigate();

    // handler
    const adminInfoChangeHandler = (e) => {
        console.log('[AdminLogin] adminInfoChangeHandler()');

        let input_name = e.target.name;
        let input_value = e.target.value;
        if (input_name === 'aId') {
            setAId(input_value);
            dispatch(setAIdAction(input_value));
        } else if (input_name === 'aPw') {
            setAPw(input_value);
            dispatch(setAPwAction(input_value));

        }
    }

    const adminLoginSubmitBtnClickHandler = () => {
        console.log('[AdminLogin] adminLoginSubmitBtnClickHandler()');

        let form = document.adminLoginForm;
        if (aId === '') {
            alert('INPUT ADMIN ID');
            form.aId.focus();

        } else if (aPw === '') {
            alert('INPUT ADMIN PW');
            form.aPw.focus();

        } else {
            axiosAdminLogin();

        }

    }

    const adminLoginResetBtnClickHandler = () => {
        console.log('[AdminLogin] loginResetBtnClickHandler()');

        setAId(''); setAPw('');
        dispatch(setAIdAction(''));
        dispatch(setAPwAction(''));
    }

    // axios
    const axiosAdminLogin = () => {

        console.log('[AdminLogin] axiosAdminLogin()');

        axios({
            url: `http://localhost:3001/admin/adminSigninConfirm`,
            method: 'get',
            params: {
                'aId': aId,
                'aPw': aPw,
            },
        })
            .then(response => {
                console.log('[AdminLogin] AXIOS ADMIN LOGIN COMMUNICATION SUCCESS');
                console.log('[AdminLogin] data ---> ', response.data);
                console.log('[AdminLogin] data.sessionID ---> ', response.data.adminSessionID);

                if (response.data !== null) {
                    alert('ADMIN LOGIN PROCESS SUCCESS!!');
                    sessionStorage.setItem('adminSessionID', response.data.adminSessionID);
                    dispatch(setIsAdminLoginAction(true));
                    dispatch(setAdminIdAction(response.data.adminSessionID));

                    navigate('/admin/home');

                } else {
                    alert('MEMBER LOGIN PROCESS FAIL!!');
                    dispatch(setIsAdminLoginAction(false));
                    dispatch(setAdminIdAction(''));

                }

            })
            .catch(error => {
                console.log('[AdminLogin] AXIOS ADMIN LOGIN COMMUNICATION ERROR');

            })
            .finally(data => {
                console.log('[AdminLogin] AXIOS ADMIN LOGIN COMMUNICATION COMPLETE');

            });

    }

    return (
        <div>
            <div>
                <img src='/resource/img/logo.jpg' />

                <p>ADMIN LOGIN FORM</p>
                <form name="adminLoginForm">
                    <input type="text" name="aId" value={aId} onChange={(e) => adminInfoChangeHandler(e)} placeholder="INPUT ADMIN ID" /><br />
                    <input type="password" name="aPw" value={aPw} onChange={(e) => adminInfoChangeHandler(e)} placeholder="INPUT ADMIN PW" /><br />
                    <input type="button" value="LOGIN" onClick={adminLoginSubmitBtnClickHandler} />
                    <input type="button" value="RESET" onClick={adminLoginResetBtnClickHandler} />
                </form>

            </div>
            <div>
                <Link to="/admin/AdminJoin">회원가입</Link><br />
            </div>
        </div>

    );
};

export default AdminLogin;