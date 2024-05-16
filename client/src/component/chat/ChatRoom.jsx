import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import io from 'socket.io-client';
import { setRooms, setLeaveRoom, setFavoriteRoom } from '../action/chatRoom';
import { setNewChatDetails } from '../action/chat';
import FriendListModal from "./FriendListModal";
import ChatTitleNameModModal from "./ChatTitleNameModModal";
import { fetchUser } from "./fetchFunction";
import { SERVER_URL } from '../../util/url';
import '../../css/common.css';
import '../../css/chat/chatRoom.css';

const socket = io('http://localhost:3001');
// const socket = io('http://14.42.124.96:3001');

const ChatRoom = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const rooms = useSelector(state => state['room']['rooms']);
    const newChatInfo = useSelector(state => state['chat']['newChatInfo']);
    const [selectedRoomNo, setSelectedRoomNo] = useState('');    
    const [isShowFriendModal, setIsShowFriendModal] = useState(false);
    const [isShowChatTitleNameModModal, setIsShowChatTitleNameModModal] = useState(false);
    const [chatTitleName, setChatTitleName] = useState('');
    const [modifyStatus, setModifyStatus] = useState('');
    const [userInfo, setUserInfo] = useState(0);
    const [userNo, setUserNo] = useState(0);
    const [searchKey, setSearchKey] = useState('');
    const [searchResult, setSearchResult] = useState('');

    // 채팅 리스트 불러오기
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:3001/chatRoom/list');
                console.log('chat list : ', response.data); 
                console.log('채팅 리스트 room : ', response.data.rooms); 

                // 가져온 채팅방 목록을 리덕스 스토어에 설정
                dispatch(setRooms(response.data.rooms));
            
            } catch (error) {
                console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
            }
        };
        
        fetchRooms();

        // 사용자 정보를 불러오기
        const userInfo = async () => {
            try {
                const userData = await fetchUser();
                setUserInfo(userData);
            } catch (error) {
                alert(error.message);
            }
        };
    
        userInfo(); // 함수 호출

        socket.on('update room list', fetchRooms);

        return () => {
            socket.off('update room list', fetchRooms);
        };
    }, [socket, dispatch, userInfo.USER_NO]);

    // handler
    const handleFriendInviteModalClose = () => {
        console.log('handleFriendInviteModalClose()');
        setIsShowFriendModal(false);
    };

    // 방나가기
    useEffect(() => {
        // 사용자 정보를 불러오기
        const userInfo = async () => {
            try {
                const userData = await fetchUser();
                setUserInfo(userData);
            } catch (error) {
                alert(error.message);
            }
        };
    
        userInfo(); // 함수 호출
    
        // 방을 나가거나, 업데이트된 방 목록을 처리하는 이벤트 리스너 설정
        const leaveRoomResult = (result) => {
            let user = {
                userNo: userInfo.USER_NO,
            }
            if (result.success) {
                console.log('방을 성공적으로 나갔습니다.');
                socket.emit('request room list', user);
            } else {
                console.error('방 나가기 실패: ', result.error);
            }
        };
        
        const handleUserLeft = (user) => {
            console.log(`${user.no}번 사용자가 방을 나갔습니다.`);
        };
    
        socket.on('leaveRoomResult', leaveRoomResult);
        socket.on('userLeft', handleUserLeft);
        socket.on('update room list', (rooms) => {
            console.log('방 목록이 업데이트 되었습니다.');
            dispatch(setRooms(rooms));
            console.log('방 목록이 업데이트 되었습니다-----', dispatch(setRooms(rooms)));
        });
    
        // 컴포넌트 언마운트 시 이벤트 리스너 해제
        return () => {
            socket.off('leaveRoomResult', leaveRoomResult);
            socket.off('userLeft', handleUserLeft);
            socket.off('update room list');
        };
    }, [socket, dispatch, userInfo.USER_NO]);
    
    const leaveRoom = (id, no) => {
        const isConfirmed = window.confirm('정말로 방을 나가시겠습니까?');
        if (!isConfirmed) {
            return;
        }
        // 소켓을 통해 서버에 방 나가기 이벤트 전송
        let chatInfo = {
            id: id,
            no: no,
        }
        socket.emit('leaveRoom', chatInfo);
        console.log('나가기 이벤트 -----> ', chatInfo);
        dispatch(setLeaveRoom(id));
    };

    // 좋아요
    useEffect(() => {
        // 좋아요 처리 결과를 받는 이벤트 리스너 설정
        const likeMessageResult = (result) => {
            if (result.success) {
                console.log('좋아요 처리 성공');
                // 필요한 추가 처리 로직
            } else {
                console.error('좋아요 처리 실패: ', result.error);
            }
        };
    
        socket.on('likeMessageResult', likeMessageResult);
    
        // 컴포넌트 언마운트 시 이벤트 리스너 해제
        return () => {
            socket.off('likeMessageResult', likeMessageResult);
        };
    }, [socket]); // 의존성 배열에 socket 추가    

    const favoriteRoom = (roomId, userNo) => {

        let chatLikeInfo = {
            roomId: roomId,
            userNo: userNo,
        }
        socket.emit('likeRoom', chatLikeInfo);

        console.log('채팅방 즐겨찾기 이벤트 -----> ', chatLikeInfo);

        dispatch(setFavoriteRoom(roomId, userNo));
        
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
        navigate(`/chat/details/${room.ROOM_NO}`, { state: { roomInfo: room, } });
    }

    // 채팅방 이름
    const modifyChatTitleName = (e) => {
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
                alert('[ChatRoom] 채팅 방 이름 수정에 실패했습니다.');
                setModifyStatus('fail');
                setIsShowChatTitleNameModModal(false);
            } else {
                if(response.data.result > 0) {
                    alert('[ChatRoom] 채팅 방 이름 수정에 성공했습니다.');
                    setChatTitleName(newName); // 상태 업데이트
                    setModifyStatus('success');
                    setIsShowChatTitleNameModModal(false);
                    window.location.reload();
                    // socket.emit('request room list', user);
                } else {
                    alert('[ChatRoom] Unexpected response format');
                    setModifyStatus('fail');
                    setIsShowChatTitleNameModModal(false);
                }
            }
        })
        .catch(error => {
            let errorMessage = error.response && error.response.data && error.response.data.error
                ? error.response.data.error
                : error.message;
            alert(`[ChatRoom] Error: ${errorMessage}`);
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
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if(response.data) {
                console.log('성공 ----->', response.data);
                setSearchResult(response.data); // 검색 결과를 상태에 저장
                if(response.data.length === 0) {
                    alert('검색 결과가 없습니다.');
                    setSearchKey(""); // 안먹힘 -> 방법 찾기
                }
            } else {
                console.log('then 실패 ----->');
                setSearchResult([]); // 검색 결과가 없으면 빈 배열을 저장
            }
        })
        .catch(error => {
            console.log('catch 실패 ----->', error);            
        });
    };

    const searchCancelBtnClickHander = () => {
        console.log('searchCancelBtnClickHander()');
        setSearchResult([]);
    }

    return (
        <>
            <div id="chatListWrap">
                <h2 className="joinChatRoomList">참여한 채팅방 목록</h2>
                <div className="chatRoomSearch">
                    <input type="text" name="parti_customzing_name" onChange={(e)=>chatRoomSearchInputChangeHandler(e)} />
                    <input type="button" onClick={chatRoomSearchBtnClickHandler} value="SEARCH"/>
                </div>
                <div className="chatRoomBtnWrap">
                    <a href="#" onClick={chatBtnClickHandler} className="chatBtn">chat</a>
                </div>
                {searchResult.length > 0 ? (
                    // 검색 결과가 있을 경우 검색 결과 표시
                    <div id="searchResultWrap">
                        <ul>
                            {searchResult.map((room) => (
                                <li key={room.ROOM_NO}>
                                    <a href="#" onClick={() => chatRoomViewClickHandler(room)} className="chatTitleName">{room.PARTI_CUSTOMZING_NAME}</a>
                                    <span className="lastChatText">{room.LAST_CHAT_TEXT}</span>
                                    <span className="lastChatRegDate">{room.LAST_CHAT_REG_DATE}</span>
                                </li>
                            ))}
                            <button className="searchCancelBtn" onClick={searchCancelBtnClickHander}>취소</button>
                        </ul>
                    </div>
                ) : (
                    // 검색 결과가 없을 경우 기존 채팅 리스트 표시
                    rooms.length > 0 ? (
                        <ul>
                            {rooms.map((room) => (
                                <li key={room.ROOM_NO} onClick={()=>chatRoomViewClickHandler(room)} style={{cursor: 'pointer'}}>
                                <a href="#" className="chatTitleName" onClick={()=>chatRoomViewClickHandler(room)}>{room.PARTI_CUSTOMZING_NAME}</a>
                                <span className="joinRoomCnt">{room.ROOM_PERSONNEL}</span> &nbsp;&nbsp;
                                <span className="lastChatText">{room.LAST_CHAT_TEXT}</span>
                                <span className="lastChatRegDate">{room.LAST_CHAT_REG_DATE}</span>
                                <a href="#" onClick={(e) => {e.preventDefault(); e.stopPropagation(); modifyRoomName(room.ROOM_NO, room.PARTI_CUSTOMZING_NAME, room.USER_NO);}} className="chatTitleNameModifyBtn">MOD</a>
                                <a href="#" onClick={(e) => {e.preventDefault(); e.stopPropagation(); leaveRoom(room.ROOM_NO, room.USER_NO);}} className="chatDeleteBtn">DEL</a>
                                <a href="#" onClick={(e) => {e.preventDefault(); e.stopPropagation(); favoriteRoom(room.ROOM_NO, room.USER_NO);}} className="chatBookmarkBtn">LIKE</a>
                            </li>
                            
                            ))}
                        </ul>
                    ) : (
                        <>
                            <div className="emptyCahtList">참여한 채팅방이 없습니다</div>
                        </>
                    )
                )}
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
                    isShowChatTitleNameModModal={isShowChatTitleNameModModal}
                    setIsShowChatTitleNameModModal={setIsShowChatTitleNameModModal}
                />
                :
                    null
            }
        </>
    );
}
export default ChatRoom;