import { SET_AID, SET_APW, SET_AEMAIL, SET_IS_ADMIN_LOGIN, SET_ADMIN_ID } from '../action/types';

const initialState = {
    aId: '',
    aPw: '',
    aEmail: '',
};

const adminJoinReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_AID:
            return {
                ...state,
                aId: action.payload
            };
        case SET_APW:
            return {
                ...state,
                aPw: action.payload
            };

        case SET_AEMAIL:
            return {
                ...state,
                aEmail: action.payload
            };

        default:
            return state;
    }
};

export default adminJoinReducer;