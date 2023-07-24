import profileImage from '../images/profile.png';
import groupImage from '../images/group.png';

import '../css/ChatDetails.css';
import {BiArrowBack} from 'react-icons/bi';

function ChatDetails({chat, goBack}) {
    return (
        <div className="chat-details">
            <BiArrowBack className='back-icon' onClick={goBack} />
            <div className='details-chat' >
                <h3>{chat.fullname || chat.name_}</h3>
                {!chat.groupId ? <img src={profileImage} alt="תמונת פרופיל" /> :
                <img src={groupImage} alt="תמונת קבוצה" />}
                {chat.groupId ? <></> :
                <>
                <p><strong>שם משתמש:</strong> {chat.username}</p>
                <p><strong>דוא"ל:</strong> {chat.email}</p>
                <p><strong>מספר טלפון:</strong> {chat.phone}</p>
                </>}
            </div>
        </div>
    );
}
export default ChatDetails;