import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAIdAction, setAPwAction, setIsAdminLoginAction, setAdminIdAction } from '../../action/adminLoginActions';
import cookie from 'js-cookie';
import '../../../css/admin/adminmember/adminlogin.css';

axios.defaults.withCredentials = true;

const AdminLogin = () => {

    const dispatch = useDispatch();
    const [aId, setAId] = useState('');
    const [aPw, setAPw] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const adminToken = cookie.get('adminToken');
        if (adminToken) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

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
            alert('아이디를 입력하세요!');
            form.aId.focus();

        } else if (aPw === '') {
            alert('비밀번호를 입력하세요!');
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

        axios.post('http://localhost:3001/admin/adminSigninConfirm', {
            'aId': aId,
            'aPw': aPw,
        }, { withCredentials: true })
            .then(response => {
                console.log('[AdminLogin] AXIOS ADMIN LOGIN COMMUNICATION SUCCESS');
                const { adminToken } = response.data;
                if (adminToken) {
                    alert('ADMIN LOGIN PROCESS SUCCESS!!');

                    document.cookie = `adminToken=${adminToken}`;
                    dispatch(setIsAdminLoginAction(true));
                    dispatch(setAdminIdAction(aId));

                    navigate('/admin');

                } else {

                    alert('ADMIN LOGIN PROCESS FAIL!!');
                    dispatch(setIsAdminLoginAction(false));
                    dispatch(setAdminIdAction(''));
                }
            })
            .catch(error => {
                console.log('[AdminLogin] AXIOS ADMIN LOGIN COMMUNICATION ERROR');
            })
            .finally(() => {
                console.log('[AdminLogin] AXIOS ADMIN LOGIN COMMUNICATION COMPLETE');
            });
    };

    return (
        <div className="loginContainer">
            <div className="loginForm">
                <img src='/resource/img/logo.jpg' alt="Logo" className="loginLogo" />
                <p>CHAT SQUARE ADMIN</p>
                <form name="adminLoginForm">
                    <input type="text" name="aId" value={aId} onChange={adminInfoChangeHandler} placeholder="아이디를 입력하세요." /><br />
                    <input type="password" name="aPw" value={aPw} onChange={adminInfoChangeHandler} placeholder="비밀번호를 입력하세요." /><br />
                    <input type="button" value="LOGIN" onClick={adminLoginSubmitBtnClickHandler} />

                </form>
            </div>
            <div className="loginFooter">
            </div>
        </div>
    );
};

export default AdminLogin;