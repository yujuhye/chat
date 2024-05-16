import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setYourIdAction, setYourEmailAction } from '../action/findPasswordActions';

axios.defaults.withCredentials = true;

const FindPassword = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [yourId, setYourId] = useState('');
    const [yourEmail, setYourEmail] = useState('');


    const memberInfoChangeHandler = (e) => {
        console.log('[FindPassword] memberInfoChangeHandler()');

        let input_name = e.target.name;
        let input_value = e.target.value;

        if (input_name === 'yourId') {
            setYourId(input_value);
            dispatch(setYourIdAction(input_value));

        } else if (input_name === 'yourEmail') {
            setYourEmail(input_value);
            dispatch(setYourEmailAction(input_value));
        }
    }

    const findPasswordBtnClickHandler = () => {
        console.log('[FindPassword] findPasswordBtnClickHandler()');

        axiosFindPassword();
    }

    const findPasswordResetBtnClickHandler = () => {
        console.log('[FindPassword] findPasswordResetBtnClickHandler()');

        setYourId('');
        setYourEmail('');
        dispatch(setYourIdAction(''));
        dispatch(setYourEmailAction(''));
    }

    const axiosFindPassword = () => {
        console.log('[FindPassword] axiosFindPassword()');

        axios({
            url: 'http://localhost:3001/member/findPassword',
            method: 'post',
            data: {
                'yourId': yourId,
                'yourEmail': yourEmail
            },
            withCredentials: true
        })
            .then(response => {
                console.log('AXIOS FIND PASSWORD COMMUNICATION SUCCESS', response.data);

                if (response.data.error) {
                    alert(response.data.error);

                } else {
                    alert('이메일로 비밀번호를 전송하였습니다.');
                    navigate("/");
                }
            })
            .catch(error => {
                console.log('AXIOS FIND PASSWORD COMMUNICATION ERROR');
            })
            .finally(data => {
                console.log('AJAX FIND PASSWORD COMMUNICATION FINALLY');
            });
    }

    return (

        <div>
            <p>비밀번호 찾기</p>
            <form name="findPasswordForm">
                <input type="text" name="yourId" value={yourId} onChange={(e) => memberInfoChangeHandler(e)} placeholder="아이디를 입력하세요." /><br />
                <input type="text" name="yourEmail" value={yourEmail} onChange={(e) => memberInfoChangeHandler(e)} placeholder="메일을 입력하세요." /><br />
                <input type="button" value="비밀번호 찾기" onClick={findPasswordBtnClickHandler} />
                <input type="reset" value="RESET" onClick={findPasswordResetBtnClickHandler} />
            </form>
        </div>

    );
};

export default FindPassword;