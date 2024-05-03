import React, { useEffect, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import io from 'socket.io-client';
import { setRooms, setLeaveRoom, setFavoriteRoom } from '../action/chatRoom';
import roomsReducer from "../reducer/roomsReducer";
import FriendListModal from "./FriendListModal";
import ChatTitleNameModModal from "./ChatTitleNameModModal";
import { SERVER_URL } from '../../util/url';
import chatReducer, { initialState } from "../reducer/chatReducer";

const socket = io('http://localhost:3001');

const ChatRoom = () => {
    const navigate = useNavigate();
    const [rooms, rooms_dispatch] = useReducer(roomsReducer, []);
    const [state, chat_dispatch] = useReducer(chatReducer, initialState);
    const [selectedRoomNo, setSelectedRoomNo] = useState(null);    
    const [isShowFriendModal, setIsShowFriendModal] = useState(false);
    const [isShowChatTitleNameModModal, setIsShowChatTitleNameModModal] = useState(false);
    const [chatTitleName, setChatTitleName] = useState('');
    const [modifyStatus, setModifyStatus] = useState('');
    const [userNo, setUserNo] = useState(0);
    const [searchKey, setSearchKey] = useState('');
    // const { newChatName, friendInfos } = state.newChatInfo;

    // 채팅 리스트 불러오기
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:3001/chatRoom/list');
                console.log('chat list : ', response.data); 
                console.log('room : ', response.data.rooms); 

                // 가져온 채팅방 목록을 리덕스 스토어에 설정
                rooms_dispatch(setRooms(response.data.rooms));
            
            } catch (error) {
                console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
            }
        };
        
        fetchRooms();

        socket.on('refresh room list', () => {
            fetchRooms();
        });

        // 컴포넌트가 언마운트될 때 'refresh room list' 이벤트 리스너를 제거
        return () => {
            socket.off('refresh room list');
        };
    }, []);

    // handler
    const handleFriendInviteModalClose = () => {
        console.log('handleFriendInviteModalClose()');
        setIsShowFriendModal(false);
    };

    const leaveRoom = (id) => {

        rooms_dispatch(setLeaveRoom(id));

    };

    const favoriteRoom = (id) => {

        rooms_dispatch(setFavoriteRoom(id));

    };

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

    // 채팅방 입장
    const chatRoomViewClickHandler = (room) => {
        console.log('chatRoomViewClickHandler()');
        console.log('roon no : ', room);

        navigate(`/chat/details/${room.ROOM_NO}`, 
            // { state: { roomInfo: room, userInfo:  userNo} }); // 일단 userInfo 제외
            { state: { roomInfo: room, } });

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

    const chatRoomSearchInputChangeHandler = (e) => {
        console.log('chatRoomSearchInputChangeHandler()');

        let inputName = e.target.name;
        let inputValue = e.target.value;

        if(inputName === 'parti_customzing_name'){

            setSearchKey(inputValue);

        }

    }

    const chatRoomSearchBtnClickHandler = () => {
        console.log('chatRoomSearchBtnClickHandler()');

        let params  = {
            parti_customzing_name: searchKey,
        }
        console.log('params -----> ', params);

        axios({
            url: `http://localhost:3001/chatRoom/searChatRoom`,
            method: 'get',
            params: params,
            headers: {
                'Content-Type': 'application/json', // 명시적으로 JSON으로 설정 (하지만 axios에서 기본적으로 설정됨)
            },
        })
        .then(response => {
            // 나중에 작성
        })
        .catch(error => {
            // 나중에 작성
            
        });
    };

    return (
        <>
            <div>
                <h2>참여한 채팅방 목록</h2>
                <div className="chatRoomSearch">
                    <input type="text" name="parti_customzing_name" onChange={(e)=>chatRoomSearchInputChangeHandler(e)} />
                    <input type="button" onClick={chatRoomSearchBtnClickHandler} value="SEARCH"/>
                </div>
                <div className="chatRoomBtnWrap">
                    <a href="#" onClick={chatBtnClickHandler}>chat</a>
                </div>
                <ul>
                    {rooms.map((room) => (
                        <li key={room.ROOM_NO}>
                            {room.ROOM_NO}. 
                            <a href="#" onClick={()=>chatRoomViewClickHandler(room)}>{room.PARTI_CUSTOMZING_NAME}</a>&nbsp;&nbsp; 
                            {room.LAST_CHAT_TEXT}&nbsp;&nbsp;
                            {room.LAST_CHAT_REG_DATE}&nbsp;&nbsp;
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
                    socket && (
                        <FriendListModal 
                            setIsShowFriendModal={setIsShowFriendModal}
                            isShowFriendModal={isShowFriendModal}
                            handleFriendInviteModalClose={handleFriendInviteModalClose}
                            socket={socket} // 여기에서 socket 인스턴스를 props로 전달
                        />
                )
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