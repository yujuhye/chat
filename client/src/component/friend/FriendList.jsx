import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { friendListsAction } from "../action/friendList";

function FriendList() {

    const dispatch = useDispatch();
    const friends = useSelector(state => state['friend']['friends']);

    useEffect(() => {
        console.log('[FriendList] useEffect');

        axiosGetFriendList();
        axiosGetMyProfile();
        
    }, [dispatch]);

    //친구리스트 불러오기
    const axiosGetFriendList = () => {
        console.log('axiosGetFriendList');

        axios({
            url: 'http://localhost:3001/friend/friendList',
            method: 'get',
            params: {
                'user_id': 'gildong',
            }
        })
        .then(response => {
            console.log('axiosGetFriendList success', response.data);

            const friendsObj = response.data.reduce((obj, friend) => {
                obj[friend.FRIEND_NO] = {
                    name: friend.FRIEND_TARGET_NAME,
                    favorite: friend.FRIEND_FAVORITES,
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

        return Object.keys(friends).filter((friendId) => friends[friendId].favorite === 1).map((friendId, index) => (
            <li key={index}>{friends[friendId].name}</li>
        ));
    }

    //내 프로필 가져오기
    const axiosGetMyProfile = () => {
        console.log('axiosGetMyProfile');

        axios({
            url: 'http://localhost:3001/friend/myProfile',
            method: 'get',
            params: {
                'user_id': 'gildong',
            }
        })
        .then(response => {
            console.log('axiosGetMyProfile success', response.data);

            // const friendsObj = response.data.reduce((obj, friend) => {
            //     obj[friend.FRIEND_NO] = {
            //         name: friend.FRIEND_TARGET_NAME,
            //         favorite: friend.FRIEND_FAVORITES,
            //     };
            //     return obj;
            // }, {});

            // dispatch(friendListsAction(friendsObj));

        })
        .catch(error => {
            console.log('axiosGetMyProfile error');
            
        })
        .finally(data => {
            console.log('axiosGetMyProfile complete');
            
        });
    }

    return(
        <>
           <h3>친구 목록</h3>
           <p>즐겨찾기</p>
                {favoirtefriendLists()}
           <p>친구</p>
            <ul>
                {Object.keys(friends).map((friendId, index) => (
                    <li key={index}>{friends[friendId].name}</li>
                ))}
            </ul>
        </>
    );
}

export default FriendList;