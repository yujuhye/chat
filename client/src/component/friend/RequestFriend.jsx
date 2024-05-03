import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { originFriendInfoAction, requestFriendAction } from "../action/requestFriendAction";

import '../../css/profile.css';
import '../../css/common.css';

function RequestFriend() {

    const dispatch = useDispatch();
    const originFriendInfo = useSelector(state => state['requestFriend']['originFriend']);  //나와 친구일경우 멤버정보
    const requstingFriend = useSelector(state => state['requestFriend']['requestingFriend']);  //요청했는데 대기중인경우의 멤버정보

    const navigate = useNavigate();
    
    const [uId, setUId] = useState('');
    const [searchMessage, setSearchMessage] = useState('');   
    const [searchFriendInfo, setSearchFriendInfo] = useState('');    //서칭한친구정보
    // const [originFriendInfo, setOriginFriendInfo] = useState('');
    const [friendStatus, setFriendStatus] = useState(null);
    const [requestMessage, setRequestMessage] = useState('');
    const [showMessageBtn, setShowMessageBtn] = useState(false);

    useEffect(() => {

        if (Object.keys(searchFriendInfo).length > 0) { 
            axiosMatchFriendInfo();
            
        } else {
            setFriendStatus(null); 
        }

    }, [searchFriendInfo]);

    useEffect(() => {

        const originFriendBlocks = Object.keys(originFriendInfo).map(key => originFriendInfo[key].friendBlock);
        const originFriendBlock = originFriendBlocks[0];
    
        if(originFriendBlock === 0) {
            setFriendStatus('friend');
        } else if(originFriendBlock === 1) {
            setFriendStatus('blockFriend');
        }
    
    }, [originFriendInfo]); 

    // 친구찾기
    const searchFriendIdChangeHandler = (e) => {
        console.log('searchFriendId ChangeHandler');

        if(e.target.name === 'uId') {
            setUId(e.target.value);
        }
    }

    const searchFriendClickHandler = () => {
        console.log('searchFriend ClickHandler');

        let form = document.searchFriend;
        if(uId === '') {
            alert('INPUT FRIEND ID');
            form.uId.focus();

        } else {
            axiosSearchFriendById();
        }
    }

    //요청메세지
    const requestMessageChangeHandler =(e) => {
        console.log('requestMessage ChangeHandler');
    
        if(e.target.name === 'reqMessage') {
            setRequestMessage(e.target.value);
        }
    
    }

    //요청메세지버튼 클릭시
    const requestMessageBtnClickHandler = () => {
        console.log('requestMessageBtn ClickHandler');

        setShowMessageBtn(prev => !prev);

    }

    //친구요청 버튼 클릭시
    const requestFriendBtnClickHandler = () => {
        console.log('requestFriendBtn ClickHandler');

        axiosRequestFriend();

    }

    //친구요청 취소버튼 클릭시
    const deleteRequestFriendBtnClickHandler = () => {
        console.log('deleteRequestFriendBtnClickHandler()');

        if(window.confirm('정말로 친구요청을 취소하시겠습니까?')) {
            axiosDeleteRequestFriend();
        }
        
    }

    //axios
    //서칭아이디값 가져오기
    function axiosSearchFriendById() {
        console.log('axiosSearchFriendById()');

        axios({
            url: 'http://localhost:3001/friend/searchFriendById',
            method: 'get',
            params: {
                'uId': uId,
            }
        })
        .then(response => {
            console.log('axiosSearchFriendById success', response.data);

            
            if(response.data !== null ) {

                const searchFriendObj = response.data.reduce((obj, searchFriend) => {
                    obj[searchFriend.USER_NO] = {
                        searchName: searchFriend.USER_NICKNAME,
                        searchId: searchFriend.USER_ID,
                        searchNo: searchFriend.USER_NO,
                        searchFrontImg: searchFriend.USER_FRONT_IMG_NAME,
                        searchCurMsg: searchFriend.USER_CUR_MSG,
                    };
                    return obj;
                }, {});

                setSearchMessage('');
                setSearchFriendInfo(searchFriendObj);
    
            } else {

                setSearchFriendInfo('');
                setSearchMessage('아이디가 존재하지 않습니다.');
                setFriendStatus(null);
            }
        })
        .catch(error => {
            console.log('axiosSearchFriendById error');
            setSearchMessage('아이디를 찾던중 오류가 발생했습니다.');
            setSearchFriendInfo('');
            setFriendStatus(null);
            
        })
        .finally(data => {
            console.log('axiosSearchFriendById complete');
            
        });

    }

    // 친구여부확인
    function axiosMatchFriendInfo() {
        console.log('axiosMatchFriendInfo');

        const friendIds = Object.keys(searchFriendInfo).map(searchFriendInfoId => searchFriendInfo[searchFriendInfoId].searchId);
        const friendId = friendIds[0];

        axios({
            url: 'http://localhost:3001/friend/matchingFriend',
            method: 'get',
            params: {
                'friendId': friendId,
            }
        })
        .then(response => {
            console.log('axiosMatchFriendInfo success', response.data);

            
            if(response.data !== null ) {

                const originFriendObj = response.data.reduce((obj, originFriend) => {
                    obj[originFriend.FRIEND_NO] = {
                        friendNo: originFriend.FRIEND_NO,
                        friendId: originFriend.FRIEND_TARGET_ID,
                        friendBlock: originFriend.FRIEND_IS_BLOCK,
                    };
                    return obj;
                }, {});

                dispatch(originFriendInfoAction(originFriendObj));

            } else {
                axiosMatchRequestFriend();
            }


        })
        .catch(error => {
            console.log('axiosMatchFriendInfo error');
            
        })
        .finally(data => {
            console.log('axiosMatchFriendInfo complete');
            
        });

    }

    //요청상태 확인
    function axiosMatchRequestFriend() {
        console.log('axiosMatchRequestFriend()');

        const friendIds = Object.keys(searchFriendInfo).map(searchFriendInfoId => searchFriendInfo[searchFriendInfoId].searchId);
        const friendId = friendIds[0];

        axios({
            url: 'http://localhost:3001/friend/matchingRequestFriend',
            method: 'get',
            params: {
                'friendId': friendId,
            }
        })
        .then(response => {
            console.log('axiosMatchRequestFriend success', response.data);

            
            if(response.data !== null ) {

                const requestFriendObj = response.data.reduce((obj, requestFriend) => {
                    obj[requestFriend.REQUEST_NO] = {
                        reqFriendId: requestFriend.REQUEST_TARGET_ID,
                        reqFriendName: requestFriend.REQUEST_TARGET_NAME,
                    };
                    return obj;
                }, {});

                dispatch(requestFriendAction(requestFriendObj));

                setFriendStatus('requestingFriend');

            } else {
                setFriendStatus('notFriend');
            }


        })
        .catch(error => {
            console.log('axiosMatchRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosMatchRequestFriend complete');
            
        });

    }

    //친구요청 
    function axiosRequestFriend() {
        console.log('axiosRequestFriend()');

        const friendIds = Object.keys(searchFriendInfo).map(searchFriendInfoId => searchFriendInfo[searchFriendInfoId].searchId);
        const friendId = friendIds[0];
        const friendNames = Object.keys(searchFriendInfo).map(searchFriendInfoId => searchFriendInfo[searchFriendInfoId].searchName);
        const friendName = friendNames[0];

        let formData = {
            'friendId': friendId,
            'friendName': friendName,
            'reqMessage': requestMessage,
        }

        axios({
            url: 'http://localhost:3001/friend/requestFriend',
            method: 'post',
            data: formData
        })
        .then(response => {
            console.log('axiosRequestFriend success', response.data);

            
            if(response.data > 0 ) {

                alert('친구요청에 성공하였습니다.');
                navigate('/friend/friendList');
    
            } else {
                alert('친구요청에 실패하였습니다.');
                navigate('/friend/requestFriend')
            }

        })
        .catch(error => {
            console.log('axiosRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosRequestFriend complete');
            
        });


    }

    //요청삭제
    function axiosDeleteRequestFriend(originFriendId) {
        console.log('axiosDeleteRequestFriend');

        const requestingFriendIds = Object.keys(requstingFriend).map(requstingFriendId => requstingFriend[requstingFriendId].reqFriendId);
        const requestingFriendId = requestingFriendIds[0];

        axios({
            url: 'http://localhost:3001/friend/deleteRequestFriend',
            method: 'delete',
            params: {
                'requestingFriendId' : requestingFriendId,
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

    //origin친구no(채팅할떄 넘겨주기)
    // function friendId() {
        
    //     const originFriendNos = Object.keys(originFriendInfo).map(originFriendInfoId => originFriendInfo[originFriendInfoId].friendNo);
    //     const originFriendNo= originFriendNos[0];
    //     return originFriendNo;
    // }

    return(
        <>
        <form name="searchFriend">
            <input type="text" name="uId" value={uId} onChange={(e) => {searchFriendIdChangeHandler(e)}}  placeholder="아이디로 친구 검색"/>
            <input type="button" value="SEARCH" onClick={searchFriendClickHandler}/>
        </form>
        {searchMessage && <p>{searchMessage}</p>}
        {Object.keys(searchFriendInfo).length > 0 && (
            <ul>
                {Object.keys(searchFriendInfo).map((searchFriendInfoId, index) => (
                <li key={index} className="profile">
                    {
                        searchFriendInfo[searchFriendInfoId].searchFrontImg === ''
                            ?
                            <>
                                <img src="/resource/img/profile_default.png" className="frontProfileImg"/>
                            </>
                            :
                            <>
                                <img src={`http://localhost:3001/${searchFriendInfo[searchFriendInfoId].searchId}/${searchFriendInfo[searchFriendInfoId].searchFrontImg}`} className="frontProfileImg"/>
                            </>
                            
                    }
                    <span className="profileName">{searchFriendInfo[searchFriendInfoId].searchName}</span>
                    <span>{searchFriendInfo[searchFriendInfoId].searchCurMsg}</span>
                </li>
                ))}
            </ul>
        )}
        {
            friendStatus === null
             ? 
             <>
             </>
             : 
             friendStatus === 'friend'
             ?
             <div>
             <Link to="/chat/chatView/:roomId">채팅</Link>
            </div>
            :
            friendStatus === 'blockFriend' 
            ?
            <p>차단된 아이디입니다</p>
            :
            friendStatus === 'requestingFriend' 
            ?
            <>
            <input type="button" value="요청대기중"/><br />
            <input type="button" value="요청취소" onClick={deleteRequestFriendBtnClickHandler}/>
            </>
            :
              friendStatus === 'notFriend' ? 
                <>
                    <input type="button" value="요청메세지" onClick={requestMessageBtnClickHandler}/>
                    {
                      showMessageBtn 
                      ?   
                      <input type="text" name="reqMessage" onChange={(e) => requestMessageChangeHandler(e)} placeholder="요청메세지를 입력하세요" />
                      :
                      <></>
                    }
                    <br />
                    <input type="button" onClick={requestFriendBtnClickHandler}  value="친구요청"/>
                </>
             : 
            null
        }
        </>
    );
}

export default RequestFriend;