import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAIdAction, setAPwAction, setAEmailAction } from '../../action/adminJoinActions';

axios.defaults.withCredentials = true;

const AdminJoin = () => {

    const dispatch = useDispatch();
    const [aId, setAId] = useState('');
    const [aPw, setAPw] = useState('');
    const [aEmail, setAEmail] = useState('');

    const navigate = useNavigate();

    // handler
    const adminInfoChangeHandler = (e) => {
        console.log('[AdminJoin] adminInfoChangeHandler()');

        let input_name = e.target.name;
        let input_value = e.target.value;
        if (input_name === 'aId') {
            setAId(input_value);
            dispatch(setAIdAction(input_value));
        } else if (input_name === 'aPw') {
            setAPw(input_value);
            dispatch(setAPwAction(input_value));
            console.log('input_value ---> ', setAPwAction(input_value));

        } else if (input_name === 'aEmail') {
            setAEmail(input_value);
            dispatch(setAEmailAction(input_value));
        }
    }

    const adminJoinResetBtnClickHandler = () => {
        console.log('[AdminJoin] adminJoinResetBtnClickHandler()');

        setAId('');
        setAPw('');
        setAEmail('');
        dispatch(setAIdAction(''));
        dispatch(setAPwAction(''));
        dispatch(setAEmailAction(''));
    }

    const adminJoinSubmitBtnClickHandler = () => {
        console.log('[AdminJoin] adminJoinSubmitBtnClickHandler()');

        let form = document.adminJoinForm;

        if (aId === '') {
            alert('아이디를 입력하세요!');
            form.aId.focus();

        } else if (aPw === '') {
            alert('비밀번호를 입력하세요!');
            form.aPw.focus();

        } else if (aEmail === '') {
            alert('이메일을 입력하세요!');
            form.aEmail.focus();

        } else {
            axiosAdminJoin();
        }
    }

    const axiosAdminJoin = () => {

        const requestData = {
            aId: aId,
            aPw: aPw,
            aEmail: aEmail
        };

        axios({
            url: `http://localhost:3001/admin/adminSignUpConfirm`,
            method: 'post',
            data: requestData,
            withCredentials: true,
        })
            .then(response => {

                console.log('[AdminJoin] AXIOS ADMIN JOIN COMMUNICATION SUCCESS');

                if (response.data !== null && response.data > 0) {
                    alert('ADMIN JOIN PROCESS SUCCESS!!');
                    navigate('/admin/home');

                } else {
                    alert('ADMIN JOIN PROCESS FAIL!!');
                    setAId('');
                    setAPw('');
                    setAEmail('');
                    dispatch(setAIdAction(''));
                    dispatch(setAPwAction(''));
                    dispatch(setAEmailAction(''));

                }
            })
            .catch(error => {
                console.log('[AdminJoin] AXIOS MEMBER_JOIN COMMUNICATION ERROR');

            })
            .finally(data => {
                console.log('[AdminJoin] AXIOS MEMBER_JOIN COMMUNICATION FINALLY');

            });
    }

    return (

        <div>
            <p>ADMIN JOIN FORM</p>
            <form name="adminJoinForm">
                <input type="text" name="aId" value={aId} onChange={(e) => adminInfoChangeHandler(e)} placeholder="아이디를 입력하세요." /><br />
                <input type="password" name="aPw" value={aPw} onChange={(e) => adminInfoChangeHandler(e)} placeholder="비밀번호를 입력하세요." /><br />
                <input type="text" name="aEmail" value={aEmail} onChange={(e) => adminInfoChangeHandler(e)} placeholder="메일을 입력하세요." /><br />
                <input type="button" value="JOIN" onClick={adminJoinSubmitBtnClickHandler} />
                <input type="reset" value="RESET" onClick={adminJoinResetBtnClickHandler} />
            </form>
        </div>
    );
}

export default AdminJoin;