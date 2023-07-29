import { useState, useEffect } from 'react';
import { MdGroup, MdPerson } from 'react-icons/md';
import { FiLogOut } from 'react-icons/fi';
import fetchServer from './fetchServer';
import '../css/ChatDescribe.css';

function ChatDescribe({chat, setFullDesc, userId, deleteFromDisplay}) {
    const [name, setName] = useState('');

    useEffect (() => {
        let name_ = name;
        if(chat) {
            if(chat.partnerId && chat.fullname) {
                name_ = chat.fullname;
            } else if(chat.name_) {
                name_ = chat.name_;
            }
        }
        if(name_&&name_.length > 20) {
            name_ = name_.slice(0, 17) + '...';
        }
        setName(name_);
    }, [chat]);

    const leaveGroup = () => {
        const ok = window.confirm("האם אתם בטוחים שאתם רוצים לצאת מהקבוצה (ובכך למחוק גם את כל הצ'אט שלה)?");
        if(ok) {
            fetchServer(`/groups/${chat?.groupId}/users/${userId}`, (result, error, status) => {
                if(error) {
                    if(status === 404) {
                        alert("אינך נמצא בקבוצה זו במערכת")
                    } else
                    alert(`שגיאה${status||''}: היציאה מהקבוצה נכשלה`);
                } else {
                    deleteFromDisplay();
                }
            }, 'DELETE');
        }
    }

    return (
        <div className="chat-desc">
            {chat&&chat.groupId? <MdGroup className='chat-icon' /> : <MdPerson className='chat-icon' />}
            <span onClick={setFullDesc}>{name}</span>
            {chat?.groupId?
            <FiLogOut className="leave-icon" title="יציאה מהקבוצה" onClick={leaveGroup} />:<></>}
        </div>
    );
}
export default ChatDescribe;