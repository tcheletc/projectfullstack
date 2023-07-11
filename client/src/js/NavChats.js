import ChatLink from "./ChatLink";
import fetchServer from "./fetchServer";
import '../css/NavChats.css'
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

function NavChats({userId, chats, selectedChatId, addToDisplay, selectChat, deleteFromDisplay}) {
    const [username, setUsername] = useState('');
    const addChat = () => {
        if(chats.some(chat => chat.username === username)) {
            console.log(chats)
            let chat = chats.find(c => c.username === username);
            selectChat(chat.id);
        } else {
            fetchServer(`/users?username=${username}&limit=1`, (result, error, status) => {
            if(error) {
                if(status === 404) alert('המשתמש לא קיים במערכת');
                else alert(`שגיאה${status||''}: מציאת המשתמש נכשלה`);
            } else {
                const partnerId = result.id;
                const {fullname, username, email, phone} = result;
                const body = {userId, partnerId};
                fetchServer('/chats', (result, error, status) => {
                    if(error) {
                        alert(`שגיאה${status||''}: הוספת צ'אט נכשלה`);
                    } else {
                        console.log(result);
                        addToDisplay({...body, id: result.id, groupId: null,
                            fullname, username, email, phone, messages: []});
                    }
                }, 'POST', JSON.stringify(body), { 'Content-Type': 'application/json'});
            }
        })}
    }

    return (
        <nav className="nav-chats">
            <div className="search">
                <div className="input-search">
                    <input value={username} onChange={({target}) => setUsername(target.value)} placeholder="חיפוש או התחלת צ'אט חדש" />
                    <FaSearch onClick={addChat} />
                </div>
            </div>
            <div className="chat-links">
                {chats.map(chat => <ChatLink 
                key={chat.id} 
                chat={chat}
                deleteFromDisplay={() => deleteFromDisplay(chat.id)} 
                selected={selectedChatId===chat.id}
                selectChat={() => selectChat(chat.id)} />)}
            </div>
        </nav>
    );

}
export default NavChats;