import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import io from 'socket.io-client'
import fetchServer from './fetchServer';
const socket = io.connect('http://localhost:4000');

function Whatsapp() {
    const { username } = useParams();
    const navigate = useNavigate(); // Access the navigate function
    const [user, setUser] = useState({});
    const [groups, setGroups] = useState([]);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const userString = localStorage.getItem("user");
        if(!userString) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userString));

        if(user.username !== username) {
            navigate(`/users/${user.username}`);
            return;
        }

        fetchServer(`/groups?userId=${user.id}`, (result, error, status) => {
            if(error) {
                alert(`שגיאה${status}: הבאת קבוצות המשתמש נכשלה`);
            } else {
                console.log(result);
                setGroups(result);
                result.forEach(group =>socket.emit('join_room', `group${group.id}`));
            }
        });

        fetchServer(`/chats?userId=${user.id}`, (result, error, status) => {
            if(error) {
                alert(`שגיאה${status}: הבאת צ'אטים של המשתמש נכשלה`);
            } else {
                setChats(result.map(chat => { return {...chat, messages: []}
                    // let newChat;
                    // fetchServer(`/messages?chatId=${chat.id}`, (result, error, status) => {
                    //     if(error) {
                    //         alert(`שגיאה${status}: הבאת הודעות של הצ'אט ${chat.id} נכשלה`);
                    //     } else {
                    //         newChat = {...chat, messages: result};
                    //     }
                    // });
                    // return newChat;
                }));
            }
        });
        socket.emit('join_room', user.id);
        socket.on('receive_message', message => {
            //TODO: change
            alert(message);
        });
    }, [username, navigate]);

    const addChat = () => {
        const partnerId = prompt('מספר מזהה השותף');
        const body = {userId: user.id, partnerId};
        fetchServer('/chats', (result, error, status) => {
            if(error) {
                alert(`שגיאה${status||''}: הוספת צ'אט נכשלה`);
            } else {
                console.log(result);
                setChats(chats => chats.concat([{...body, id: result.id, groupId: null, messages: []}]));
            }
        }, 'POST', JSON.stringify(body), { 'Content-Type': 'application/json'});
    }

    return (
        <div dir='rtl'>
            <h1 style={{textAlign: 'center'}}>{user.fullname}</h1>
            <div>{chats.map(chat => <h2 key={chat.id}>{chat.id}</h2>)}</div>
            <button onClick={addChat}>add chat</button>
        </div>
    );
}
export default Whatsapp;