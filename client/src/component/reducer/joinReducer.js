import { SET_UID, SET_UPW, SET_UEMAIL, SET_UNICKNAME, SET_UFRONTIMG_NAME, SET_IS_LOGIN, SET_USER_ID } from '../action/types';

const initialState = {
    uId: '',
    uPw: '',
    uEmail: '',
    uNickname: '',
    uFrontImgName: '',
};

const joinReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_UID:
            return {
                ...state,
                uId: action.payload
            };
        case SET_UPW:
            return {
                ...state,
                uPw: action.payload
            };

        case SET_UEMAIL:
            return {
                ...state,
                uEmail: action.payload
            };

        case SET_UNICKNAME:
            return {
                ...state,
                uNickname: action.payload
            };

        case SET_UFRONTIMG_NAME:
            return {
                ...state,
                uFrontImgName: action.payload
            };
        default:
            return state;
    }
};

export default joinReducer;