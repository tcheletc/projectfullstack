import { useCallback, useEffect, useState } from 'react';
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

    const setMessagesInChat = (messages, chatId) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, messages}: chat));
    }

    const getChatMessages = useCallback((chat, groups, callback) => {
        fetchServer(`/messages?chatId=${chat.id}&is_read=false`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat}: טעינת הודעות הצ'אט ${chat.id} שלא נקראו נכשלה`);
            } else {
                callback({...chat, messages: res, allMessages: false}, groups);
            }
        })
    }, []);

    const getChatInfo = useCallback((chat, groups) => {
        if(chat.partnerId) {
            fetchServer(`/users/${chat.partnerId}`, (result, error, status) => {
                if(error) {
                    alert(`שגיאה${status||''}: הבאת מידע על השותף של הצ'אט ${chat.id} נכשלה`);
                } else {
                    const {fullname, username, email, phone} = result;
                    setChats(prevChats => [...prevChats, {...chat, fullname, username, email, phone}]);
                }
            });
        } else {
            const group = groups.find(g => g.id === chat.groupId);
            setChats(prevChats => [...prevChats, {...chat, name_: group.name_}]);
        }
    }, []);

    const addChatGroup = (groupId) => {
        const chat = {userId: user.id, groupId};
        fetchServer(`/chats`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat}: הוספת הצ'אט לקבוצה נכשלה`);
            } else {
                addChat({...chat, id: res.id, messages: []});
            }
        }, 'POST', 
        JSON.stringify(chat), { 'Content-Type': 'application/json'});
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
        setChats([]);

        fetchServer(`/groups?userId=${user.id}`, (result, error, status) => {
            if(error) {
                alert(`שגיאה${status}: הבאת קבוצות המשתמש נכשלה`);
            } else {
                setGroups(result);
                result.forEach(group =>socket.emit('join_room', `group${group.id}`));
                fetchServer(`/chats?userId=${user.id}`, (res, error, status) => {
                    if(error) {
                        alert(`שגיאה${status}: הבאת צ'אטים של המשתמש נכשלה`);
                    } else {
                        res.forEach(chat => getChatMessages(chat, result, getChatInfo));
                    }
                });
            }
        });

        socket.emit('join_room', user.id);
        socket.on('receive_message', message => {
            //TO-DO: add code for other options
            if(playing) {
                setPlaying(false)
            }
            setPlaying(true);
            if(message.partnerId) {
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

        socket.on('join_group', group => {
            setGroups(prevGroups => prevGroups.concat([group]));
            socket.emit('join_room', `group${group.id}`);
            addChatGroup(group.id);
        })
    }, [username, navigate]);

    const deleteChat = (chatId) => {
        setChats(chats => chats.filter(chat => chat.id !== chatId));
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

    const disconnectServer = () => {
        socket.emit('disconnct');
    }

    const addGroup = (group) => {
        setGroups(prevGroups => prevGroups.concat([group]));
        socket.emit('add_group', group, group.users.filter(u => u.id != user.id));
        socket.emit('join_room', `group${group.id}`);
        addChatGroup(group.id);
    }


    return (
        <div className='whatsapp'>
            <NavChats user={user}
             chats={chats} 
             selectedChatId={selectedChatId}
             selectChat={setSelectedChatId}
             addToDisplay={addChat}
             disconnectServer={disconnectServer}
             deleteFromDisplay={deleteChat}
             displayGroup={addGroup}
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