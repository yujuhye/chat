const initialState = {
  newChatInfo: { 
    newChatName: '', 
    friendInfos: [] 
  },
};
  
const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NEW_CHAT_DETAILS':
      return { 
        ...state, 
        newChatInfo: action.payload
    };
    
    case 'RESET_NEW_CHAT_INFO':
      return {
        ...state,
        newChatInfo: initialState.newChatInfo,
      };
      
    default:
      return state;
  }
}

export default chatReducer;
export { initialState };