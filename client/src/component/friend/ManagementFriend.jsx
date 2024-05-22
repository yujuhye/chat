import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp  } from "react-icons/io";

import '../../css/managementFriend.css';
import RequestFriend from "./RequestFriend";
import SideNav from "../../include/SideNav";
import '../../css/common.css';

function ManagementFriend() {

    const [getReqFriend, setGetReqFriend] = useState(''); 
    const [sentReqFriend, setSentReqFriend] = useState(''); 
    const [blockFriend, setBlockFriend] = useState(''); 
    const [hiddenFriend, setHiddenFriend] = useState('');
    const [receivedIsOpen, setReceivedIsOpen] = useState(false);
    const [reqIsOpen, setReqIsOpen] = useState(false);
    const [blockIsOpen, setBlockIsOpen] = useState(false);
    const [hiddenIsOpen, sethiddenIsOpen] = useState(false);

    const navigate = useNavigate();

    //수락 버튼클릭시
    const acceptRequestBtnClickHandler = (recId, recName) => {
        console.log('acceptRequestBtnClickHandler()');

        axiosAcceptRequestFriend(recId, recName);
    }

    //숨기기 버튼클릭시
    const hideRequestBtnClickHandler = (reqId) => {
        console.log('hideRequestBtnClickHandler()');

        axiosHideRequestFriend(reqId);

    }

    //요청취소 버튼클릭시
    const deleteRequestBtnClickHandler = (reqNo) => {
        console.log('deleteRequestBtnClickHandler');

        if(window.confirm('친구요청을 취소하시겠습니까?')) {
            axiosDeleteReqFriend(reqNo);
        }
    }

    //차단해제 버튼클릭시
    const releaseBlockFriendClickHandler = (friendNo) => {
        console.log('releaseBlockFriendClickHandler()');
        console.log('친구no', friendNo);

        if(window.confirm('차단 해제를 하시겠습니까?')) {
            axiosReleaseBlockFriend(friendNo);
        }

    }

    //숨김해제 클릭시
    const releaseHiddenFriendClickHandler = (friendNo) => {
        console.log('releaseHiddenFriendClickHandler');

        axiosReleaseHiddenFriend(friendNo);
    }

    //받은요청 클릭시
    const receivedClickHandler = () => {
        console.log('receivedClickHandler()');

        if(!receivedIsOpen) {
            axiosGetReceivedRequestFriend();
        }
        setReceivedIsOpen(!receivedIsOpen);
    }

    //보낸요청 클릭시
    const requestClickHandler = () => {
        console.log('requestClickHandler');

        if(!reqIsOpen) {
            axiosGetSentRequestFriend();
        }
        setReqIsOpen(!reqIsOpen);
    }

    //차단친구 클릭시
    const blockClickHandler = () => {
        console.log('blockClickHandler()');

        if(!blockIsOpen) {
            axiosGetBlockFriend();
        }
        setBlockIsOpen(!blockIsOpen);
    }

    //숨김요청 클릭시
    const hiddenReqClickHandler = () => {
        console.log('hiddenReqClickHandler()');
        if(!hiddenIsOpen) {
            axiosGetHiddenFriends();
        }
        sethiddenIsOpen(!hiddenIsOpen);
    }
    
    //axios
    //받은 요청 불러오기
    function axiosGetReceivedRequestFriend() {
        console.log('axiosGetReceivedRequestFriend');

        axios({
            url: 'http://localhost:3001/friend/getReceivedRequestFriend',
            method: 'get',
        })
        .then(response => {
            console.log('axiosGetReceivedRequestFriend success', response.data);

            
            if(response.data !== null ) {

                const getRequestFriendObj = response.data.reduce((obj, getRequestFriend) => {
                    obj[getRequestFriend.REQUEST_NO] = {
                        getReqfriendNo: getRequestFriend.REQUEST_NO,
                        getReqfriendId: getRequestFriend.USER_ID,
                        getReqfriendName: getRequestFriend.USER_NICKNAME,
                        getReqfriendMes: getRequestFriend.REQUEST_MESSAGE,
                        getReqfriendImg: getRequestFriend.USER_FRONT_IMG_NAME,
                    };
                    return obj;
                }, {});

                setGetReqFriend(getRequestFriendObj);
               

            } else {
                setGetReqFriend('');
            }


        })
        .catch(error => {
            console.log('axiosGetReceivedRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosGetReceivedRequestFriend complete');
            
        });

    }

    //요청수락
    function axiosAcceptRequestFriend(recId, recName) {
        console.log('axiosAcceptRequestFriend()');

        axios({
            url: 'http://localhost:3001/friend/acceptRequestFriend',
            method: 'put',
            params: {
                'acceptReqfriendId': recId,
                'acceptReqfriendName': recName, 
            }
        })
        .then(response => {
            console.log('axiosAcceptRequestFriend success', response.data);

            
            if(response.data > 0 ) {

                axiosAcceptReqTargetFriend(recId, recName);
                alert('요청 수락이 완료되었습니다.');
                navigate('/friend/friendList');
               
            } else {
                alert('요청 수락에 실패하였습니다.');
                navigate('/friend/managementFriend');
            }


        })
        .catch(error => {
            console.log('axiosAcceptRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosAcceptRequestFriend complete');
            
        });

    }

    //숨기기
    function axiosHideRequestFriend(reqId) {
        console.log('axiosHideRequestFriend()');

        axios({
            url: 'http://localhost:3001/friend/hideRequestFriend',
            method: 'put',
            params: {
                'reqId': reqId,
            }
        })
        .then(response => {
            console.log('axiosAcceptRequestFriend success', response.data);

            
            if(response.data > 0 ) {

                alert('요청 숨기기가 완료되었습니다.');
                navigate('/friend/friendList');
               
            } else {
                alert('요청 숨기기에 실패하였습니다.');
                navigate('/friend/managementFriend');
            }


        })
        .catch(error => {
            console.log('axiosAcceptRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosAcceptRequestFriend complete');
            
        });

    }

    // 친구추가
    function axiosAcceptReqTargetFriend(recId, recName) {
        console.log('axiosAcceptReqTargetFriend()');

        let formData = {
            'acceptReqfriendId': recId,
            'acceptReqfriendName': recName,
        }

        axios({
            url: 'http://localhost:3001/friend/acceptReqTargetFriend',
            method: 'post',
            data: formData, 
        })
        .then(response => {
            console.log('axiosAcceptReqTargetFriend success', response.data);

        })
        .catch(error => {
            console.log('axiosAcceptReqTargetFriend error');
            
        })
        .finally(data => {
            console.log('axiosAcceptReqTargetFriend complete');
            
        });

    }

    //보낸 요청가져오기
    function axiosGetSentRequestFriend() {
        console.log('axiosGetSentRequestFriend()');

        axios({
            url: 'http://localhost:3001/friend/getSentRequestFriend',
            method: 'get',
        })
        .then(response => {
            console.log('axiosGetSentRequestFriend success', response.data);

            if(response.data !== null ) {

                const sentRequestFriendObj = response.data.reduce((obj, sentRequestFriend) => {
                    obj[sentRequestFriend.REQUEST_NO] = {
                        sentReqfriendNo: sentRequestFriend.REQUEST_NO,
                        sentReqfriendId: sentRequestFriend.REQUEST_TARGET_ID,
                        sentReqfriendName: sentRequestFriend.REQUEST_TARGET_NAME,
                        sentReqfrienImg: sentRequestFriend.USER_FRONT_IMG_NAME,
                    };
                    return obj;
                }, {});

                setSentReqFriend(sentRequestFriendObj);

            } else {
                setSentReqFriend('');
            }

        })
        .catch(error => {
            console.log('axiosGetSentRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosGetSentRequestFriend complete');
            
        });
    }

    //요청 삭제
    function axiosDeleteReqFriend(reqNo) {
        console.log('axiosDeleteReqFriend()');

        axios({
            url: 'http://localhost:3001/friend/deletesentReqFriend',
            method: 'delete',
            params: {
                'reqNo' : reqNo,
            }
        })
        .then(response => {
            console.log('axiosDeleteRequestFriend success', response.data);

            
            if(response.data > 0 ) {

                alert('친구요청 삭제가 완료되었습니다.');
                navigate('/friend/friendList');
    
            } else {
                alert('친구요청 삭제가 실패되었습니다.');
                navigate('/friend/requestFriend')
            }

        })
        .catch(error => {
            console.log('axiosDeleteRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosDeleteRequestFriend complete');
            
        });
    }

    //차단친구 가져오기
    function axiosGetBlockFriend() {
        console.log('axiosGetBlockFriend()');

        axios({
            url: 'http://localhost:3001/friend/blockFriend',
            method: 'get',
        })
        .then(response => {
            console.log('axiosGetBlockFriend success', response.data);

            if(response.data !== null ) {

                const blockFriendObj = response.data.reduce((obj, blockFriend) => {
                    obj[blockFriend.FRIEND_NO] = {
                        blockFriendNo: blockFriend.FRIEND_NO,
                        blockFriendId: blockFriend.FRIEND_TARGET_ID,
                        blockFriendName: blockFriend.FRIEND_TARGET_NAME,
                        blockFriendImg: blockFriend.USER_FRONT_IMG_NAME,
                    };
                    return obj;
                }, {});

                setBlockFriend(blockFriendObj);

            } else {
                setBlockFriend('');
            }
            

        })
        .catch(error => {
            console.log('axiosGetBlockFriend error');
            
        })
        .finally(data => {
            console.log('axiosGetBlockFriend complete');
            
        });

    }

    //차단해제
    function axiosReleaseBlockFriend(friendNo) {
        console.log('axiosReleaseBlockFriend()');

        axios({
            url: 'http://localhost:3001/friend/releaseBlockFriend',
            method: 'put',
            params: {
                'friendNo': friendNo,
            }
        })
        .then(response => {
            console.log('axiosReleaseBlockFriend success', response.data);

            if(response.data > 0 ) {

               alert('차단해제 완료되었습니다.');
               navigate('/friend/friendList');

            } else {
                alert('차단해제 실패하였습니다.');
                navigate('/friend/friendList');
            }
            
        })
        .catch(error => {
            console.log('axiosReleaseBlockFriend error');
            
        })
        .finally(data => {
            console.log('axiosReleaseBlockFriend complete');
            
        });
    }

    //요청 숨긴친구 가져오기
    function axiosGetHiddenFriends() {
        console.log('axiosGetHiddenFriends()');

        axios({
            url: 'http://localhost:3001/friend/getHiddenFriends',
            method: 'get',
        })
        .then(response => {
            console.log('axiosGetHiddenFriends success', response.data);

            if(response.data !== null ) {

                const hiddenFriendObj = response.data.reduce((obj, hiddenFriend) => {
                    obj[hiddenFriend.REQUEST_NO] = {
                        hiddenfriendNo: hiddenFriend.REQUEST_NO,
                        hiddenfriendId: hiddenFriend.USER_ID,
                        hiddenfriendName: hiddenFriend.USER_NICKNAME,
                        hiddenfriendMes: hiddenFriend.REQUEST_MESSAGE,
                        hiddenfriendImg: hiddenFriend.USER_FRONT_IMG_NAME,
                    };
                    return obj;
                }, {});

                setHiddenFriend(hiddenFriendObj);

            } else {
                setHiddenFriend('');
            }
            
        })
        .catch(error => {
            console.log('axiosGetHiddenFriends error');
            
        })
        .finally(data => {
            console.log('axiosGetHiddenFriends complete');
            
        });        

    }

    //숨김 해제
    function axiosReleaseHiddenFriend(friendNo) {
        console.log('axiosReleaseHiddenFriend()');

        axios({
            url: 'http://localhost:3001/friend/releaseHiddenFriend',
            method: 'put',
            params: {
                'friendNo': friendNo,
            }
        })
        .then(response => {
            console.log('axiosReleaseHiddenFriend success', response.data);

            if(response.data > 0 ) {

               alert('숨김해제 완료되었습니다.');
               navigate('/friend/friendList');

            } else {
                alert('숨김해제 실패하였습니다.');
                navigate('/friend/friendList');
            }
            
        })
        .catch(error => {
            console.log('axiosReleaseHiddenFriend error');
            
        })
        .finally(data => {
            console.log('axiosReleaseHiddenFriend complete');
            
        });

    }


    return(
        <div className="managementFriendContainer">
            <SideNav />
            <div className="managementFriendWrap">
            <div className="requestFriendWraps"> <RequestFriend /></div>
            <div className="manageFriendText">
                <h2 >친구관리</h2>
            </div>
            <h3 className="managementFriend" onClick={receivedClickHandler}>받은요청 {receivedIsOpen ?  <IoIosArrowUp /> : <IoIosArrowDown />}
            </h3>
            { receivedIsOpen && (
                Object.keys(getReqFriend).length > 0 ? (
                    <ul className="managementUl">
                        {Object.keys(getReqFriend).map((getReqFriendid, index) => (
                            <li key={index} className="reqProfile">
                                {
                                    getReqFriend[getReqFriendid].getReqfriendImg === ''
                                    ?
                                        <>
                                            <img src="/resource/img/profile_default.png" className="reqProfileImg"/>
                                        </>
                                    :
                                        <>
                                            <img src={`http://localhost:3001/${getReqFriend[getReqFriendid].getReqfriendId}/${getReqFriend[getReqFriendid].getReqfriendImg}`} className="reqProfileImg"/>
                                        </>
                                    
                                }
                                <span className="reqProfileName">
                                    {getReqFriend[getReqFriendid].getReqfriendName}({getReqFriend[getReqFriendid].getReqfriendId})
                                </span> &nbsp;&nbsp;&nbsp;
                                    {getReqFriend[getReqFriendid].getReqfriendMes}
                                <input type="button" value="수락" onClick={() =>acceptRequestBtnClickHandler(getReqFriend[getReqFriendid].getReqfriendId, getReqFriend[getReqFriendid].getReqfriendName)}/>
                                <input type="button" value="숨기기" onClick={()=>hideRequestBtnClickHandler(getReqFriend[getReqFriendid].getReqfriendId)}/>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>받은요청이 없습니다.</p>
                )
            )}
            <h3 className="managementFriend" onClick={requestClickHandler}>보낸요청 {reqIsOpen ?  <IoIosArrowUp /> : <IoIosArrowDown />}
            </h3>
            { reqIsOpen && (
                Object.keys(sentReqFriend).length > 0 ? (
                <ul>
                    {Object.keys(sentReqFriend).map((sentReqFriendid, index) => (
                    <li key={index} className="reqProfile">
                        {
                        sentReqFriend[sentReqFriendid].sentReqfrienImg === '' 
                        ? 
                        <>
                            <img src="/resource/img/profile_default.png" className="reqProfileImg"/>
                        </>
                        : 
                        <>
                            <img src={`http://localhost:3001/${sentReqFriend[sentReqFriendid].sentReqfriendId}/${sentReqFriend[sentReqFriendid].sentReqfrienImg}`} className="reqProfileImg"/>
                        </>
                        }
                        <span className="reqProfileName">
                            {sentReqFriend[sentReqFriendid].sentReqfriendName}({sentReqFriend[sentReqFriendid].sentReqfriendId})
                        </span> &nbsp;&nbsp;&nbsp;
                        <input type="button" value="요청취소" onClick={() => deleteRequestBtnClickHandler(sentReqFriend[sentReqFriendid].sentReqfriendNo)}/>
                    </li>
                    ))}
                </ul>
            ) : (
            <p>보낸요청이 없습니다.</p>
            )
            )}
            <h3 className="managementFriend" onClick={blockClickHandler}>차단 친구 {blockIsOpen ?  <IoIosArrowUp /> : <IoIosArrowDown />}
            </h3>
            { blockIsOpen && (
                Object.keys(blockFriend).length > 0 ? (
                <ul>
                    {Object.keys(blockFriend).map((blockFriendid, index) => (
                    <li key={index} className="reqProfile">
                        {
                        blockFriend[blockFriendid].blockFriendImg === '' 
                        ? 
                        <>
                            <img src="/resource/img/profile_default.png" className="reqProfileImg"/>
                        </>
                        : 
                        <>
                            <img src={`http://localhost:3001/${blockFriend[blockFriendid].blockFriendId}/${blockFriend[blockFriendid].blockFriendImg}`} className="reqProfileImg"/>
                        </>
                        }
                        <span className="reqProfileName">
                            {blockFriend[blockFriendid].blockFriendName}({blockFriend[blockFriendid].blockFriendId})
                        </span> &nbsp;&nbsp;&nbsp;
                        <input type="button" value="차단해제" onClick={() => releaseBlockFriendClickHandler(blockFriend[blockFriendid].blockFriendNo)}/>
                    </li>
                    ))}
                </ul>
            ) : (
            <p>차단친구가 없습니다.</p>
            )
            )}
             <h3 className="managementFriend" onClick={hiddenReqClickHandler}>숨김 요청친구 {hiddenIsOpen ?  <IoIosArrowUp /> : <IoIosArrowDown />}
             </h3>
            { hiddenIsOpen  && (
                Object.keys(hiddenFriend).length > 0 ? (
                <ul>
                    {Object.keys(hiddenFriend).map((hiddenFriendid, index) => (
                    <li key={index} className="reqProfile">
                        {
                        hiddenFriend[hiddenFriendid].hiddenfriendImg === '' 
                        ? 
                        <>
                            <img src="/resource/img/profile_default.png" className="reqProfileImg"/>
                        </>
                        : 
                        <>
                            <img src={`http://localhost:3001/${hiddenFriend[hiddenFriendid].hiddenfriendId}/${hiddenFriend[hiddenFriendid].hiddenfriendImg}`} className="reqProfileImg"/>
                        </>
                        }
                        <span className="reqProfileName">
                            {hiddenFriend[hiddenFriendid].hiddenfriendName}({hiddenFriend[hiddenFriendid].hiddenfriendId})
                        </span> &nbsp;&nbsp;&nbsp;
                        <input type="button" value="숨김해제" onClick={() => releaseHiddenFriendClickHandler(hiddenFriend[hiddenFriendid].hiddenfriendNo)}/>
                    </li>
                    ))}
                </ul>
            ) : (
            <p>숨김친구가 없습니다.</p>
            )
            )}
            </div>
        </div>
    );
}

export default ManagementFriend;