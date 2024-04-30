import { SET_UID, SET_UPW, SET_IS_LOGIN, SET_USER_ID } from './types';

// export 구문 수정
export const setUIdAction = (uId) => ({
    type: SET_UID,
    payload: uId
});

export const setUPwAction = (uPw) => ({
    type: SET_UPW,
    payload: uPw
});

export const setIsLoginAction = (isLogin) => ({
    type: SET_IS_LOGIN,
    payload: isLogin
});

export const setUserIdAction = (userId) => ({
    type: SET_USER_ID,
    payload: userId
});