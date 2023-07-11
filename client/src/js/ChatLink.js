import { useEffect, useState } from "react";
import '../css/ChatLink.css';
import fetchServer from "./fetchServer";

function ChatLink({chat, selected, selectChat, deleteFromDisplay}) {
    const [name, setName] = useState('');

    useEffect (() => {
        let name_ = name;
        if(chat.partnerId && chat.fullname) {
            name_ = chat.fullname;
        } else if(chat.name_) {
            name_ = chat.name_;
        }
        if(name&&name.length > 40) {
            name_ = name.slice(0, 47) + '...';
        }
        setName(name_);
    }, [chat]);

    const deleteChat = () => {
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

    return (
        <div className={"chat-link" + (selected?' selected': '')} onClick={selectChat}>
            <span>{name}</span>
            <button onClick={deleteChat}>מחיקה</button>
        </div>
    );
}
export default ChatLink;