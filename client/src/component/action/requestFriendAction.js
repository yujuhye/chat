export const originFriendInfoAction = (data) => {

    return {
        type: 'ORIGIN_FRIEND',
        originFriend: data
    }
}

export const requestFriendAction = (data) => {

    return {
        type: 'REQUESTING_FRIEND',
        requestingFriend: data
    }
}

