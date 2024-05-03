export const friendListsAction = (data) => {

    return {
        type: 'FRIEND_LISTS',
        friends: data
    }
}

export const myProfileAction = (data) => {

    return {
        type: 'MYPROFILE',
        myProfile: data
    }
}

