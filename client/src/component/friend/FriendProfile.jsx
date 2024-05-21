import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import '../../css/friendProfile.css';
import { Link } from "react-router-dom";
import axios from "axios";
import Favorite from "./Favorite";
import { IoMdClose, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import io from 'socket.io-client';
const socket = io('http://localhost:3001');

function FriendProfile() {

    const selectedFriendId = useSelector(state => state['friend']['selectedFriend']);
    const friends = useSelector(state => state['friend']['friends']);
    const [showFriendImgsModal, setShowFriendImgsModal] = useState(false);
    const [friendFrontImages, setFriendFrontImages] = useState([]);
    const [curFrontIdx, setCurFrontIdx] = useState(0);

    const [showFriendBackModal, setShowFriendBackModal] = useState(false);
    const [friendBackImages, setFriendBackImages] = useState([]);
    const [curBackIdx, setCurBackIdx] = useState(0);

    const friendDetails = Object.values(friends).find(friend => friend.id === selectedFriendId);

    console.log('friendDetails: ',friendDetails);

    const [userInfo, setUserInfo] = useState('');

    // 컴포넌트가 마운트될 때 사용자 정보를 가져옴
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = () => {
        axios({
            url: `http://localhost:3001/chatRoom/getUserInfo`,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.data) {
                setUserInfo(response.data);
                console.log('user info -----> ', response.data);
            } else {
                console.log('[채팅] user 정보를 불러오는 데 실패했습니다.');
            }
        })
        .catch(error => {
            console.log(`[채팅] fetchUser Error: ${error.message}`);
        });
    };

    // 채팅 버튼 클릭 핸들러
    const chatBtnClickHandel = (friendNo, friendName) => {
        if (!userInfo) {
            alert('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        console.log('유저 정보!', userInfo);
        console.log('chatBtnClickHandel()', userInfo, friendNo, friendName);
        createChatRoom(userInfo, friendNo, friendName);
        
    };

    // 채팅방 생성 로직 (소켓 통신)
    const createChatRoom = (userInfo, friendNo, friendName) => {
        const roomName = `${userInfo.USER_NICKNAME}, ${friendName}`;

        socket.emit('chatRoomCreated', {
            userInfo,
            friendNo,
            friendName,
            roomName,
        });
    };

    // 소켓 이벤트 리스너 설정
    useEffect(() => {
        fetchUser();

        socket.on('roomCreated', (data) => {
            console.log('Chat room created', data);
        });

        socket.on('error', (error) => {
            console.error('Error creating chat room:', error);
        });

        return () => {
            socket.off('roomCreated');
            socket.off('error');
        };
    }, []);

    ///// 여기까지 채팅

    if(!selectedFriendId || !friendDetails) {
        return null;
    }

    //친구차단 클릭시
    const blockFriendClickHandler = () =>{
        console.log('blockFriendClickHandler()');

        if(window.confirm('차단하면 차단한 친구가 보내는 메시지를 받을 수 없으며 친구목록에서 삭제됩니다. \n차단여부는 상대방이 알 수 없습니다. \n차단을 계속 진행하시겠습니까?')) { 
            axiosBlockFriend();
        }
    }

    //친구삭제 클릭시
    const deleteFriendClickHandler = () => {
        console.log('deleteFriendClickHandler()');

        if(window.confirm('삭제하면 나의 친구 목록과 상대방의 친구목록에서 모두 삭제됩니다. \n삭제를 계속 진행하시겠습니까?')) { 
            axiosDeleteFriend();
        }
    }

    //친구 프로필사진 클릭시
    const friendProfileImgClickHandler = () => {
        console.log('friendProfileImgClickHandler()');

        axiosGetFriendProfileImgs();
    }

     //친구 배경사진 클릭시
    const friendBackImgClickHandler = () => {
        console.log('friendBackImgClickHandler()');

        axiosGetFriendBackImgs();
    }

     //next버튼 클릭시
     const nextImageClickHandler = () => {
        console.log('nextImageClickHandler');
        setCurFrontIdx((curFrontIdx + 1) % friendFrontImages.length);

    }

    //prev버튼 클릭시
    const PrevImageClickHandler = () => {
        console.log('PrevImageClickHandler()');
        setCurFrontIdx((curFrontIdx) => (curFrontIdx === 0 ? friendFrontImages.length - 1 : curFrontIdx - 1));
    }
    //back next버튼 클릭시
    const nextBackImageClickHandler = () => {
        console.log('nextBackImageClickHandler');
        setCurBackIdx((curBackIdx + 1) % friendBackImages.length);
    }

    //back prev버튼 클릭시
    const PrevBackImageClickHandler = () => {
        console.log('PrevBackImageClickHandler()');
        setCurBackIdx((curBackIdx) => (curBackIdx === 0 ? friendBackImages.length - 1 : curBackIdx - 1));
    }

    //친구차단
    const axiosBlockFriend = () => {
        console.log('axiosBlockFriend()');

        axios({
            url: 'http://localhost:3001/friend/updateblockFriend',
            method: 'put',
            params: {
                'friendId': selectedFriendId,
            }
        })
        .then(response => {
            console.log( 'axiosBlockFriend success', response.data );
               
            if(response.data > 0) {
                alert('친구 차단이 완료되었습니다');
                window.location.reload('/friend/friendList');
            } else {
                alert('친구 차단에 실패하였습니다. 다시 시도해주세요');
                window.location.reload('/friend/friendList');
            }

        })

        .catch(error => {
            console.log( ' axiosBlockFriend error' );
        })
        .finally(data => {
            console.log( ' axiosBlockFriend complete' );
        })

    }

    //친구삭제
    function axiosDeleteFriend() {
        console.log('axiosDeleteFriend');

        axios({
            url: 'http://localhost:3001/friend/deleteFriend',
            method: 'delete',
            params: {
                'friendId': selectedFriendId,
            }
        })
        .then(response => {
            console.log( 'axiosDeleteFriend success', response.data );
               
            if(response.data > 0) {
                alert('친구 삭제가 완료되었습니다');
                window.location.reload('/friend/friendList');
                axiosDeleteTargetFriend();
            } else {
                alert('친구 삭제에 실패하였습니다. 다시 시도해주세요');
                window.location.reload('/friend/friendList');
            }

        })

        .catch(error => {
            console.log( ' axiosDeleteFriend error' );
        })
        .finally(data => {
            console.log( ' axiosDeleteFriend complete' );
        })

    }

    //상대편 친구 삭제
    function axiosDeleteTargetFriend() {
        console.log('axiosDeleteTargetFriend');

        axios({
            url: 'http://localhost:3001/friend/deleteTargetFriend',
            method: 'delete',
            params: {
                'friendId': selectedFriendId,
            }
        })
        .then(response => {
            console.log( 'axiosDeleteFriend success', response.data );
               
            if(response.data > 0) {
                console.log('상대편 친구 삭제 성공');
            } else {
                console.log('상대편 친구 삭제 실패');
            }

        })

        .catch(error => {
            console.log( ' axiosDeleteFriend error' );
        })
        .finally(data => {
            console.log( ' axiosDeleteFriend complete' );
        })

    }

    //친구의 프로필 이미지들
    async function axiosGetFriendProfileImgs() {
        console.log('axiosGetFriendProfileImgs()');

        try {
            const response = await axios.get('http://localhost:3001/friend/getFriendProfileImgs', {
                params :{
                    selectId: selectedFriendId,
                }
            })
            console.log('axiosGetFriendProfileImgs success', response.data);
            if(response.data !== null) {
                setFriendFrontImages(response.data);
                setShowFriendImgsModal(true);
            } else {
                setFriendFrontImages(null);
                setShowFriendImgsModal(true);
            }
            
        } catch (error) {
            console.log('axiosGetFriendProfileImgs error');
        }

    }

    //친구의 배경 이미지들
    async function axiosGetFriendBackImgs() {
        console.log('axiosGetFriendBackImgs()');

        try {
            const response = await axios.get('http://localhost:3001/friend/getFriendBackImgs', {
                params :{
                    selectId: selectedFriendId,
                }
            })
            console.log('axiosGetFriendBackImgs success', response.data);
            if(response.data !== null) {
                setFriendBackImages(response.data);
                setShowFriendBackModal(true);
            } else {
                setFriendBackImages(null);
                setShowFriendBackModal(true);
            }
            
        } catch (error) {
            console.log('axiosGetFriendBackImgs error');
        }
    }
    
    return(
        <div className="friendProfileContainer">
            <span className="dropdown">
                <button className="dropbtn">관리</button>
                <div className="dropdownContent">
                    <button onClick={blockFriendClickHandler}>친구 차단</button>
                    <button onClick={deleteFriendClickHandler}>친구 삭제</button>
                </div>
            </span>
            <span className="favorite">
                <Favorite friendDetails={friendDetails} />
            </span>
            <img 
                className="friendProfileFrontImg"
                onClick={friendProfileImgClickHandler}
                src={friendDetails.frontImg 
                ? 
                `http://localhost:3001/${selectedFriendId}/${friendDetails.frontImg}` 
                : 
                "/resource/img/profile_default.png"} alt="Profile" 
            />
            <div className="friendModal">
                    {
                        showFriendImgsModal 
                        ?
                       <div className="friendModalImg">
                            <div className="friendModalWrap">
                                <div className="closeBtn">
                                    <IoMdClose  size="4em"  onClick={() => setShowFriendImgsModal(false)}/>
                                </div>
                                {
                                    friendFrontImages !== null 
                                    ?
                                    (friendFrontImages.length > 1
                                    ?
                                    <>
                                        <IoIosArrowBack className="prevBtn" size="6em" onClick={PrevImageClickHandler} />
                                        <IoIosArrowForward className="nextBtn" size="6em" onClick={nextImageClickHandler} />
                                        <img src= {`http://localhost:3001/${selectedFriendId}/${friendFrontImages[curFrontIdx].PROFILE_NAME}`}/>
                                    </>
                                    :
                                    <img src= {`http://localhost:3001/${selectedFriendId}/${friendFrontImages[curFrontIdx].PROFILE_NAME}`}/>)
                                    :
                                    <img src="/resource/img/profile_default.png"/>
                                }
                            </div>
                       </div>
                        :
                        <>
                        </>
                    }
                </div>
             <div
                    className="friendProfileBackImg"
                    onClick={friendBackImgClickHandler}
                    style={{
                        backgroundImage: `url(${
                            friendDetails.backImg
                            ? `http://localhost:3001/${selectedFriendId}/${friendDetails.backImg}`
                            : "/resource/img/default_back_img.jpg"
                        })`
                    }}
                ></div>
            <div className="friendModal">
                    {
                        showFriendBackModal 
                        ?
                       <div className="friendModalImg">
                            <div className="friendModalWrap">
                                <div className="closeBtn">
                                    <IoMdClose  size="4em"  onClick={() => setShowFriendBackModal(false)}/>
                                </div>
                                {
                                    friendBackImages !== null 
                                    ?
                                    (friendBackImages.length > 1
                                    ?
                                    <>
                                        <IoIosArrowBack className="prevBtn" size="6em" onClick={PrevBackImageClickHandler} />
                                        <IoIosArrowForward className="nextBtn" size="6em" onClick={nextBackImageClickHandler} />
                                        <img src= {`http://localhost:3001/${selectedFriendId}/${friendBackImages[curBackIdx].PROFILE_NAME}`}/>
                                    </>
                                    :
                                    <img src= {`http://localhost:3001/${selectedFriendId}/${friendBackImages[curBackIdx].PROFILE_NAME}`}/>)
                                    :
                                    <img src="/resource/img/default_back_img.jpg"/>
                                }
                            </div>
                       </div>
                        :
                        <>
                        </>
                    }
                </div>
             <div className="friendProfileName">
                {friendDetails.name}
             </div>
             <div className="friendProfileMsg">
                {friendDetails.curMsg}
             </div>
             <div>
             <input className="friendChattingBtn" type="button" name="friendChatting" value="채팅" onClick={()=>chatBtnClickHandel(friendDetails.no, friendDetails.name)}/>
             </div>
        </div>
    );
}

export default FriendProfile;