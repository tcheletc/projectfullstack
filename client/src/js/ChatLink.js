import { useEffect, useState } from "react";
import '../css/ChatLink.css';
import fetchServer from "./fetchServer";
import { MdDelete, MdGroup, MdPerson } from 'react-icons/md';

function ChatLink({chat, selected, selectChat, deleteFromDisplay, deleteMessagesFromDisplay}) {
    const [name, setName] = useState('');

    useEffect (() => {
        let name_ = name;
        if(chat.partnerId && chat.fullname) {
            name_ = chat.fullname;
        } else if(chat.name_) {
            name_ = chat.name_;
        }
        if(name_&&name_.length > 20) {
            name_ = name_.slice(0, 17) + '...';
        }
        setName(name_);
    }, [chat?.fullname, chat?.name_]);

    const deleteChat = () => {
        let deleted = "הצ'אט";
        if(chat.groupId) {
            deleted = "כל ההודעות בקבוצה"
        }
        const ok = window.confirm(`האם אתם בטוחים שאתם רוצים למחוק את ${deleted}?`);
        if(chat.groupId) {
            deleted = "/messages";
        } else {
            deleted = "";
        }
        if(ok) {
            fetchServer(`/chats/${chat.id}${deleted}`, (result, error, status) => {
                if(error) {
                    if(status === 404) {
                        alert("הצ'אט לא קיים במערכת")
                    } else
                    alert(`שגיאה${status||''}: מחיקת הצ'אט נכשלה`);
                } else {
                    if(chat.groupId) {
                        deleteMessagesFromDisplay();
                    } else {
                        deleteFromDisplay();
                    }
                }
            }, 'DELETE')
        }
    }
    const newMessages = chat.messages.filter(m => !m.is_read).length;

    return (
        <div className={"chat-link" + (selected?' selected': '')} onClick={selectChat}>
            {chat?.groupId? <MdGroup className='chat-icon' /> : <MdPerson className='chat-icon' />}
            <div className="name">{name}</div>
            {newMessages > 0? <div className="num-new-messages">{newMessages}</div>: <></>}
            <MdDelete className="icon" onClick={deleteChat} />
        </div>
    );
}
export default ChatLink;