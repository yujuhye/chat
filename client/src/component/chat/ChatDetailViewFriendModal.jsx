import React, { useState, useEffect, useReducer } from "react";
import axios from "axios"; 
import '../../css/common.css'

const ChatDetailViewFriendModal = (props) => {
    const { participants, handleFriendInviteModalClose, isShowChatInviteFriendModal, setIsShowChatInviteFriendModal, socket, roomId  } = props;

    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [selectedFriendDetails, setSelectedFriendDetails] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);

    // handler
    const fetchFriends = () => {
        axios({
            url: `http://localhost:3001/chatRoom/getFriendList`, 
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.data) {

                setFriends(response.data);

            } else {

                alert('[FriendListModal] 친구 목록을 불러오는 데 실패했습니다.');

            }
        })
        .catch(error => {

            alert(`[FriendListModal] fetchFriends Error: ${error.message}`);

        });
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    if (!isShowChatInviteFriendModal) return null; // 모달을 표시하지 않을 경우 렌더링하지 않음

    const handleFriendSelection = (friendNo) => {
        console.log('friendNo -----> ', friendNo);
        
        const friend = friends.find(f => f.FRIEND_NO === friendNo);

        if (selectedFriends.includes(friendNo)) {
          // 이미 선택된 경우, 선택 목록에서 제거
          setSelectedFriends(selectedFriends.filter(no => no !== friendNo));
          setSelectedFriendDetails(selectedFriendDetails.filter(f => f.FRIEND_NO !== friendNo));
        } else {
          // 선택되지 않은 경우, 선택 목록에 추가
          setSelectedFriends([...selectedFriends, friendNo]);
          setSelectedFriendDetails([...selectedFriendDetails, friend]);
        }
    };

    const chatInviteFriendClickHandler = () => {
        console.log('chatInviteFriendClickHandler()');

        const inviteFriend = {
            selectedFriends: selectedFriends,
            participants: selectedFriendDetails,
            roomId: roomId,
        }

        if (selectedFriends.length === 0) {
            alert('최소 한 명의 친구를 선택해주세요.');
            return; // 선택된 친구가 없으면 여기서 함수 종료
        }
        console.log('친구 선택됨');        

        console.log('selectedFriends -----> ', inviteFriend);
        socket.emit('invite room', inviteFriend);

        setIsShowChatInviteFriendModal(false);
    }

    return (
        <div className="friendWrap">
            <div className="friend">
                <p>친구 리스트</p>
                {friends.map(friend => (
                    <div key={friend.FRIEND_NO}>
                        <input 
                            type="checkbox" 
                            checked={selectedFriends.includes(friend.FRIEND_NO)}
                            onChange={() => handleFriendSelection(friend.FRIEND_NO)}
                            disabled={participants.some(participant => participant.USER_NO === friend.USER_NO)} // 현재 방에 있는 유저는 선택할 수 없도록 함
                        />
                        {friend.USER_NO}
                        {friend.FRIEND_TARGET_NAME}
                    </div>
                ))}
                <button onClick={chatInviteFriendClickHandler}>친구 초대</button>
                <button onClick={handleFriendInviteModalClose}>닫기</button>
            </div>
        </div>
    );
}

export default ChatDetailViewFriendModal;