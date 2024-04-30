import React, { useState, useEffect } from 'react';
import axios from 'axios';
import $ from 'jquery';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUIdAction, setUPwAction, setUEmailAction, setUNicknameAction, setUFrontImgNameAction, setIsLoginAction, setMemberIdAction } from '../action/joinActions';

axios.defaults.withCredentials = true;


const Join = () => {

    const dispatch = useDispatch();
    const [uId, setUId] = useState('');
    const [uPw, setUPw] = useState('');
    const [uEmail, setUEmail] = useState('');
    const [uNickname, setUNickname] = useState('');
    const [uFrontImgName, setUFrontImgName] = useState('');

    const navigate = useNavigate();

    // handler
    const memberInfoChangeHandler = (e) => {
        console.log('[JOIN] memberInfoChangeHandler()');

        let input_name = e.target.name;
        let input_value = e.target.value;
        if (input_name === 'uId') {
            setUId(input_value);
            dispatch(setUIdAction(input_value));
        } else if (input_name === 'uPw') {
            setUPw(input_value);
            dispatch(setUPwAction(input_value));

        } else if (input_name === 'uEmail') {
            setUEmail(input_value);
            dispatch(setUEmailAction(input_value));

        } else if (input_name === 'uNickname') {
            setUNickname(input_value);
            dispatch(setUNicknameAction(input_value));

        } else if (input_name === 'uFrontImgName') {
            setUFrontImgName(input_value);
            dispatch(setUFrontImgNameAction(input_value));

        }

    }

    const joinResetBtnClickHandler = () => {
        console.log('[JOIN] joinResetBtnClickHandler()');

        setUId('');
        setUPw('');
        setUEmail('');
        setUNickname('');
        setUFrontImgName('');
        dispatch(setUIdAction(''));
        dispatch(setUPwAction(''));
        dispatch(setUEmailAction(''));
        dispatch(setUNicknameAction(''));
        dispatch(setUFrontImgNameAction(''));
    }

    const joinSubmitBtnClickHandler = () => {
        console.log('[JOIN] joinSubmitBtnClickHandler()');

        let form = document.member_join_form;

        if (uId === '') {
            alert('INPUT USER ID');
            form.uId.focus();

        } else if (uPw === '') {
            alert('INPUT USER PW');
            form.uPw.focus();

        } else if (uEmail === '') {
            alert('INPUT USER MAIL');
            form.uEmail.focus();

        } else if (uNickname === '') {
            alert('INPUT USER PHONE');
            form.uNickname.focus();

        } else {
            // ajax_member_join();
            axiosMemberJoin();

        }

    }

    const axiosMemberJoin = () => {
        console.log('[JOIN] axiosMemberJoin()');

        let uFrontImgName = $('input[name="uFrontImgName"]');
        let files = uFrontImgName[0].files;

        let formData = new FormData();
        formData.append("uId", uId);
        formData.append("uPw", uPw);
        formData.append("uEmail", uEmail);
        formData.append("uNickname", uNickname);
        formData.append("uFrontImgName", files[0]);

        axios({
            url: `http://localhost:3001/member/signUpConfirm`,
            method: 'post',
            data: formData,
        })
            .then(response => {
                console.log('[JOIN] AJAX MEMBER_JOIN COMMUNICATION SUCCESS');

                if (response.data !== null && response.data > 0) {
                    alert('MEMBER JOIN PROCESS SUCCESS!!');
                    navigate('/');

                } else {
                    alert('MEMBER JOIN PROCESS FAIL!!');
                    setUId('');
                    setUPw('');
                    setUEmail('');
                    setUNickname('');
                    setUFrontImgName('');
                    dispatch(setUIdAction(''));
                    dispatch(setUPwAction(''));
                    dispatch(setUEmailAction(''));
                    dispatch(setUNicknameAction(''));
                    dispatch(setUFrontImgName(''));

                }

            })
            .catch(error => {
                console.log('[JOIN] AJAX MEMBER_JOIN COMMUNICATION ERROR');

            })
            .finally(data => {
                console.log('[JOIN] AJAX MEMBER_JOIN COMMUNICATION FINALLY');

            });

    }

    return (

        <div>
            <img src='resource/img/logo.jpg' />

            <p>MEMBER JOIN FORM</p>
            <form name="memberJoinForm">
                <input type="text" name="uId" value={uId} onChange={(e) => memberInfoChangeHandler(e)} placeholder="INPUT USER ID" /><br />
                <input type="password" name="uPw" value={uPw} onChange={(e) => memberInfoChangeHandler(e)} placeholder="INPUT USER PW" /><br />
                <input type="text" name="uEmail" value={uEmail} onChange={(e) => memberInfoChangeHandler(e)} placeholder="INPUT USER MAIL" /><br />
                <input type="text" name="uNickname" value={uNickname} onChange={(e) => memberInfoChangeHandler(e)} placeholder="INPUT USER NICKNAME" /><br />
                <input type="file" name="uFrontImgName" value={uFrontImgName} onChange={(e) => memberInfoChangeHandler(e)} placeholder="SELECT USER PROFILE IMAGE" /><br />
                <input type="button" value="JOIN" onClick={joinSubmitBtnClickHandler} />
                <input type="reset" value="RESET" onClick={joinResetBtnClickHandler} />
            </form>


        </div>

    );
};

export default Join;