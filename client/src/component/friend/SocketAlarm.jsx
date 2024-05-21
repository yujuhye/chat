import React, { useEffect, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import socketIOClientByFriend from "socket.io-client";
import '../../css/socketAlarm.css';
import { useSelector } from "react-redux";
import axios from "axios";
import cookie from 'js-cookie';
import { Link, useNavigate } from "react-router-dom";

const server = "http://localhost:3001";

function SocketAlarm() {
    const [notifications, setNotifications] = useState([]);
    const [isAlarmShow, setIsAlarmShow] = useState(false);
    const [newNotification, setNewNotification] = useState(false);
    const [savedNotifications, setSavedNotifications] = useState([]);
    const userId = useSelector(state => state.login.userId);
    const navigate = useNavigate();
    // const userToken = cookie.get('userToken');

    useEffect(() => {
        console.log('[SocketAlarm] useEffect');
        const socket = socketIOClientByFriend(server);

        socket.emit('register', (userId));

        socket.on('receive_notification', (data) => {
            console.log('소켓왔나???', data.fromId, data.fromName);
            setNotifications((prevNotifications) => [...prevNotifications, data.fromName]);
            setNewNotification(true);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    useEffect(() => {
        console.log('[SocketAlarm] get useEffect');

        axiosgetSavednotification();

    }, [userId])

    useEffect(() => {
        console.log('notifications@@@@', notifications);
    }, [notifications]);


    //종 클릭시
    const notificationClickHandler = () => {
        setNewNotification(false);
        setIsAlarmShow(prev => !prev);
    };

    //알람 내역 클릭시
    const notificationContentClickHandler = (fromId) => {
        console.log('notificationContentClickHandler', fromId);

        axiosUpdateNotificationReading(fromId);
        navigate('/friend/managementFriend');
    }

    //실시간 통신된 알림내역 클릭시
    const socketNotificationClickHandler = () => {
        console.log('socketNotificationClickHandler');

        navigate('/friend/managementFriend');
    }

    //저장된 알림 
    const axiosgetSavednotification = async () => {
        console.log('getSavednotification');

        try {
            const response = await axios.get('http://localhost:3001/friend/getSavednotification', {

            });
            console.log('getSavednotification success', response.data);
            if(response.data !== null) {
                setSavedNotifications(response.data);
                setNewNotification(true);
            } else {
                setSavedNotifications('');
                setNewNotification(false);
            }
           
        } catch (error) {
            console.log('getSavednotification error')
            
        }
    }

    //읽음 1 update
    async function axiosUpdateNotificationReading(fromId) {
        console.log('axiosUpdateNotificationReading()');

        try {
            const response = await axios.put('http://localhost:3001/friend/updateNotificationRead', {
                fromId: fromId,
            });
            console.log('axiosUpdateNotificationReading success', response.data);
            
        } catch (error) {
            console.log('axiosUpdateNotificationReading error')
        }
    }
    
    return (
        <>
        <div className="notificationContainer">
            <IoMdNotificationsOutline 
                size="30px"
                onClick={notificationClickHandler}
                className="notificationIcon"
            />
            {newNotification &&  (
                <div className="notificationBadge"></div>
            )}
            {isAlarmShow && (
                <div className="reqNotifications" >
                   {notifications.length > 0 || savedNotifications.length > 0 ? (
                        <>
                            {notifications.map((notification, index) => (
                                <div key={index} className="notification" onClick={socketNotificationClickHandler}>
                                    {notification}님이 친구요청을 보냈습니다.
                                </div>
                            ))}
                            {savedNotifications.map((savedNotification, index) => (
                                <div key={index} className="notification" onClick={() =>notificationContentClickHandler(savedNotification.FROM_USER)}>
                                    {savedNotification.FROM_USER_NICKNAME}님이 친구요청을 보냈습니다.
                                </div>
                            ))}
                        </>
                    ) : (
                        <div>새로운 알림이 없습니다.</div>
                    )}
                </div>
            )}
        </div>
        </>
    );
}

export default SocketAlarm;