import React from "react";

const ChatTitleNameModModal = ({ selectedRoomNo, userNo, chatTitleName, modifyChatTitleName, modifyChatTitleNameClickHandler }) => {

    return(
        <>
            <div className="chatTitleMod">
                <form name="chatNameModForm">
                    <input type="text" name="room_no" value={selectedRoomNo} />
                    <input type="text" name="user_no" value={userNo} />
                    <input type="text" name="parti_customzing_name" value={chatTitleName} onChange={(e) => modifyChatTitleName(e)} />
                    <input type="button" onClick={() => modifyChatTitleNameClickHandler(selectedRoomNo, userNo, chatTitleName)} value="MODIFY"/>
                </form>
            </div>
        </>
    );

}

export default ChatTitleNameModModal;