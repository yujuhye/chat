export const setOpenChatRooms = (rooms) => ({
    type: 'SET_OPEN_CHAT_ROOMS',
    payload: rooms,
});

export const setAllOpenChatRooms = (rooms) => ({
    type: 'SET_ALL_OPEN_CHAT_ROOMS',
    payload: rooms,
});

export const setCurrentRoom = (room) => ({
    type: 'SET_CURRENT_ROOM',
    payload: room,
});

export const updateChatRoomBookmark = (roomId) => ({
    type: 'UPDATE_CHAT_ROOM_BOOKMARK',
    payload: roomId,
});