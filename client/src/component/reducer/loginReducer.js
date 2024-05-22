import { SET_UID, SET_UPW, SET_IS_LOGIN, SET_USER_ID } from '../action/types';

const initialState = {
    uId: '',
    uPw: '',
    isLogin: false,
    userId: ''
};

const loginReducer = (state = initialState, action) => {
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

        case SET_IS_LOGIN:
            return {
                ...state,
                isLogin: action.payload
            };

        case SET_USER_ID:
            return {
                ...state,
                userId: action.payload
            };
        case 'SET_USER_NO':
            return {
                ...state,
                userNo: action.payload
            }


        default:
            return state;
    }
};

export default loginReducer;