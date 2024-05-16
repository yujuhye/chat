import { SET_AID, SET_APW, SET_AEMAIL, SET_IS_ADMIN_LOGIN, SET_ADMIN_ID } from './types';

export const setAIdAction = (aId) => ({
    type: SET_AID,
    payload: aId
});

export const setAPwAction = (aPw) => ({
    type: SET_APW,
    payload: aPw
});

export const setAEmailAction = (aEmail) => ({
    type: SET_AEMAIL,
    payload: aEmail
});

export const setIsAdminLoginAction = (isAdminLogin) => ({
    type: SET_IS_ADMIN_LOGIN,
    payload: isAdminLogin
});

export const setAdminIdAction = (adminId) => ({
    type: SET_ADMIN_ID,
    payload: adminId
});