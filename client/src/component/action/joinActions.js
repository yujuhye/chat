import { SET_UID, SET_UPW, SET_UEMAIL, SET_UNICKNAME, SET_UFRONTIMG_NAME, SET_IS_LOGIN, SET_USER_ID } from './types';

export const setUIdAction = (uId) => ({
    type: SET_UID,
    payload: uId
});

export const setUPwAction = (uPw) => ({
    type: SET_UPW,
    payload: uPw
});

export const setUEmailAction = (uEmail) => ({
    type: SET_UEMAIL,
    payload: uEmail
});

export const setUNicknameAction = (uNickname) => ({
    type: SET_UNICKNAME,
    payload: uNickname
});

export const setUFrontImgNameAction = (uFrontImgName) => ({
    type: SET_UFRONTIMG_NAME,
    payload: uFrontImgName
});

export const setIsLoginAction = (isLogin) => ({
    type: SET_IS_LOGIN,
    payload: isLogin
});

export const setUserIdAction = (userId) => ({
    type: SET_USER_ID,
    payload: userId
});