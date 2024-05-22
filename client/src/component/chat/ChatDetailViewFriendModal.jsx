import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setRooms, setLeaveRoom, setFavoriteRoom } from '../action/chatRoom';
import { SERVER_URL } from '../../util/url';
import io from 'socket.io-client';
import axios from "axios"; 
import '../../css/common.css'
import '../../css/chat/chatViewFriendModal.css';

// const socket = io('http://localhost:3001');
const socket = io(`${SERVER_URL.TARGET_URL()}`);

const ChatDetailViewFriendModal = (props) => {
    const { participants, handleFriendInviteModalClose, isShowChatInviteFriendModal, setIsShowChatInviteFriendModal, socket, selectedRoom  } = props;

    const dispatch = useDispatch();
    const rooms = useSelector(state => state['room']['rooms']);
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [selectedFriendDetails, setSelectedFriendDetails] = useState([]);

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

                // alert('친구 목록을 불러오는 데 실패했습니다.');

            }
        })
        .catch(error => {

            alert(`[FriendListModal] 친구 목록을 불러오는 데 실패했습니다. : ${error.message}`);

        });
    };

    useEffect(() => {
        fetchFriends();
    }, []);
    
    // useEffect(() => {
    //     const refreshChatListListener = async () => {
    //         try {
    //             const response = await axios.get('http://localhost:3001/chatRoom/list');
    //             console.log('chat list : ', response.data);
    //             console.log('채팅 리스트 room : ', response.data.rooms);
        
    //             // 가져온 채팅방 목록을 리덕스 스토어에 설정
    //             dispatch(setRooms(response.data.rooms));
    //         } catch (error) {
    //             console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
    //         }
    //     };
    
    //     socket.on('refreshChatList', refreshChatListListener);
    
    //     // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거
    //     return () => {
    //         socket.off('refreshChatList', refreshChatListListener);
    //     };
    // }, [socket, dispatch]); // socket이나 dispatch가 변경되면 useEffect를 재실행

    useEffect(() => {
        const refreshChatListListener = () => {
            const fetchRooms = async () => {
                try {
                    const response = await axios.get('http://localhost:3001/chatRoom/list');
                    // console.log('chat list : ', response.data); 
                    // console.log('채팅 리스트 room : ', response.data.rooms); 
    
                    // 가져온 채팅방 목록을 리덕스 스토어에 설정
                    dispatch(setRooms(response.data.rooms));
                
                } catch (error) {
                    console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
                }
            };
            
            fetchRooms();
        };
      
        socket.on('refreshChatList', refreshChatListListener);
      
        // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거
        return () => {
          socket.off('refreshChatList', refreshChatListListener);
        };
      }, []); 
  

    if (!isShowChatInviteFriendModal) return null; // 모달을 표시하지 않을 경우 렌더링하지 않음

    const handleFriendSelection = (friendNo) => {
        // console.log('friendNo -----> ', friendNo);
        
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
        const roomId = selectedRoom.ROOM_NO;

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

        // console.log('selectedFriends -----> ', inviteFriend);
        socket.emit('invite room', inviteFriend);

        setIsShowChatInviteFriendModal(false);
        
    }   

    return (
        <div className="chatViweFriendWrap">
            <div className="chatViweFriend">
                <p className="chatViewFriendList">친구 리스트</p>
                {friends.map(friend => (
                    <div key={friend.FRIEND_NO} className="chatFriendListModal">
                        <input className="chatFriendListModalInput"
                            type="checkbox" 
                            checked={selectedFriends.includes(friend.FRIEND_NO)}
                            onChange={() => handleFriendSelection(friend.FRIEND_NO)}
                            disabled={participants.some(participant => participant.USER_NO === friend.USER_NO)} // 현재 방에 있는 유저는 선택할 수 없도록 함
                        />
                        {/* {friend.USER_NO} */}
                        {friend.FRIEND_TARGET_NAME}
                    </div>
                ))}
                <div className="chatViewBtns">
                    <button onClick={chatInviteFriendClickHandler} className="chatListFriendInviteBtn">친구 초대</button>
                    <button onClick={handleFriendInviteModalClose} className="chatListFriendCloseBtn">닫기</button>
                </div>
            </div>
        </div>
    );
}

export default ChatDetailViewFriendModal;