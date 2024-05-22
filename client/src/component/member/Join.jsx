import React, { useState } from 'react';
import axios from 'axios';
import $ from 'jquery';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUIdAction, setUPwAction, setUEmailAction, setUNicknameAction, setUFrontImgNameAction } from '../action/joinActions';
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

        let form = document.memberJoinForm;

        if (uId === '') {
            alert('아이디를 입력하세요!');
            form.uId.focus();

        } else if (uPw === '') {
            alert('비밀번호를 입력하세요!');
            form.uPw.focus();

        } else if (uEmail === '') {
            alert('메일을 입력하세요!');
            form.uEmail.focus();

        } else if (uNickname === '') {
            alert('닉네임을 입력하세요!');
            form.uNickname.focus();

        } else {

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
                console.log('[JOIN] AXIOS MEMBER_JOIN COMMUNICATION SUCCESS');

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
                console.log('[JOIN] AXIOS MEMBER_JOIN COMMUNICATION ERROR');

            })
            .finally(data => {
                console.log('[JOIN] AXIOS MEMBER_JOIN COMMUNICATION FINALLY');

            });

    }

    return (
        <div className="joinContainer">
            <div className="joinForm">
                <p>MEMBER JOIN FORM</p>
                <form name="memberJoinForm">
                    <input type="text" name="uId" value={uId} onChange={memberInfoChangeHandler} placeholder="아이디를 입력하세요." /><br />
                    <input type="password" name="uPw" value={uPw} onChange={memberInfoChangeHandler} placeholder="비밀번호를 입력하세요." /><br />
                    <input type="text" name="uEmail" value={uEmail} onChange={memberInfoChangeHandler} placeholder="메일을 입력하세요." /><br />
                    <input type="text" name="uNickname" value={uNickname} onChange={memberInfoChangeHandler} placeholder="닉네임을 입력하세요." /><br />
                    <input type="file" name="uFrontImgName" value={uFrontImgName} onChange={memberInfoChangeHandler} placeholder="프로필 이미지를 선택하세요." /><br />
                    <input type="button" value="회원가입" onClick={joinSubmitBtnClickHandler} />
                    <input type="reset" value="RESET" onClick={joinResetBtnClickHandler} />
                </form>
            </div>
        </div>
    );
};


export default Join;