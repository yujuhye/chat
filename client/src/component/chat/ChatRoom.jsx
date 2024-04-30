import React, { useEffect, useReducer, useState } from "react";
import axios from 'axios';
import io from 'socket.io-client';
import { SERVER_URL } from '../../util/url'
import { useNavigate } from "react-router-dom";
import ChatTitleNameModModal from "./ChatTitleNameModModal";

const socket = io('http://localhost:3001');

// reducer
const roomsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_ROOMS':
            // 'SET_ROOMS' 액션이 발생했을 때, 전체 방 목록을 새로운 상태로 설정
            // action.payload에는 새로운 방 목록이 포함되어 있음
            return action.payload;

        // 일단 생략
        // case 'MODIFY_ROOM':

        //     // 'MODIFY_ROOM' 액션이 발생했을 때, 특정 방의 정보를 수정
        //     // 기존의 상태(state)을 순회하면서,
        //     return state.map(room =>
        //         // // 액션에서 받은 payload의 id와 일치하는 방을 찾음
        //         room.id === action.payload.id && room.no === action.payload.no ? 
        //         //  // 해당 방의 이름을 새로운 이름으로 변경
        //         {...room, name: action.payload.newName} : 
        //         // 일치하지 않는 방은 그대로 유지
        //         room
        //     );

        case 'LEAVE_ROOM':

            // 'LEAVE_ROOM' 액션이 발생했을 때, 특정 방을 나감
            // 액션에서 받은 payload에 있는 방을 제외한 나머지 방들로 새로운 상태를 설정
            return state.filter(room => room.id !== action.payload);

        case 'FAVORITE_ROOM':

            // 'FAVORITE_ROOM' 액션이 발생했을 때, 특정 방을 즐겨찾기 설정하거나 해제
            return state.map(room =>
                // 기존의 상태(state)을 순회하면서,
                // 액션에서 받은 payload의 값과 일치하는 방을 찾음
                room.id === action.payload ? 
                //  // 즐겨찾기 상태를 토글
                {...room, isFavorite: !room.isFavorite} : 
                // 일치하지 않는 방은 그대로 유지
                room
            
            );

        default:

            // 그외
            return state;

    }
};


