import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { friendListsAction, myProfileAction } from "../action/friendList";
import Nav from "../../include/Nav";
import MyProfile from "./MyProfile";

import '../../css/profile.css'
import '../../css/common.css'

function FriendList() {

    const dispatch = useDispatch();
    const friends = useSelector(state => state['friend']['friends']);

    useEffect(() => {
        console.log('[FriendList] useEffect');

        axiosGetFriendList();
        
    }, [dispatch]);

    //친구리스트 불러오기
    const axiosGetFriendList = () => {
        console.log('axiosGetFriendList');

        axios({
            url: 'http://localhost:3001/friend/friendList',
            method: 'get',
            // params: {
            //     'user_id': 'gildong',
            // }
        })
        .then(response => {
            console.log('axiosGetFriendList success', response.data);

            const friendsObj = response.data.reduce((obj, friend) => {
                obj[friend.FRIEND_NO] = {
                    name: friend.FRIEND_TARGET_NAME,
                    id: friend.FRIEND_TARGET_ID,
                    favorite: friend.FRIEND_FAVORITES,
                    frontImg: friend.USER_FRONT_IMG_NAME,
                    curMsg: friend.USER_CUR_MSG,
                };
                return obj;
            }, {});

            dispatch(friendListsAction(friendsObj));

        })
        .catch(error => {
            console.log('axiosGetFriendList error');
            
        })
        .finally(data => {
            console.log('axiosGetFriendList complete');
            
        });
    }

    //즐겨찾기 친구 필터링
    const favoirtefriendLists = () => {
        console.log('render favoirtefriendLists()');

        const favoriteLists = Object.keys(friends).filter((friendId) => friends[friendId].favorite === 1).map((friendId, index) => (
            <li key={index} className="profile">
                 {
                        friends[friendId].frontImg === ''
                        ?
                            <>
                                <img src="/resource/img/profile_default.png" className="frontProfileImg"/>
                            </>
                            :
                            <>
                                <img src={`http://localhost:3001/${friends[friendId].id}/${friends[friendId].frontImg}`} className="frontProfileImg"/>
                            </>
                            
                }
                <span className="profileName">{friends[friendId].name}</span>
                {friends[friendId].curMsg}
            </li>
        ));

        return <ul>{favoriteLists}</ul>
    }

    return(
        <div>
        <Nav />
           <h2>친구 목록</h2>
          <MyProfile />
           <h3>즐겨찾기</h3>
                <span className="profileName">{favoirtefriendLists()}</span>
           <h3>친구</h3>
            <ul>
                {Object.keys(friends).map((friendId, index) => (
                    <li key={index} className="profile">
                        
                        {
                            friends[friendId].frontImg === ''
                            ?
                                <>
                                    <img src="/resource/img/profile_default.png" className="frontProfileImg"/>
                                </>
                            :
                                <>
                                    <img src={`http://localhost:3001/${friends[friendId].id}/${friends[friendId].frontImg}`} className="frontProfileImg"/>
                                </>
                            
                        }
                        <span className="profileName">{friends[friendId].name}</span>
                        {friends[friendId].curMsg}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FriendList;