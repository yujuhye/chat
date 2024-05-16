import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setMIdAction, setMPwAction, setMEmailAction, setMNicknameAction, setCurMIdAction, setCurMPwAction, setCurMEmailAction, setCurMNicknameAction, } from '../action/memberModifyActions';
import Nav from '../../include/Nav';
import cookie from 'js-cookie';

axios.defaults.withCredentials = true;

const MemberModify = () => {
    const dispatch = useDispatch();

    const [curMId, setCurMId] = useState('');
    const [curMPw, setCurMPw] = useState('');
    const [curMEmail, setCurMEmail] = useState('');
    const [curMNickname, setCurMNickname] = useState('');

    const [mId, setMId] = useState('');
    const [mPw, setMPw] = useState('*******');
    const [mEmail, setMEmail] = useState('');
    const [mNickname, setMNickname] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        console.log('[MemberModify] useEffect()');

        const userToken = cookie.get('userToken');
        if (!userToken) {
            navigate('/member/login');

        } else {
            axios.get(
                'http://localhost:3001/member/getMember',
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    },
                    withCredentials: true
                }
            ).then(response => {
                console.log('[MemberModify] AXIOS GET MEMBER COMMUNICATION SUCCESS');

                if (response.data !== null) {
                    console.log('AXIOS GET MEMBER COMMUNICATION SUCCESS', response.data);

                    if (response.data === null) {
                        navigate("/member/login");
                        return;
                    }

                    const member = response.data.member;

                    setMId(member.USER_ID);
                    setMPw('*******');
                    setMEmail(member.USER_EMAIL);
                    setMNickname(member.USER_NICKNAME);

                    setCurMId(member.USER_ID);
                    setCurMPw('*******');
                    setCurMEmail(member.USER_EMAIL);
                    setCurMNickname(member.USER_NICKNAME);

                    dispatch(setMIdAction(member.USER_ID));
                    dispatch(setMPwAction(member.USER_PW));
                    dispatch(setMEmailAction(member.USER_EMAIL));
                    dispatch(setMNicknameAction(member.USER_NICKNAME));

                    dispatch(setCurMIdAction(member.USER_ID));
                    dispatch(setCurMPwAction(member.USER_PW));
                    dispatch(setCurMEmailAction(member.USER_EMAIL));
                    dispatch(setCurMNicknameAction(member.USER_NICKNAME));
                }
            }).catch(error => {
                console.error('AXIOS GET MEMBER COMMUNICATION ERROR', error);
            });
        }
    }, []);


    // handler
    const memberInfoChangeHandler = (e) => {
        console.log('[MemberModify] memberInfoChangeHandler()');

        let input_name = e.target.name;
        let input_value = e.target.value;

        if (input_name === 'mId') {

            setMId(input_value);
            dispatch(setMIdAction(input_value));

        } else if (input_name === 'mPw') {
            setMPw(input_value);
            dispatch(setMPwAction(input_value));

        } else if (input_name === 'mEmail') {
            setMEmail(input_value);
            dispatch(setMEmailAction(input_value));

        } else if (input_name === 'mNickname') {
            setMNickname(input_value);
            dispatch(setMNicknameAction(input_value));

        }

    }

    const memberModifyResetBtnClickHandler = () => {
        console.log('[MemberModify] memberModifyResetBtnClickHandler()');

        setMId(curMId);
        setMPw('*******');
        setMEmail(curMEmail);
        setMNickname(curMNickname);
        dispatch(setMIdAction(curMId));
        dispatch(setMPwAction(curMPw));
        dispatch(setMEmailAction(curMEmail));
        dispatch(setMNicknameAction(curMNickname));
        setCurMId(curMId);
        setCurMPw(curMPw);
        setCurMEmail(curMEmail);
        setCurMNickname(curMNickname);
    }



    const memberModifySubmitBtnClickHandler = () => {
        console.log('[MemberModify] memberModifySubmitBtnClickHandler()');

        let form = document.memberModifyForm;

        if (mEmail === '') {
            alert('메일을 입력하세요!');
            form.mEmail.focus();

        } else if (mPw === '') {
            alert('비밀번호를 입력하세요!');
            form.mPw.focus();

        } else if (mPw === '*******') {
            alert('현재 또는 변경할 비밀번호를 입력하세요!');
            form.mPw.focus();

        } else if (mNickname === '') {
            alert('닉네임을 입력하세요!');
            form.mNickname.focus();

        } else {

            axiosMemberModify();

        }

    }

    const axiosMemberModify = () => {
        console.log('[MemberModify] axiosMemberModify()');
        console.log('[MemberModify] userToken ---> ', cookie.get('userToken'));

        const userToken = cookie.get('userToken');

        const requestData = {
            userToken: userToken,
            mId: mId,
            mPw: mPw,
            mEmail: mEmail,
            mNickname: mNickname
        };

        axios.post('http://localhost:3001/member/modifyConfirm', requestData, {
            headers: {
                Authorization: userToken
            }
        })
            .then(response => {
                console.log('[MemberModify] AXIOS MEMBER MODIFY COMMUNICATION SUCCESS');

                console.log('[MemberModify] response.data ---> ', response.data);

                if (response.data !== null && response.data > 0) {
                    alert('MEMBER MODIFY PROCESS SUCCESS!!');
                    navigate('/');

                } else {
                    alert('MEMBER MODIFY PROCESS FAIL!!');
                    setMId(curMId);
                    setMPw(curMPw);
                    setMEmail(curMEmail);
                    setMNickname(curMNickname);
                    dispatch(setMIdAction(curMId));
                    dispatch(setMPwAction(curMPw));
                    dispatch(setMEmailAction(curMEmail));
                    dispatch(setMNicknameAction(curMNickname));
                    navigate('/member/login');
                }

            })
            .catch(error => {
                console.log('[MemberModify] AXIOS MEMBER MODIFY COMMUNICATION ERROR');

                if (error.response && error.response.data && error.response.data.error) {
                    alert(error.response.data.error);
                    navigate('/member/login');

                } else {
                    console.error('Unknown error occurred:', error);
                }

            })
            .finally(data => {
                console.log('[MemberModify] AXIOS MEMBER MODIFY COMMUNICATION FINALLY');

            });

    }

    return (

        <div>
            <Nav />
            <p>회원 정보 수정</p>
            <form name="memberModifyForm">
                <input type="text" name="mId" value={mId} readOnly disabled /><br />
                <input type="password" name="mPw" value={mPw} onChange={(e) => memberInfoChangeHandler(e)} placeholder="비밀번호를 입력하세요." /><br />
                <input type="text" name="mEmail" value={mEmail} onChange={(e) => memberInfoChangeHandler(e)} placeholder="메일을 입력하세요." /><br />
                <input type="text" name="mNickname" value={mNickname} onChange={(e) => memberInfoChangeHandler(e)} placeholder="닉네임을 입력하세요." /><br />
                <input type="button" value="정보수정" onClick={memberModifySubmitBtnClickHandler} />
                <input type="reset" value="RESET" onClick={memberModifyResetBtnClickHandler} />
            </form>
        </div>

    );
};

export default MemberModify;