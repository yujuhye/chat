import { SET_AID, SET_APW, SET_IS_ADMIN_LOGIN } from '../action/types';

const initialState = {
    aId: '',
    aPw: '',
    isAdminLogin: false
};

const adminLoginReducer = (state = initialState, action) => {
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

        case SET_IS_ADMIN_LOGIN:
            return {
                ...state,
                isAdminLogin: action.payload
            };
        default:
            return state;
    }
};

export default adminLoginReducer;