import React from "react";
import '../../css/common.css'

const ChatTitleNameModModal = ({ setIsShowChatTitleNameModModal, selectedRoomNo, userNo, chatTitleName, modifyChatTitleName, modifyChatTitleNameClickHandler }) => {

    const modifyChatTitleNameInputCloseBtnClickHandler = () => {
        console.log('modifyChatTitleNameInputCloseBtnClickHandler()');

        setIsShowChatTitleNameModModal(false);
    }

    return(
        <>
            <div className="chatTitleMod">
                <form name="chatNameModForm">
                    <input type="hidden" name="room_no" value={selectedRoomNo} />
                    <input type="hidden" name="user_no" value={userNo} />
                    <input className="chatTitleName" type="text" name="parti_customzing_name" value={chatTitleName} onChange={(e) => modifyChatTitleName(e)} />
                    <input className="chatTitleModBtn" type="button" onClick={() => modifyChatTitleNameClickHandler(selectedRoomNo, userNo, chatTitleName)} value="MODIFY"/>
                    <input className="chatTitleModalCloseBtn" type="button" onClick={() => modifyChatTitleNameInputCloseBtnClickHandler()} value="CLOSE"/>
                </form>
            </div>
        </>
    );

}

export default ChatTitleNameModModal;