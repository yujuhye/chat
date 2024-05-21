import React, { useEffect, useState } from 'react';
import { setRooms } from '../action/chatRoom';
import axios from 'axios';
import ChatRoom from './ChatRoom';
import Chat from './Chat';
import { useDispatch } from 'react-redux';

function ChatPage() {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const dispatch = useDispatch();
    const [chatRooms, setChatRooms] = useState([]); // 채팅방 리스트 관리 상태

    // 채팅방 리스트를 불러오는 함수
    const fetchChatRooms = async () => {
        try {
            const response = await axios.get('http://localhost:3001/chatRoom/list');
            console.log('chat list : ', response.data); 
            console.log('채팅 리스트 room : ', response.data.rooms); 

            // 가져온 채팅방 목록을 리덕스 스토어에 설정
            dispatch(setRooms(response.data.rooms));
            
            return response.data.rooms; // rooms 반환
        } catch (error) {
            console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
        }
    };

    // 채팅방 리스트를 업데이트
    const updateChatRooms = async () => {
        const rooms = await fetchChatRooms();
        if (rooms) {
            setChatRooms(rooms);
        }
    };

    // 컴포넌트 마운트 시 채팅방 리스트 불러오기
    useEffect(() => {
        updateChatRooms();
    }, []);
  
    const handleRoomSelect = (room) => {
        console.log('방정보가 찍히긴 해? -----> ', room); // room_no찍힘
        
        if (selectedRoom && room.ROOM_NO === selectedRoom.ROOM_NO) {
            setSelectedRoom(null);
        } else {
            setSelectedRoom(room); 
        }
    };    
  
    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <ChatRoom handleRoomSelect={handleRoomSelect} selectedRoom={selectedRoom} chatRooms={chatRooms} />
            {selectedRoom && <Chat selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} updateChatRooms={updateChatRooms} />}
        </div>
    );
}

export default ChatPage;
