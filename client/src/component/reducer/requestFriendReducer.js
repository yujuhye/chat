const initialState = {

    originFriend: {

    },
    requestingFriend: {

    },
}

export const requestFriendReducer = (state = initialState, action) => {

    switch(action.type)  {
        case 'ORIGIN_FRIEND':
            console.log('action.originFriend: ', action.originFriend)

            state['originFriend'] = action.originFriend;

            return {...state};

        case 'REQUESTING_FRIEND':

            state['requestingFriend'] = action.requestingFriend;
            
            return {...state};

        default:
            return state;
    }

}