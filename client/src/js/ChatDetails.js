import profileImage from '../images/profile.png';
import groupImage from '../images/group.png';
import MemberGroup from './MemberGroup';

import '../css/ChatDetails.css';
import {BiArrowBack} from 'react-icons/bi';
import { BsPersonPlusFill } from 'react-icons/bs';
import { useMemo, useState } from 'react';

function ChatDetails({chat, goBack, users, userId}) {
    const admin = useMemo(() => users?.find(u => u.id === userId)?.is_admin, [users, userId]);
    const [username, setUserName] = useState('');
    const handleAddClick = (e) => {
        e.preventDefault();
        //add user with username to the group
    }
    return (
        <div className="chat-details">
            <BiArrowBack className='back-icon' onClick={goBack} />
            <div className='details-chat' >
                <h3>{chat.fullname || chat.name_}</h3>
                {!chat.groupId ? <img src={profileImage} alt="תמונת פרופיל" /> :
                <img src={groupImage} alt="תמונת קבוצה" />}
                {chat.groupId ? <>
                    <h4>חברי הקבוצה</h4>
                    <div className='group-members'>
                    {users.map(u => <MemberGroup key={u.id} user={u} me={u.id === userId} admin={admin} />)}
                    {admin? <form onSubmit={handleAddClick}>
                        <input value={username} 
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder='שם משתמש' required />
                        <button type='submit'>
                            <BsPersonPlusFill className="icon" title='הוספת משתמש לקבוצה' />
                        </button>
                    </form> : <></>}
                    </div>
                </> :
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