import { SET_MID, SET_MPW, SET_MEMAIL, SET_MNICKNAME, SET_CUR_MID, SET_CUR_MPW, SET_CUR_MEMAIL, SET_CUR_MNICKNAME } from './types';

export const setMIdAction = (mId) => ({
    type: SET_MID,
    payload: mId
});

export const setMPwAction = (mPw) => ({
    type: SET_MPW,
    payload: mPw
});

export const setMEmailAction = (mEmail) => ({
    type: SET_MEMAIL,
    payload: mEmail
});

export const setMNicknameAction = (mNickname) => ({
    type: SET_MNICKNAME,
    payload: mNickname
});

export const setCurMIdAction = (curMId) => ({
    type: SET_CUR_MID,
    payload: curMId
});

export const setCurMPwAction = (curMPw) => ({
    type: SET_CUR_MPW,
    payload: curMPw
});

export const setCurMEmailAction = (curMEmail) => ({
    type: SET_CUR_MEMAIL,
    payload: curMEmail
});

export const setCurMNicknameAction = (curMNickname) => ({
    type: SET_CUR_MNICKNAME,
    payload: curMNickname
});