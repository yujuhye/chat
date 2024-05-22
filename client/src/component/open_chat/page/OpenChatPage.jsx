import React, { useEffect, useState } from 'react';
import SideNav from '../../../include/SideNav';
import '../../../css/openChat/openChatHome.css';
import Nav from '../../../include/Nav';
import useAxiosGetMemberForOpenChat from "../../../util/useAxiosGetMemberForOpenChat"
import { useDispatch, useSelector } from 'react-redux';
import socket from '../socket';
import { setCurrentRoom, setOpenChatRooms, updateChatRoomBookmark, setAllOpenChatRooms } from '../../action/openChatActions';
import OpenChatRoom from '../OpenChatRoom';
import OpenChatAdd from '../OpenChatAdd';
import { FaRegStar, FaStar } from "react-icons/fa";


const OpenChatPage = () => {

    const userNo = useAxiosGetMemberForOpenChat();

    const dispatch = useDispatch();
    const openChatRooms = useSelector((state) => state.openChat.openChatRooms);
    const openChatAllRooms = useSelector((state) => state.openChat.allOpenChatRooms);
    const currentRoom = useSelector((state) => state.openChat.currentRoom);
    const [searchTerm, setSearchTerm] = useState('');
    const [showChatRoom, setShowChatRoom] = useState(false);
    const [showChatAdd, setShowChatAdd] = useState(false);

    useEffect(() => {

        if (userNo !== undefined) {
            socket.emit('getOpenChatList', userNo);

            socket.on('openChatRooms', (rooms) => {
                console.log('rooms1', rooms);
                dispatch(setOpenChatRooms(rooms));

            });

            socket.emit('getAllOpenChatRoom', userNo);

            socket.on('openAllRooms', (rooms) => {
                console.log('rooms2', rooms);
                dispatch(setAllOpenChatRooms(rooms));
            })

            console.log('openChatRooms', openChatRooms);
            return () => {
                socket.disconnect();
            };
        } else {
            console.log('userNo undefined!!');
        }

    }, [userNo]);

    const handleJoinRoom = (room) => {
        dispatch(setCurrentRoom(room));

        if(showChatRoom) {
            setShowChatRoom(false);
        } else {
            setShowChatAdd(false);
            setShowChatRoom(true);

        }

    };

    const handleLeaveChatRoom = () => {
        dispatch(setCurrentRoom(null));
        setShowChatRoom(false);
    };

    const handleAddChatRoom = () => {

        if(showChatAdd) {
            setShowChatAdd(false)
        } else {
            setShowChatRoom(false);
            setShowChatAdd(true);
        }

    };

    const handleCancelAddChatRoom = () => {
        setShowChatAdd(false);
    };

    const handleBookmarkRoom = (roomId) => {
        dispatch(updateChatRoomBookmark(roomId));
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredChatRooms = openChatRooms.filter((room) =>
        room.OPEN_R_NAME.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAllChatRooms = openChatAllRooms.filter((room) =>
        room.OPEN_R_NAME.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedChatRooms = filteredChatRooms.sort((a, b) => {
        if (a.bookmark && !b.bookmark) return -1;
        if (!a.bookmark && b.bookmark) return 1;
        if (a.latestMessage && !b.latestMessage) return -1;
        if (!a.latestMessage && b.latestMessage) return 1;
        return 0;
    });

    return (
        <div className='openChatContainer'>
            <div className='sideMenu'>
                <SideNav />
            </div>
            <div className='openChatList'>
                <div className='navMenu'>
                    <Nav />
                </div>

                <div>
                    <h2>오픈채팅</h2>
                    <button onClick={handleAddChatRoom}>ADD+</button>
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Search chat rooms..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div>

                        {sortedChatRooms.length > 0 ? (
                            <ul>
                                {sortedChatRooms.map((room) => (
                                    <li key={room.OPEN_R_ID}>
                                        {room?.OPEN_R_PROFILE}
                                        {room.OPEN_R_NAME}
                                        {room.LATEST_MESSAGE}
                                        <button onClick={() => handleJoinRoom(room)}>Join</button>
                                        <button onClick={() => handleBookmarkRoom(room.id)}>
                                            {room.OPEN_P_BOOKMARK ? <FaStar /> : <FaRegStar /> }
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>현재 참가 중인 오픈 채팅방이 없습니다.</p>
                        )}
                    </div>
                    <div>
                        <h3>새로운 오픈 채팅 검색 결과</h3>
                        {searchTerm !== '' && filteredAllChatRooms.length > 0 ? (
                            <ul>
                                {filteredAllChatRooms.map((room) => (
                                    <li key={room.OPEN_R_ID}>
                                        {room.OPEN_R_NAME}
                                        {room.OPEN_R_INTRO}
                                        <button onClick={() => handleJoinRoom(room)}>Join</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>검색 결과가 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
            <div>
                {showChatRoom && (
                    <OpenChatRoom room={currentRoom} onLeave={handleLeaveChatRoom} />
                )}
            </div>
            <div>
                {showChatAdd && (
                    <OpenChatAdd userNo={userNo} onLeave={handleCancelAddChatRoom} />
                )}
            </div>
        </div>

    );
};

export default OpenChatPage;