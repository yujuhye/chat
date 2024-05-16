// 자주 사용하는 함수 빼놓기
import axios from 'axios';

export const fetchUser = async () => {
    try {
        const response = await axios({
            url: `http://localhost:3001/chatRoom/getUserInfo`, 
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.data) {
            return response.data; // 사용자 정보 반환
        } else {
            alert('[FriendListModal] user 정보를 불러오는 데 실패했습니다.');
            return null;
        }
    } catch (error) {
        alert(`[FriendListModal] fetchUser Error: ${error.message}`);
        return null;
    }
};

