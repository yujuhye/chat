const initialState = {
    openChatRooms: [],
    allOpenChatRooms: [],
    currentRoom: null,
};

const openChatReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_OPEN_CHAT_ROOMS':
            return {
                ...state,
                openChatRooms: action.payload,
            };
        case 'SET_ALL_OPEN_CHAT_ROOMS':
            return {
                ...state,
                allOpenChatRooms: action.payload,
            };
        case 'SET_CURRENT_ROOM':
            return {
                ...state,
                currentRoom: action.payload,
            };
        case 'UPDATE_CHAT_ROOM_BOOKMARK':
            return {
                ...state,
                openChatRooms: state.openChatRooms.map((room) =>
                    room.id === action.payload ? {
                        ...room,
                        bookmark: !room.bookmark
                    } : room
                ),
            };
        default:
            return state;
    }
};

export default openChatReducer;