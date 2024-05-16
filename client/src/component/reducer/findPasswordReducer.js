import { SET_YOUR_ID, SET_YOUR_EMAIL } from '../action/types';

const initialState = {
    yourId: '',
    yourEmail: '',
};

const findPasswordReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_YOUR_ID:
            return {
                ...state,
                yourId: action.payload
            };
        case SET_YOUR_EMAIL:
            return {
                ...state,
                yourEmail: action.payload
            };

        default:
            return state;
    }
};

export default findPasswordReducer;