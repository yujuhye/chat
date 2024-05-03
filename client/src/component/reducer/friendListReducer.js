const initialState = {
    friends : {

    },
    myprofile: {

    },
  
   
}

export const friendReducer = (state=initialState, action) =>  {

    switch(action.type) {
        case 'FRIEND_LISTS' :
            console.log('action.friends: ', action.friends)

            state['friends'] = action.friends;
            return {...state}

        case 'MYPROFILE' : 
        console.log('action.myProfile: ', action.myProfile)

            state['myprofile'] = action.myProfile;
            return {...state}


        default:
            return state;
    }

}