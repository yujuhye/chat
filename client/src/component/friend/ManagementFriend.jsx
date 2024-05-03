import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ManagementFriend() {

    const [getReqFriend, setGetReqFriend] = useState(''); 
    const [sentReqFriend, setSentReqFriend] = useState(''); 
    const navigate = useNavigate();

    useEffect(() => {

        axiosGetReceivedRequestFriend();
        axiosGetSentRequestFriend();

    }, [])

    //수락 버튼클릭시
    const acceptRequestBtnClickHandler = () => {
        console.log('acceptRequestBtnClickHandler()');

        axiosAcceptRequestFriend();
    }

    //요청취소 버튼클릭시
    const deleteRequestBtnClickHandler = () => {
        console.log('deleteRequestBtnClickHandler');

        if(window.confirm('정말로 친구요청을 취소하시겠습니까?')) {
            axiosDeleteReqFriend();
        }
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
                        getReqfriendId: getRequestFriend.USER_ID,
                        getReqfriendName: getRequestFriend.USER_NICKNAME,
                        getReqfriendMes: getRequestFriend.REQUEST_MESSAGE,
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
    function axiosAcceptRequestFriend() {
        console.log('axiosAcceptRequestFriend()');

        const acceptReqfriendIds = Object.keys(getReqFriend).map(getReqFriendid => getReqFriend[getReqFriendid].getReqfriendId);
        const acceptReqfriendId = acceptReqfriendIds[0];
        const acceptReqfriendNames = Object.keys(getReqFriend).map(getReqFriendid => getReqFriend[getReqFriendid].getReqfriendName);
        const acceptReqfriendName = acceptReqfriendNames[0];

        axios({
            url: 'http://localhost:3001/friend/acceptRequestFriend',
            method: 'put',
            params: {
                'acceptReqfriendId': acceptReqfriendId,
                'acceptReqfriendName': acceptReqfriendName, 
            }
        })
        .then(response => {
            console.log('axiosAcceptRequestFriend success', response.data);

            
            if(response.data > 0 ) {

                axiosAcceptReqTargetFriend();
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

    // 친구추가
    function axiosAcceptReqTargetFriend() {
        console.log('axiosAcceptReqTargetFriend()');

        const acceptReqfriendIds = Object.keys(getReqFriend).map(getReqFriendid => getReqFriend[getReqFriendid].getReqfriendId);
        const acceptReqfriendId = acceptReqfriendIds[0];
        const acceptReqfriendNames = Object.keys(getReqFriend).map(getReqFriendid => getReqFriend[getReqFriendid].getReqfriendName);
        const acceptReqfriendName = acceptReqfriendNames[0];

        let formData = {
            'acceptReqfriendId': acceptReqfriendId,
            'acceptReqfriendName': acceptReqfriendName,
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
                        sentReqfriendId: sentRequestFriend.REQUEST_TARGET_ID,
                        sentReqfriendName: sentRequestFriend.REQUEST_TARGET_NAME,
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
    function axiosDeleteReqFriend() {
        console.log('axiosDeleteReqFriend()');

        const sentReqFriendIds = Object.keys(sentReqFriend).map(sentReqFriendid => sentReqFriend[sentReqFriendid].sentReqfriendId);
        const sentReqFriendId = sentReqFriendIds[0];

        axios({
            url: 'http://localhost:3001/friend/deletesentReqFriend',
            method: 'delete',
            params: {
                'sentReqFriendId' : sentReqFriendId,
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

    return(
        <>
            <h2>친구관리</h2>
            <h3>받은요청</h3>
            {
                Object.keys(getReqFriend).length > 0 ? (
                    <ul>
                        {Object.keys(getReqFriend).map((getReqFriendid, index) => (
                            <li key={index} className="profile">
                                {
                                    getReqFriend[getReqFriendid].frontImg === ''
                                    ?
                                        <>
                                            <img src="/resource/img/profile_default.png" className="frontProfileImg"/>
                                        </>
                                    :
                                        <>
                                            <img src={`http://localhost:3001/${getReqFriend[getReqFriendid].getReqfriendId}/${getReqFriend[getReqFriendid].frontImg}`} className="frontProfileImg"/>
                                        </>
                                    
                                }
                                <span className="profileName">
                                    {getReqFriend[getReqFriendid].getReqfriendName}({getReqFriend[getReqFriendid].getReqfriendId})
                                </span> &nbsp;&nbsp;&nbsp;
                                    {getReqFriend[getReqFriendid].getReqfriendMes}
                                <input type="button" value="수락" onClick={acceptRequestBtnClickHandler}/>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>받은요청이 없습니다.</p>
                )
            }
            <h3>보낸요청</h3>
            {
                Object.keys(sentReqFriend).length > 0 ? (
                <ul>
                    {Object.keys(sentReqFriend).map((sentReqFriendid, index) => (
                    <li key={index} className="profile">
                        {
                        sentReqFriend[sentReqFriendid].frontImg === '' 
                        ? 
                        <>
                            <img src="/resource/img/profile_default.png" className="frontProfileImg"/>
                        </>
                        : 
                        <>
                            <img src={`http://localhost:3001/${sentReqFriend[sentReqFriendid].sentReqfriendId}/${sentReqFriend[sentReqFriendid].frontImg}`} className="frontProfileImg"/>
                        </>
                        }
                        <span className="profileName">
                            {sentReqFriend[sentReqFriendid].sentReqfriendName}({sentReqFriend[sentReqFriendid].sentReqfriendId})
                        </span> &nbsp;&nbsp;&nbsp;
                        <input type="button" value="요청취소" onClick={() => deleteRequestBtnClickHandler(sentReqFriendid)}/>
                    </li>
                    ))}
                </ul>
            ) : (
            <p>보낸요청이 없습니다.</p>
            )
            }

        </>
    );
}

export default ManagementFriend;