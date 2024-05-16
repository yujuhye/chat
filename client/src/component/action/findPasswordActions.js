import { SET_YOUR_ID, SET_YOUR_EMAIL } from './types';

export const setYourIdAction = (yourId) => ({
    type: SET_YOUR_ID,
    payload: yourId
});

export const setYourEmailAction = (yourEmail) => ({
    type: SET_YOUR_EMAIL,
    payload: yourEmail
});

