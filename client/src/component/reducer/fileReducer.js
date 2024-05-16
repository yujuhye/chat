const initialState = {
    loading: false, 
    fileData: null, 
    error: null, 
};

export default function fileReducer(state = initialState, action) {
    switch(action.type) {
        case 'FILE_SEND':
            
            return {
                ...state,
                loading: true,
                error: null, 
            };
        case 'FILE_SEND_SUCCESS':
            
            return {
                ...state,
                loading: false,
                fileData: action.payload,
            };
        case 'FILE_SEND_FAILURE':
            
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
}
