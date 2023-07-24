import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import io from 'socket.io-client'
import fetchServer from './fetchServer';
import NavChats from './NavChats';
import ChatDisplay from './ChatDisplay';
import '../css/Whatsapp.css'
import useAudio from './useAudio';
const socket = io.connect('http://localhost:4000');

function Whatsapp() {
    const { username } = useParams();
    const navigate = useNavigate(); // Access the navigate function
    const [user, setUser] = useState({});
    const [groups, setGroups] = useState([]);
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [playing, setPlaying] = useAudio('http://novastar-main.co.hays.tx.us/NovaStar5/sounds/newmessage.wav');

    const addMessageToChat = (message, chatId) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, messages: chat.messages.concat([message])}: chat));
    }

    const addChat = (chat) => {
        setChats(chats => chats.concat([chat]));
    }

    const changeMessageInChat = (messageId, chatId, props) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, 
                messages: chat.messages.map(message => message.id === messageId? 
                    {...message, ...props}: message)} : chat));
    }

    useEffect(() => {
        const userString = sessionStorage.getItem("user");
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
                setChats(result.map(chat => { return {...chat, messages: [], allMessages: false}
                }));
                console.log(result);
                result.forEach(chat => {
                    if(chat.partnerId) {
                        fetchServer(`/users/${chat.partnerId}`, (result, error, status) => {
                            if(error) {
                                alert(`שגיאה${status||''}: הבאת מידע על השותף של הצ'אט ${chat.id} נכשלה`);
                            } else {
                                const {fullname, username, email, phone} = result;
                                setChats(chats =>(chats.map(c => c.id === chat.id? 
                                    {...c, fullname, username, email, phone}: c)));
                            }
                        });
                    }
                })
            }
        });
        socket.emit('join_room', user.id);
        socket.on('receive_message', message => {
            //TO-DO: add code for other options
            if(playing) {
                setPlaying(false)
            }
            setPlaying(true);
            if(!message.groupId) {
                if(chats.some(chat => chat.partnerId === message.senderId)) {
                    let chat = chats.find(chat => chat.partnerId === message.senderId);
                    console.log(message, chat);
                    addMessageToChat({...message, chatId: chat.id}, chat.id);
                }
            }
        });

        socket.on('del_message', message => {
            let chat;
            console.log('delete:', message)
            if(!message.groupId) {
                chat = chats.find(c => c.partnerId === message.senderId);
                console.log(chat);
            } else {
                chat = chats.find(c => c.groupId === message.groupId);
            }
            if(chat) {
                changeMessageInChat(message.id, chat.id, {deleted: true, text_: 'deleted'});
            }
        });
    }, [username, navigate]);

    const deleteChat = (chatId) => {
        setChats(chats => chats.filter(chat => chat.id !== chatId));
    }
    
    const setMessagesInChat = (messages, chatId) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, messages}: chat));
    }

    const deleteMessageFromChat = (chatId, messageId) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, messages: chat.messages.filter(message => message.id !== messageId)}: chat));
    }

    const setAllMessagesInChat  = (allMessages, chatId) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, allMessages}: chat));
    }

    const sendMessageFromUser = (message) => {
        let chat = chats.find(chat => chat.id === selectedChatId)
        let room = chat.partnerId||`group${chat.groupId}`
        socket.emit('send_message', message, room);
    }

    const deleteMassageToEveryone = (messageId) => {
        let chat = chats.find(chat => chat.id === selectedChatId)
        let room = chat.partnerId||`group${chat.groupId}`;
        socket.emit('delete_message', {id: messageId, senderId: user.id, groupId: chat.groupId}, room);
    }


    return (
        <div className='whatsapp'>
            <NavChats user={user}
             chats={chats} 
             selectedChatId={selectedChatId}
             selectChat={setSelectedChatId}
             addToDisplay={addChat}
             deleteFromDisplay={deleteChat}
             updateProfile={setUser} />
            <ChatDisplay chat={selectedChatId&&chats.find(chat => chat.id === selectedChatId)}
            userId={user.id}
            addToDisplay={(message) => addMessageToChat(message, selectedChatId)}
            display={(messages) => setMessagesInChat(messages, selectedChatId)}
            setAllMessages={(allMessages) => setAllMessagesInChat(allMessages, selectedChatId)}
            updateMessage={(messageId, props) => changeMessageInChat(messageId, selectedChatId, props)}
            sendMessage={sendMessageFromUser}
            deleteMassageToEveryone={deleteMassageToEveryone}
            deleteMessage={(messageId) => deleteMessageFromChat(selectedChatId, messageId)} />
        </div>
    );
}
export default Whatsapp;