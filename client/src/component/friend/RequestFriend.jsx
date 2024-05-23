import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { originFriendInfoAction, requestFriendAction } from "../action/requestFriendAction";
import socketIOClientByFriend from "socket.io-client";

// import '../../css/profile.css';
import '../../css/requestFriend.css';
import '../../css/common.css';
import useAxiosGetMember from "../../util/useAxiosGetMember";
import { SERVER_URL } from "../../util/url";

const server = "http://localhost:3001";

function RequestFriend() {
    useAxiosGetMember();
    const dispatch = useDispatch();
    const originFriendInfo = useSelector(state => state['requestFriend']['originFriend']);  //나와 친구일경우 멤버정보
    const requstingFriend = useSelector(state => state['requestFriend']['requestingFriend']);  //요청했는데 대기중인경우의 멤버정보
    const userId = useSelector(state => state.login.userId);
    const navigate = useNavigate();
    
    const [uId, setUId] = useState('');
    const [searchMessage, setSearchMessage] = useState('');   
    const [searchFriendInfo, setSearchFriendInfo] = useState('');    //서칭한친구정보
    const [friendStatus, setFriendStatus] = useState(null);
    const [requestMessage, setRequestMessage] = useState('');
    // const [showMessageBtn, setShowMessageBtn] = useState(false);
    const [selectSearchId, setSelectSearchId] = useState('');      //서칭아이디중 클릭
    // const [showStatus, setShowStatus] = useState(false);
    // const [selectedSearchIdInfo, setSelectedSearchIdInfo] = useState({});

    useEffect(() => {

        if (Object.keys(searchFriendInfo).length > 0) { 
            const selectedFriendInfo = Object.values(searchFriendInfo).find(searchFriend => searchFriend.searchId === selectSearchId);
            const no = selectedFriendInfo.searchNo;
           
            axiosMatchFriendInfo(no);
        } else {
            setFriendStatus(null); 
        }

    }, [selectSearchId]);

    useEffect(() => {

        const originFriendBlocks = Object.keys(originFriendInfo).map(key => originFriendInfo[key].friendBlock);
        const originFriendBlock = originFriendBlocks[0];
        if (Object.keys(searchFriendInfo).length > 0) { 
            const selectedFriendInfo = Object.values(searchFriendInfo).find(searchFriend => searchFriend.searchId === selectSearchId);
            const no = selectedFriendInfo.searchNo;
            if(originFriendBlock === 0) {
                // setFriendStatus('friend');
                setSearchFriendInfo(prevState => ({
                    ...prevState,
                    [no]: {
                        ...prevState[no],
                        friendStatus: 'friend', 
                    }
                }));
            } else if(originFriendBlock === 1) {
                // setFriendStatus('blockFriend');
                setSearchFriendInfo(prevState => ({
                    ...prevState,
                    [no]: {
                        ...prevState[no],
                        friendStatus: 'blockFriend', 
                    }
                }));
            }
           
        } else {
            setFriendStatus(null); 
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
    // const requestMessageChangeHandler =(e) => {
    //     console.log('requestMessage ChangeHandler');
    
    //     if(e.target.name === 'reqMessage') {
    //         setRequestMessage(e.target.value);
    //     }
    
    // }

    //요청메세지버튼 클릭시
    // const requestMessageBtnClickHandler = () => {
    //     console.log('requestMessageBtn ClickHandler');

    //     setShowMessageBtn(prev => !prev);

    // }

    //친구요청 버튼 클릭시
    const requestFriendBtnClickHandler = (reqId, reqName) => {
        console.log('requestFriendBtn ClickHandler');

        axiosRequestFriend(reqId, reqName);

    }

    //친구요청 취소버튼 클릭시
    const deleteRequestFriendBtnClickHandler = (reqId) => {
        console.log('deleteRequestFriendBtnClickHandler()');

        if(window.confirm('정말로 친구요청을 취소하시겠습니까?')) {
            axiosDeleteRequestFriend(reqId);
        }
        
    }

    //수락버튼 클릭시
    const acceptReceivedFriendClickHandler = (recId, recName) => {
        console.log('acceptReceivedFriendClickHandler');

        axiosAcceptRecFriend(recId, recName);
    }

    //요청친구 숨기기 버튼
    const hideReqFriendClickHandler = (sentId) => {
        console.log('hideReqFriendClickHandler()');

        axiosHideReqFriend(sentId);

    }

    //서칭아이디값 클릭시
    const searchIdClickHandler = (id, no) => {
        console.log('searchIdClickHandler()');

        setSelectSearchId(id);
        // setShowStatus(true);

        setSearchFriendInfo(prevState => ({
            ...prevState,
            [no]: {
                ...prevState[no],
                showStatus: !prevState[no].showStatus, 
            }
        }));

    }

    //axios
    //서칭아이디값 가져오기
    function axiosSearchFriendById() {
        console.log('axiosSearchFriendById()');

        axios({
            // url: 'http://localhost:3001/friend/searchFriendById',
            url: `${SERVER_URL.TARGET_URL()}/friend/searchFriendById`,
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
                        showStatus: false,
                        friendStatus: null,
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
    function axiosMatchFriendInfo(no) {
        console.log('axiosMatchFriendInfo');

        // const friendIds = Object.keys(searchFriendInfo).map(searchFriendInfoId => searchFriendInfo[searchFriendInfoId].searchId);
        // const friendId = friendIds[0];

        const friendId = selectSearchId;

        axios({
            // url: 'http://localhost:3001/friend/matchingFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/matchingFriend`,
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
                if(userId === selectSearchId) {
                    setSearchFriendInfo(prevState => ({
                        ...prevState,
                        [no]: {
                            ...prevState[no],
                            friendStatus: 'myself', 
                        }
                    }));
                } else {
                    axiosMatchRequestFriend(no);
                }
                
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
    function axiosMatchRequestFriend(no) {
        console.log('axiosMatchRequestFriend()');

        // const friendIds = Object.keys(searchFriendInfo).map(searchFriendInfoId => searchFriendInfo[searchFriendInfoId].searchId);
        // const friendId = friendIds[0];
        const selectedFriendInfo = Object.values(searchFriendInfo).find(searchFriend => searchFriend.searchId === selectSearchId);
        const selectedId = selectedFriendInfo.searchId;

        axios({
            // url: 'http://localhost:3001/friend/matchingRequestFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/matchingRequestFriend`,
            method: 'get',
            params: {
                'friendId': selectedId,
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

                // setFriendStatus('requestingFriend');
                setSearchFriendInfo(prevState => ({
                    ...prevState,
                    [no]: {
                        ...prevState[no],
                        friendStatus: 'requestingFriend', 
                    }
                }));

            } else {
                // setFriendStatus('notFriend');
                axiosReceivedReqFriend(selectedId, no);
            }


        })
        .catch(error => {
            console.log('axiosMatchRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosMatchRequestFriend complete');
            
        });

    }

    //받은요청인지
    function axiosReceivedReqFriend(selectedId, no) {
        console.log('axiosReceivedReqFriend()');

        axios({
            // url: 'http://localhost:3001/friend/matchingReceivedReqFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/matchingReceivedReqFriend`,
            method: 'get',
            params: {
                'friendId': selectedId,
            }
        })
        .then(response => {
            console.log('axiosMatchRequestFriend success', response.data);

            
            if(response.data !== null ) {

                // const requestFriendObj = response.data.reduce((obj, requestFriend) => {
                //     obj[requestFriend.REQUEST_NO] = {
                //         reqFriendId: requestFriend.REQUEST_TARGET_ID,
                //         reqFriendName: requestFriend.REQUEST_TARGET_NAME,
                //     };
                //     return obj;
                // }, {});

                // dispatch(requestFriendAction(requestFriendObj));

                // setFriendStatus('receivedFriend');
                setSearchFriendInfo(prevState => ({
                    ...prevState,
                    [no]: {
                        ...prevState[no],
                        friendStatus: 'receivedFriend', 
                    }
                }));

            } else {
                // setFriendStatus('notFriend');
                // setSearchFriendInfo(prevState => ({
                //     ...prevState,
                //     [no]: {
                //         ...prevState[no],
                //         friendStatus: 'notFriend', 
                //     }
                // }));
                axiosmatchHidenFriend(no);

            }

        })
        .catch(error => {
            console.log('axiosMatchRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosMatchRequestFriend complete');
            
        });

    }

    //숨긴친구인지
    function axiosmatchHidenFriend(no) {
        console.log('axiosmatchHidenFriend()');

        axios({
            // url: 'http://localhost:3001/friend/matchHidenFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/matchHidenFriend`,
            method: 'get',
            params: {
                'friendId': selectSearchId,
            }
        })
        .then(response => {
            console.log('axiosmatchHidenFriend success', response.data);

            
            if(response.data !== null ) {

                setSearchFriendInfo(prevState => ({
                    ...prevState,
                    [no]: {
                        ...prevState[no],
                        friendStatus: 'hiddenFriend', 
                    }
                }));
            
    
            } else {
                setSearchFriendInfo(prevState => ({
                    ...prevState,
                    [no]: {
                        ...prevState[no],
                        friendStatus: 'notFriend', 
                    }
                }));
            }

        })
        .catch(error => {
            console.log('axiosmatchHidenFriend error');
            
        })
        .finally(data => {
            console.log('axiosmatchHidenFriend complete');
            
        });


    }

    //친구요청 
    function axiosRequestFriend(reqId, reqName) {
        console.log('axiosRequestFriend()');


        let formData = {
            'friendId': reqId,
            'friendName': reqName,
        }

        axios({
            // url: 'http://localhost:3001/friend/requestFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/requestFriend`,
            method: 'post',
            data: formData
        })
        .then(response => {
            console.log('axiosRequestFriend success', response.data);

            
            if(response.data !== null ) {

                alert('친구요청에 성공하였습니다.');
                navigate('/friend/friendList');
                const socket = socketIOClientByFriend(server);
                socket.emit('send_friend_request', { targetId: reqId, fromName: response.data, fromId: userId});
    
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
    function axiosDeleteRequestFriend(reqId) {
        console.log('axiosDeleteRequestFriend');

        // const requestingFriendIds = Object.keys(requstingFriend).map(requstingFriendId => requstingFriend[requstingFriendId].reqFriendId);
        // const requestingFriendId = requestingFriendIds[0];

        axios({
            // url: 'http://localhost:3001/friend/deleteRequestFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/deleteRequestFriend`,
            method: 'delete',
            params: {
                'requestingFriendId' : reqId,
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

    //요청수락
    function axiosAcceptRecFriend(recId, recName) {
        console.log('axiosAcceptRecFriend');

        // const selectedFriendInfo = Object.values(searchFriendInfo).find(searchFriend => searchFriend.searchId === selectSearchId);
        // const selectedId = selectedFriendInfo.searchId;
        // const selectedName = selectedFriendInfo.searchName;

        axios({
            // url: 'http://localhost:3001/friend/acceptRequestFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/acceptRequestFriend`,
            method: 'put',
            params: {
                'acceptReqfriendId': recId,
                'acceptReqfriendName': recName, 
            }
        })
        .then(response => {
            console.log('axiosAcceptRecFriend success', response.data);

            
            if(response.data > 0 ) {

                axiosAcceptReqFriend(recId, recName);
                alert('요청 수락이 완료되었습니다.');
                navigate('/friend/friendList');
               
            } else {
                alert('요청 수락에 실패하였습니다.');
                navigate('/friend/managementFriend');
            }


        })
        .catch(error => {
            console.log('axiosAcceptRecFriend error');
            
        })
        .finally(data => {
            console.log('axiosAcceptRecFriend complete');
            
        });
    }

    //친구추가
    function axiosAcceptReqFriend(recId, recName) {
        console.log('axiosAcceptReqFriend()');

        // const selectedFriendInfo = Object.values(searchFriendInfo).find(searchFriend => searchFriend.searchId === selectSearchId);
        // const selectedId = selectedFriendInfo.searchId;
        // const selectedName = selectedFriendInfo.searchName;

        let formData = {
            'acceptReqfriendId': recId,
            'acceptReqfriendName': recName,
        }

        axios({
            // url: 'http://localhost:3001/friend/acceptReqTargetFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/acceptReqTargetFriend`,
            method: 'post',
            data: formData, 
        })
        .then(response => {
            console.log('axiosAcceptReqFriend success', response.data);

        })
        .catch(error => {
            console.log('axiosAcceptReqFriend error');
            
        })
        .finally(data => {
            console.log('axiosAcceptReqFriend complete');
            
        });

    }

    //요청받은 친구 숨기기
    function axiosHideReqFriend(sentId) {
        console.log('axiosHideReqFriend()');

        // const selectedFriendInfo = Object.values(searchFriendInfo).find(searchFriend => searchFriend.searchId === selectSearchId);
        // const selectedId = selectedFriendInfo.searchId;

        axios({
            // url: 'http://localhost:3001/friend/hideRequestFriend',
            url: `${SERVER_URL.TARGET_URL()}/friend/hideRequestFriend`,
            method: 'put',
            params: {
                'reqId': sentId,
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

    //origin친구no(채팅할떄 넘겨주기)
    // function friendId() {
        
    //     const originFriendNos = Object.keys(originFriendInfo).map(originFriendInfoId => originFriendInfo[originFriendInfoId].friendNo);
    //     const originFriendNo= originFriendNos[0];
    //     return originFriendNo;
    // }

    return(
        <div className="form-container">
        <h2 className="reqFriendText">친구요청</h2>
        <form className="searchFriendWrap" name="searchFriend">
            <input type="text" name="uId" value={uId} onChange={(e) => {searchFriendIdChangeHandler(e)}}  placeholder="아이디로 친구 검색"/>
            <input type="button" value="SEARCH" onClick={searchFriendClickHandler}/>
        </form>
        {searchMessage && <p>{searchMessage}</p>}
        {Object.keys(searchFriendInfo).length > 0 && (
            <ul className="reqFriendWrap">
                {Object.keys(searchFriendInfo).map((searchFriendInfoId, index) => (
                <li key={index} className="reqProfile" onClick={()=>searchIdClickHandler(searchFriendInfo[searchFriendInfoId].searchId, searchFriendInfo[searchFriendInfoId].searchNo )}>
                    {
                        searchFriendInfo[searchFriendInfoId].searchFrontImg === ''
                            ?
                            <>
                                <img src="/resource/img/profile_default.png" className="reqProfileImg"/>
                            </>
                            :
                            <>
                                <img src={`http://localhost:3001/${searchFriendInfo[searchFriendInfoId].searchId}/${searchFriendInfo[searchFriendInfoId].searchFrontImg}`} className="reqProfileImg"/>
                            </>
                            
                    }
                    <span className="reqProfileName">
                        {searchFriendInfo[searchFriendInfoId].searchName}({searchFriendInfo[searchFriendInfoId].searchId})
                    </span>
                    <span>{searchFriendInfo[searchFriendInfoId].searchCurMsg}</span>
                {
                    searchFriendInfo[searchFriendInfoId].showStatus 
                    ?
                    (
                    searchFriendInfo[searchFriendInfoId].friendStatus === null
                    ? 
                    <>
                    </>
                    : 
                    searchFriendInfo[searchFriendInfoId].friendStatus === 'friend'
                    ?
                    <p>친구 상태입니다.</p>
                    :
                    searchFriendInfo[searchFriendInfoId].friendStatus === 'myself'
                    ?
                    <div>
                    <Link to="#">나와의 채팅</Link>
                    </div>
                    :
                    searchFriendInfo[searchFriendInfoId].friendStatus === 'blockFriend' 
                    ?
                    <p>차단된 아이디입니다</p>
                    :
                    searchFriendInfo[searchFriendInfoId].friendStatus === 'requestingFriend' 
                    ?
                    <>
                    <input type="button" value="요청대기중"/><br />
                    <input type="button" value="요청취소" onClick={() => deleteRequestFriendBtnClickHandler(searchFriendInfo[searchFriendInfoId].searchId)}/>
                    </>
                    :
                    searchFriendInfo[searchFriendInfoId].friendStatus === 'receivedFriend'
                    ?
                    <>
                        <input type="button" value="수락" onClick={() =>acceptReceivedFriendClickHandler(searchFriendInfo[searchFriendInfoId].searchId, searchFriendInfo[searchFriendInfoId].searchName)}/><br />
                        <input type="button" value="숨기기" onClick={() => hideReqFriendClickHandler(searchFriendInfo[searchFriendInfoId].searchId)}/><br />
                    </>
                    :
                    searchFriendInfo[searchFriendInfoId].friendStatus === 'hiddenFriend' 
                    ?
                    <p>차단 숨김된 친구입니다.</p>
                    :
                    searchFriendInfo[searchFriendInfoId].friendStatus === 'notFriend' ? 
                        <>
                            {/* <input type="button" value="요청메세지" onClick={requestMessageBtnClickHandler}/>
                            {
                            showMessageBtn 
                            ?   
                            <input type="text" name="reqMessage" onChange={(e) => requestMessageChangeHandler(e)} placeholder="요청메세지를 입력하세요" />
                            :
                            <></>
                            } */}
                            <br />
                            <input type="button" onClick={() =>requestFriendBtnClickHandler(searchFriendInfo[searchFriendInfoId].searchId, searchFriendInfo[searchFriendInfoId].searchName)}  value="친구요청"/>
                        </>
                    : 
                    null
                    )
                    : (
                        null
                    )
                    
                }
                </li>
                ))}
            </ul>
        )}
        
        </div>
    );
}

export default RequestFriend;