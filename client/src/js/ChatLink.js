import { useEffect, useState } from "react";
import '../css/ChatLink.css';
import fetchServer from "./fetchServer";
import {MdDelete} from 'react-icons/md'

function ChatLink({chat, selected, selectChat, deleteFromDisplay}) {
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
    }, [chat?.fullname, chat?.name]);

    const deleteChat = () => {
        const ok = window.confirm("האם אתם בטוחים שאתם רוצים למחוק את הצ'אט?");
        if(ok) {
            fetchServer(`/chats/${chat.id}`, (result, error, status) => {
                if(error) {
                    if(status === 404) {
                        alert("הצ'אט לא קיים במערכת")
                    } else
                    alert(`שגיאה${status||''}: מחיקת הצ'אט נכשלה`);
                } else {
                    deleteFromDisplay();
                }
            }, 'DELETE')
        }
    }
    const newMessages = chat.messages.filter(m => !m.is_read).length;

    return (
        <div className={"chat-link" + (selected?' selected': '')} onClick={selectChat}>
            <div className="name">{name}</div>
            {newMessages > 0? <div className="num-new-messages">{newMessages}</div>: <></>}
            <MdDelete className="icon" onClick={deleteChat} />
        </div>
    );
}
export default ChatLink;