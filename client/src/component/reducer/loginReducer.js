import { SET_UID, SET_UPW } from '../action/types';

const initialState = {
    uId: '',
    uPw: ''
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
        default:
            return state;
    }
};

export default loginReducer;