import { SET_UID, SET_UPW, SET_IS_LOGIN } from '../action/types';

const initialState = {
    uId: '',
    uPw: '',
    isLogin: false
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
        default:
            return state;
    }
};

export default loginReducer;