const initialState = {
    rooms: [], // rooms 배열 초기 상태 설정
};

export default function roomsReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_ROOMS':
            // 상태를 직접 변형하지 않고 새로운 객체를 반환
            // console.log('SET_ROOMS Payload:', action.rooms);
            // state['rooms'] = action.rooms;
            // return {...state};
            return {...state, rooms: action.rooms};
        
        case 'LEAVE_ROOM':
            // console.log('LEAVE_ROOM rooms:', action.payload); // 해당 방번호 출력
            return {
                ...state,
                rooms: state.rooms.filter(room => room.id !== action.payload),
            };

         case 'FAVORITE_ROOM':
            return {
                ...state,
                rooms: state.rooms.map(room => 
                    room.id === action.payload.roomId ? {...room, isFavorite: true} : room // 즐겨찾기 상태를 true로 설정
                )
            };

        default:
            return state;
    }
};
