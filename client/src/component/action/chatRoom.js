export const setRooms = (rooms) => ({

    type: 'SET_ROOMS',
    rooms: rooms,
    
});

export const setModifyRoom = () => ({

    type: 'MODIFY_ROOM',
    payload: '',
    
});

export const setLeaveRoom = (id) => ({

    type: 'LEAVE_ROOM',
    payload: id,
    
});

export const setFavoriteRoom = (data) => ({

    type: 'FAVORITE_ROOM',
    payload: data,
    
});