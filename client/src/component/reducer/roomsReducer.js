const initialState = {
    rooms: [], // rooms 배열 초기 상태 설정
};

export default function roomsReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_ROOMS':
            // 상태를 직접 변형하지 않고 새로운 객체를 반환
            return action.payload;

        case 'LEAVE_ROOM':
            // 올바른 필드인 rooms에 결과를 할당
            return {
                ...state,
                rooms: state.rooms.filter(room => room.id !== action.payload)
            };

        case 'FAVORITE_ROOM':
            // 올바른 필드인 rooms에 결과를 할당
            return {
                ...state,
                rooms: state.rooms.map(room => 
                    room.id === action.payload ? {...room, isFavorite: !room.isFavorite} : room
                )
            };

        default:
            return state;
    }
};
