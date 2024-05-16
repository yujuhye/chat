import { SET_MID, SET_MPW, SET_MEMAIL, SET_MNICKNAME, SET_CUR_MID, SET_CUR_MPW, SET_CUR_MEMAIL, SET_CUR_MNICKNAME } from '../action/types';

const initialState = {
    mId: '',
    mPw: '',
    mEmail: '',
    mNickname: '',
    curMId: '',
    curMPw: '',
    curMEmail: '',
    curMNickname: '',
};

const memberModifyReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_MID:
            return {
                ...state,
                mId: action.payload
            };
        case SET_MPW:
            return {
                ...state,
                mPw: action.payload
            };

        case SET_MEMAIL:
            return {
                ...state,
                mEmail: action.payload
            };

        case SET_MNICKNAME:
            return {
                ...state,
                mNickname: action.payload
            };

        case SET_CUR_MID:
            return {
                ...state,
                curMId: action.payload
            };
        case SET_CUR_MPW:
            return {
                ...state,
                curMPw: action.payload
            };

        case SET_CUR_MEMAIL:
            return {
                ...state,
                curMEmail: action.payload
            };

        case SET_CUR_MNICKNAME:
            return {
                ...state,
                curMNickname: action.payload
            };

        default:
            return state;
    }
};

export default memberModifyReducer;