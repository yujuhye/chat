
// export const setNewChatInfo = (newChatInfo) => ({

//     type: 'SET_NEW_CHAT_INFO',
//     payload: newChatInfo,
    
// });

// export const SetFriendInfos = (friendInfos) => ({

//     type: 'SET_FRIEND_INFOS',
//     payload: friendInfos,

// });

export const setNewChatDetails = (newChatName, friendInfos) => ({
    type: 'SET_NEW_CHAT_DETAILS',
    payload: {newChatName, friendInfos},
});

export const resetNewChatInfo = () => ({
    type: 'RESET_NEW_CHAT_INFO',
});