const ChatRoom = () => {
    const navigate = useNavigate();

    const [rooms, dispatch] = useReducer(roomsReducer, []);
    // 방번호 저장
    const [selectedRoomNo, setSelectedRoomNo] = useState(null);    
    // 친구 초대 모달
    const [isShowFriendModal, setIsShowFriendModal] = useState(false);
    const [selectFriend, setSelectFriend] = useState('');
    
    // 채팅방 이름
    const [isShowChatTitleNameModModal, setIsShowChatTitleNameModModal] = useState(false);
    const [chatTitleName, setChatTitleName] = useState('');
    const [modifyStatus, setModifyStatus] = useState('');
    const [userNo, setUserNo] = useState(0);

    useEffect(() => {
        // 컴포넌트가 마운트될 때와 'refresh room list' 이벤트가 발생할 때마다 실행
        const fetchRooms = async () => {
            try {
                // 서버로부터 채팅방 목록을 가져옴
                const response = await axios.get('http://localhost:3001/chatRoom/list');
                console.log('chat list : ', response.data); // 데이터 구조 확인
                //console.log('user : ', response.data.user); 
                console.log('room : ', response.data.rooms); 

                // 가져온 채팅방 목록을 새로운 상태로 설정
                dispatch({
                    type: 'SET_ROOMS', 
                    payload: response.data.rooms,
                    //user: response.data.user,
                    
                });
            
            } catch (error) {
                console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
            }
        };
        
        // 컴포넌트가 처음 렌더링될 때 채팅방 목록을 가져옴
        fetchRooms();

        // 'refresh room list' 이벤트가 발생할 때마다 채팅방 목록을 다시 가져옴
        socket.on('refresh room list', () => {
            fetchRooms();
        });

        // 컴포넌트가 언마운트될 때 'refresh room list' 이벤트 리스너를 제거
        return () => {
            socket.off('refresh room list');
        };
    }, []);

     // handler
    // 친구 초대
    const friendInviteBtnClickHandler = () => {
        console.log('friendInviteBtnClickHandler()');

        const friendId = selectFriend;
        socket.emit('createRoom', { room_default_name: chatTitleName, invitedFriendId: friendId });

        // 모달 닫기
        setIsShowFriendModal(false);

    }

    // modal
    const friendInviteModalCloseBtnClickHandler = () => {
        console.log('friendInviteModalCloseBtnClickHandler()');

        setIsShowFriendModal(false);
    }

    const chatBtnClickHandler = () => {
        console.log('chatBtnClickHandler()');

        setIsShowFriendModal(true);

    };

    const modifyRoomName = (roomNo, chatName, userNo) => {

        setSelectedRoomNo(roomNo); // 선택된 방 번호를 상태에 저장
        setUserNo(userNo);
        setIsShowChatTitleNameModModal(true); // 모달을 보여주는 상태를 true로 변경
        setChatTitleName(chatName)

    };
    

    const leaveRoom = (id) => {

        dispatch({
            type: 'LEAVE_ROOM', 
            payload: id
        });

    };

    const favoriteRoom = (id) => {

        dispatch({
            type: 'FAVORITE_ROOM', 
            payload: id
        });

    };

    // 채팅방 입장
    const chatRoomViewClickHandler = (room) => {
        console.log('chatRoomViewClickHandler()');
        console.log('roon no : ', room);

        navigate(`/chat/chatView/${room.ROOM_NO}`, 
            { state: { roomInfo: room, userInfo:  userNo} });

    }

    // 채팅방 이름
    const modifyChatTitleName = (e) => {
        console.log('modifyChatTitleName()');

        let inputName = e.target.name;
        let inputValue = e.target.value;

        if(inputName === 'parti_customzing_name'){
            
            setChatTitleName(inputValue);
            console.log('변경할 채팅방 이름 : ', inputValue);
            
        }

    }

    // const modifyChatTitleNameClickHandler = (id, no, newName) => {
    //     console.log('modifyChatTitleNameClickHandler()');

    //     // 비동기 액션 생성자 호출
    //     dispatch(modifyChatTitleNameAxios(id, no, newName));

    // }

    // // 수정 버튼 클릭 후 server 다녀오기
    // // 비동기 액션 생성자
    // const modifyChatTitleNameAxios = (id, no, newName) => {
    //     console.log('modifyChatTitleNameAxios()');

    //     return (dispatch) => {
    //         // 객체 형태로 데이터 생성
    //         // post에서는 params가 아닌 data를 사용
    //         const data = {
    //             room_no: id,
    //             user_no: no,
    //             parti_customzing_name: newName,
    //         };

    //         axios({
    //             url: `http://localhost:3001/chatRoom/modifyTitleConfirm`,
    //             method: 'post',
    //             data: data,
    //             headers: {
    //                 'Content-Type': 'application/json', // 명시적으로 JSON으로 설정 (하지만 axios에서 기본적으로 설정됨)
    //             },
    //         })
    //         .then(response => {
    //             // 성공 시, 서버 응답에 따른 액션 디스패치
    //             if(response.data === null) {

    //                 alert('채팅 방 이름 수정에 실패했습니다.');

    //             } else {

    //                 if(response.data.result > 0) {

    //                     alert('채팅 방 이름 수정에 성공했습니다.');

    //                     dispatch({
    //                         type: 'MODIFY_ROOM',
    //                         payload: {
    //                             id,
    //                             no,
    //                             newName
    //                         }
    //                     });

    //                     setIsShowChatTitleNameModModal(false);

    //                 } else {
    //                     // 서버가 성공 메시지는 보냈지만 예상된 형태가 아닌 경우를 처리
    //                     dispatch({
    //                         type: 'MODIFY_ROOM_FAILURE',
    //                         error: 'Unexpected response format'
    //                     });
    //                 }
    //             }
    //         })
    //         .catch(error => {
    //             // 실패 시, 에러 처리를 위한 액션 디스패치
    //             // error.response를 통해 서버로부터의 응답을 접근할 수 있음
    //             // 서버가 오류 메시지를 보냈다면 그 메시지를 사용하고, 아니라면 error.message를 사용
    //             let errorMessage = error.response && error.response.data && error.response.data.error
    //                 ? error.response.data.error
    //                 : error.message;
    //             dispatch({
    //                 type: 'MODIFY_ROOM_FAILURE',
    //                 error: errorMessage
    //             });

    //         })
    //         .finally(data => {
    //             console.log('data -----> ', data);
    //         });
            
    //     };
    // };
    
    const modifyChatTitleNameClickHandler = (id, no, newName) => {
        console.log('modifyChatTitleNameClickHandler()');
        modifyChatTitleNameAxios(id, no, newName);
    }

    const modifyChatTitleNameAxios = (id, no, newName) => {
        console.log('modifyChatTitleNameAxios()');

        // 객체 형태로 데이터 생성
        // post에서는 params가 아닌 data를 사용
        const data = {
            room_no: id,
            user_no: no,
            parti_customzing_name: newName,
        };

        console.log('data -----> ', data);

        axios({
            url: `http://localhost:3001/chatRoom/modifyTitleConfirm`,
            //url: `${SERVER_URL.TARGET_URL()}/chatRoom/modifyTitleConfirm`,
            method: 'post',
            data: data,
            headers: {
                'Content-Type': 'application/json', // 명시적으로 JSON으로 설정 (하지만 axios에서 기본적으로 설정됨)
            },
        })
        .then(response => {
            if(response.data === null) {

                alert('채팅 방 이름 수정에 실패했습니다.');
                setModifyStatus('fail');
                setIsShowChatTitleNameModModal(false);

            } else {

                if(response.data.result > 0) {

                    alert('채팅 방 이름 수정에 성공했습니다.');
                    setChatTitleName(newName); // 상태 업데이트
                    setModifyStatus('success');

                    setIsShowChatTitleNameModModal(false);
                    window.location.reload();
                    //navigate('/chatRoom/list');

                    

                } else {

                    alert('Unexpected response format');
                    setModifyStatus('fail');
                    setIsShowChatTitleNameModModal(false);

                }

            }
        })
        .catch(error => {
            let errorMessage = error.response && error.response.data && error.response.data.error
                ? error.response.data.error
                : error.message;
            alert(`Error: ${errorMessage}`);
            setModifyStatus('fail');
        });
    };

    return (
        <>
            <div className="chatRoomBtnWrap">
                <a href="#" onClick={chatBtnClickHandler}>chat</a>
            </div>
            <div>
                <h2>참여한 채팅방 목록</h2>
                <ul>
                    {rooms.map((room) => (
                        <li key={room.ROOM_NO}>
                            <a href="#" onClick={()=>chatRoomViewClickHandler(room)}>{room.PARTI_CUSTOMZING_NAME}</a>&nbsp;&nbsp; 
                            {/* {room.LAST_CHAT_TEXT}&nbsp;&nbsp;  */}
                            <a href="#" onClick={() => modifyRoomName(room.ROOM_NO, room.PARTI_CUSTOMZING_NAME, room.USER_NO)}>mod</a>&nbsp;&nbsp; 
                            <a href="#" onClick={() => leaveRoom(room.ROOM_NO)}>del</a>&nbsp;&nbsp; 
                            <a href="#" onClick={() => favoriteRoom(room.ROOM_NO)}>like</a>
                        </li>
                    ))}
                </ul>
            </div>
            {/* 친구 초대 */}
            {
                isShowFriendModal
                ?
                    <div id="frinedInviteModalWrap">
                        <div className="friendWrap">
                            <div className="friend">
                                <p>친구 리스트 </p>
                                user1<a href="#" onClick={friendInviteBtnClickHandler}>채팅시작</a><br/>
                                user2<a href="#" onClick={friendInviteBtnClickHandler}>채팅시작</a><br/>
                                user3<a href="#" onClick={friendInviteBtnClickHandler}>채팅시작</a><br/>
                            </div>
                        </div>
                        <div className="frinedInviteModalClose">
                            <a href="#none" onClick={friendInviteModalCloseBtnClickHandler}>CLOSE</a>
                        </div>
                    </div>
                :
                    null

            }

            {/* 채팅방 이름 수정 */}
            {
                isShowChatTitleNameModModal
                ?
                <ChatTitleNameModModal
                    selectedRoomNo={selectedRoomNo}
                    userNo={userNo}
                    chatTitleName={chatTitleName}
                    modifyChatTitleName={modifyChatTitleName}
                    modifyChatTitleNameClickHandler={modifyChatTitleNameClickHandler}
                />
                :
                    null
            }
        </>
    );
}

export default ChatRoom;