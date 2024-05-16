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

export const selectedFriendId = (data) => {

    return {
        type: 'SELECTED_FRIEND_ID',
        selectedFriend: data
    }
}

export const selectedMyProfileId = (data) => {

    return {
        type: 'SELECTED_MY_ID',
        selectedMine: data
    }
}

