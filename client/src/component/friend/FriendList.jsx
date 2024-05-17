import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { friendListsAction, myProfileAction, selectedFriendId } from "../action/friendList";
import Nav from "../../include/Nav";
import MyProfile from "./MyProfile";

import '../../css/profile.css'
import '../../css/common.css'
import { Link, useNavigate } from "react-router-dom";
import SideNav from "../../include/SideNav";
import FriendProfile from "./FriendProfile";
import useAxiosGetMember from "../../util/useAxiosGetMember";
import cookie from 'js-cookie';

function FriendList() {

    // const dispatch = useDispatch();
    // const friends = useSelector(state => state['friend']['friends']);
    // const selectedFriend = useSelector(state => state['friend']['selectedFriend']);
    // const navigate = useNavigate();

    useAxiosGetMember();

    // useEffect(() => {
    //     console.log('[FriendList] useEffect');

    //     axiosGetFriendList();

    // }, [dispatch]);

    // //친구 프로필 클릭시
    // const friendProfileClickHandler = (friendId) => {
    //     console.log('friendProfileClickHandler()');

    //     // dispatch(selectedFriendId(friendId));

    //     if (selectedFriend === friendId) {
    //         dispatch(selectedFriendId(null));
    //     } else {
    //         dispatch(selectedFriendId(friendId));
    //     }
    // }

    // //친구리스트 불러오기
    // const axiosGetFriendList = () => {
    //     console.log('axiosGetFriendList');
    //     const userToken = cookie.get('userToken');
    //     const userId = cookie.get('userId');
    //     axios({
    //         url: 'http://localhost:3001/friend/friendList?`',
    //         method: 'get',
    //         headers: {
    //             Authorization: `Bearer ${userToken}` // 사용자 토큰을 헤더에 포함
    //         },
    //         params: {
    //             userId: userId // 사용자 ID를 쿼리 파라미터로 보냄
    //         }

    //     })
    //         .then(response => {
    //             console.log('axiosGetFriendList success', response.data);

    //             const friendsObj = response.data.reduce((obj, friend) => {
    //                 obj[friend.FRIEND_NO] = {
    //                     no: friend.FRIEND_NO,
    //                     name: friend.FRIEND_TARGET_NAME,
    //                     id: friend.FRIEND_TARGET_ID,
    //                     favorite: friend.FRIEND_FAVORITES,
    //                     frontImg: friend.USER_FRONT_IMG_NAME,
    //                     backImg: friend.USER_BACK_IMG_NAME,
    //                     curMsg: friend.USER_CUR_MSG,
    //                 };
    //                 return obj;
    //             }, {});

    //             dispatch(friendListsAction(friendsObj));

    //         })
    //         .catch(error => {
    //             console.log('AXIOS MEMBER LOGOUT THUM COMMUNICATION ERROR');

    //         })
    //         .finally(data => {
    //             console.log('axiosGetFriendList complete');

    //         });
    // }

    // //즐겨찾기 친구 필터링
    // const favoirtefriendLists = () => {
    //     console.log('render favoirtefriendLists()');

    //     const favoriteLists = Object.keys(friends).filter((friendId) => friends[friendId].favorite === 1).map((friendId, index) => (
    //         <div className="friendList">
    //             <li key={index} className="profile" onClick={() => friendProfileClickHandler(friends[friendId].id)}>
    //                 {
    //                     friends[friendId].frontImg === ''
    //                         ?
    //                         <>
    //                             <img src="/resource/img/profile_default.png" className="frontProfileImg" />
    //                         </>
    //                         :
    //                         <>
    //                             <img src={`http://localhost:3001/${friends[friendId].id}/${friends[friendId].frontImg}`} className="frontProfileImg" />
    //                         </>

    //                 }
    //                 <span className="profileName">{friends[friendId].name}</span>
    //                 {friends[friendId].curMsg}
    //             </li>
    //         </div>
    //     ));

    //     return <ul>{favoriteLists}</ul>
    // }

    return (
        <div className="friendListContainer">
            <Nav />


            {/* <SideNav />
            <div className="friendListWrap">
                <Nav />
                <h2>친구 목록</h2>
                <MyProfile />
                <h3>즐겨찾기</h3>
                <span>{favoirtefriendLists()}</span>
                <h3>친구</h3>
                <ul>
                    {Object.keys(friends).map((friendId, index) => (
                        // <div className="friendList">
                        <div className={`friendList ${selectedFriend === friends[friendId].id ? "selected" : ""}`} >
                            <li key={index} className="profile" onClick={() => friendProfileClickHandler(friends[friendId].id)}>

                                {
                                    friends[friendId].frontImg === ''
                                        ?
                                        <>
                                            <img src="/resource/img/profile_default.png" className="frontProfileImg" />
                                        </>
                                        :
                                        <>
                                            <img src={`http://localhost:3001/${friends[friendId].id}/${friends[friendId].frontImg}`} className="frontProfileImg" />
                                        </>

                                }
                                <span className="profileName">{friends[friendId].name}</span>
                                {friends[friendId].curMsg}
                            </li>
                        </div>
                        // </div>
                    ))}
                </ul>
            </div>
            <div className="friendProfileDetailsWrap">
                {
                    selectedFriend === null
                        ?
                        <></>
                        :
                        <>
                            <FriendProfile />
                        </>
                }
            </div> */}
        </div>
    );
}

export default FriendList;