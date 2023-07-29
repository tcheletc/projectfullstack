import ChatLink from "./ChatLink";
import fetchServer from "./fetchServer";
import '../css/NavChats.css'
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { TfiMenu } from 'react-icons/tfi';
import { MdPerson, MdGroupAdd } from 'react-icons/md';
import { FiLogOut } from 'react-icons/fi';
import Profile from './Profile';
import AddGroup from "./AddGroup";

function NavChats({user, chats, selectedChatId, addToDisplay, selectChat,
     deleteFromDisplay, updateProfile, displayGroup}) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('navbar');

    const addChat = () => {
        if(chats.some(chat => chat.username === username)) {
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
                const body = {userId: user.id, partnerId};
                fetchServer('/chats', (result, error, status) => {
                    if(error) {
                        alert(`שגיאה${status||''}: הוספת צ'אט נכשלה`);
                    } else {
                        addToDisplay({...body, id: result.id, groupId: null,
                            fullname, username, email, phone, messages: []});
                    }
                }, 'POST', JSON.stringify(body), { 'Content-Type': 'application/json'});
            }
        })}
    }

    const handleKeyUp = ({key}) => {
        if(key === 'Enter') {
            addChat();
        }
    }

    const showNav = () => {
        setOpen(open => !open);
    }

    const logout = () => {
        sessionStorage.removeItem('user');
        navigate('/login');
    }

    return (
        <div className={"background-menu"+(open? ' open': '')}>
            <TfiMenu className="menu-icon" onClick={showNav} />
            { content === 'navbar' ?
            (<nav className="nav-chats">
                <div className="navbar">
                    <MdPerson className="icon" onClick={() => setContent('profile')} title="הפרופיל שלי" />
                    <MdGroupAdd className="icon" onClick={() => setContent('group')} title="הוספת קבוצה" />
                    <FiLogOut className="loguot-icon" title="התנתקות" onClick={logout} />
                </div>
                <div className="search">
                    <div className="input-search">
                        <input value={username} 
                            onChange={({target}) => setUsername(target.value)} 
                            placeholder={"חיפוש או התחלת צ'אט חדש עפ\"י שם משתמש"}
                            onKeyUp={handleKeyUp} />
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
            </nav>) : content === 'profile' ?
            <Profile user={user} goBack={() => setContent('navbar')} updateProfile={updateProfile} /> :
            <AddGroup goBack={() => setContent('navbar')} userId={user.id} username={user.username}
            displayGroup={displayGroup} user={user} />}
        </div>
    );

}
export default NavChats;