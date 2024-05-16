const initialState = {
    friends : {

    },
    myprofile: {

    },
    selectedFriend: {

    },
    selectedMine: {

    },
   
}

export const friendReducer = (state=initialState, action) =>  {

    switch(action.type) {
        case 'FRIEND_LISTS' :
            console.log('action.friends: ', action.friends)

            state['friends'] = action.friends;
            return {...state};

        case 'MYPROFILE' : 
        console.log('action.myProfile: ', action.myProfile)

            state['myprofile'] = action.myProfile;
            return {...state};

        case 'SELECTED_FRIEND_ID': 
            console.log('action.selectedFriend: ', action.selectedFriend);

            state['selectedFriend'] = action.selectedFriend;
            return {...state};

        case 'SELECTED_MY_ID': 
            console.log('action.selectedMine: ', action.selectedMine);

            state['selectedMine'] = action.selectedMine;
            return {...state};

        default:
            return state;
    }

}