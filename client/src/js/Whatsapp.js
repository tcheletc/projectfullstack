import { useCallback, useEffect, useMemo, useState } from 'react';
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
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [playing, setPlaying] = useAudio('http://novastar-main.co.hays.tx.us/NovaStar5/sounds/newmessage.wav');

    useEffect(() => {
        return () => {
            socket.emit('leave_room', user.id);
            groups.forEach(group =>socket.emit('leave_room', `group${group.id}`));
        }
    }, []);
    
    const addMessageToChat = (message, chatId) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, messages: chat.messages.some(m => m.id === message.id)? chat.messages
                : chat.messages.concat([message])}: chat));
    }

    const addChat = (chat) => {
        setChats(chats => chats.concat([chat]));
    }

    const deleteChat = (chatId) => {
        setChats(chats => chats.filter(chat => chat.id !== chatId));
    }

    const leaveGroup = (groupId) => {
        socket.emit('leave_room', `group${groupId}`);
        setChats(chats => chats.filter(chat => chat?.groupId !== groupId));
        setGroups(groups => groups.filter(group => group.id !== groupId));
    }

    const removeUserFromGroup = (groupId, userId) => {
        setGroups(groups => groups.map(group => group.id === groupId ? 
            {...group, users: group.users?.filter(u => u.id !== userId)} : group));
    }

    const addUserToGroup = (groupId, user) => {
        setGroups(groups => groups.map(group => group.id === groupId ? 
            {...group, users: group.users.concat(user)} : group));
    }

    const changeAdminUserInGroup = (groupId, userId) => {
        setGroups(groups => groups.map(group => group.id === groupId?
            {...group, users: group.users.map(user => user.id === userId ? 
                {...user, is_admin: !user.is_admin}: user)} : group));
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
            const group = groups.find(g => g.id === chat?.groupId);
            setChats(prevChats => [...prevChats, {...chat, name_: group.name_}]);
        }
    }, []);

    const addChatGroup = (group) => {
        const chat = {userId: user.id, groupId: group.id};
        fetchServer(`/chats`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat}: הוספת הצ'אט לקבוצה נכשלה`);
            } else {
                addChat({...chat, name_: group.name_, id: res.id, messages: []});
            }
        }, 'POST', 
        JSON.stringify(chat), { 'Content-Type': 'application/json'});
    }

    const getChatGroup = (group) => {
        fetchServer(`/chats?userId=${user.id}&groupId=${group.id}&limit=1`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat}: טעינת הצ''אט של הקבוצה ${group.id} נכשלה`);
            } else {
                addChat({...res, name_: group.name_, messages: []});
            }
        })
    }

    const setChatPartner = (partnerId, message) => {
        fetchServer(`/chats?userId=${user.id}&partnerId=${partnerId}&limit=1`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat}: טעינת הצ''אט של השותף ${partnerId} נכשלה`);
            } else {
                fetchServer(`/users/${partnerId}`, (result, error, status) => {
                    if(error) {
                        alert(`שגיאה${stat}: טעינת פרטי השותף של הצ'אט ${partnerId} נכשלה`);
                    } else {
                        const {username, fullname, email, phone} = result
                        addChat({...res, username, fullname, email
                            ,phone , messages: [{...message, chatId: res.id}]});
                    }
                });
            }
        })
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
        return () => {
            socket.emit('leave_room', user.id);
            groups.forEach(group =>socket.emit('leave_room', `group${group.id}`));
        }
    }, [username, navigate, socket]);

    useEffect(() => {
        socket.on('receive_message', message => {
            if(playing) {
                setPlaying(false)
            }
            setPlaying(true);
            if(!message.groupId) {
                let chat = chats.find(chat => chat.partnerId === message.senderId);
                if(chat) {
                    if(!chat.messages.some(m => m.id === message.id)) {
                        addMessageToChat({...message, chatId: chat.id}, chat.id);
                    }
                } else {
                    setChatPartner(message.senderId, message);
                }
            } else {
                let chat = chats.find(chat => chat.groupId === message.groupId);
                if(chat) {
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
            getChatGroup(group);
        })

        socket.on('left_group', (groupId, userId) => {
            if(userId === user.id) {
                leaveGroup(groupId);
            } else {
                removeUserFromGroup(groupId, userId);
            }
        });

        socket.on('changed_admin', (groupId, userId) => {
            changeAdminUserInGroup(groupId, userId);
        });

        socket.on('added_user', (groupId, user) => {
            addUserToGroup(groupId, user);
        })

        return () => {
            socket.removeAllListeners();
        }

    }, [chats, groups, socket, setChatPartner]);


    const deleteMessageFromChat = (chatId, messageId) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, messages: chat.messages.filter(message => message.id !== messageId)}: chat));
    }

    const setAllMessagesInChat  = (allMessages, chatId) => {
        setChats(chats => chats.map(chat => chat.id === chatId? 
            {...chat, allMessages}: chat));
    }

    const setUsersGroup = (groupId, users) => {
        setGroups(prevGroups => prevGroups.map(group => 
            group.id === groupId ? {...group, users} : group));
    }

    const sendMessageFromUser = (message) => {
        let chat = chats.find(chat => chat.id === selectedChatId)
        let room = chat.partnerId||`group${chat.groupId}`
        socket.emit('send_message', message, room);
    }

    const sendLeaveGroup = (groupId, userId) => {
        socket.emit('leave_group', groupId, userId);
    }

    const sendChangeAdmin = (groupId, userId) => {
        socket.emit('change_admin', groupId, userId);
    }

    const sendAddUser = (group, user) => {
        socket.emit('add_user', group, user);
    }

    const deleteMassageToEveryone = (messageId) => {
        let chat = chats.find(chat => chat.id === selectedChatId)
        let room = chat.partnerId||`group${chat.groupId}`;
        socket.emit('delete_message', {id: messageId, senderId: user.id, groupId: chat.groupId}, room);
    }

    const addGroup = (group) => {
        setGroups(prevGroups => prevGroups.concat([group]));
        socket.emit('add_group', group, group.users.filter(u => u.id !== user.id));
        socket.emit('join_room', `group${group.id}`);
        addChatGroup(group);
    }

    useEffect(() => {
        if(selectedChatId) {
            let chat = chats.find(chat => chat.id === selectedChatId);
            if(chat?.groupId) {
                setSelectedGroup(groups.find(group => group.id === chat.groupId));
            } else {
                setSelectedGroup(null);
            }
        }
    }, [selectedChatId, groups, chats]);

    return (
        <div className='whatsapp'>
            <NavChats user={user}
             chats={chats} 
             selectedChatId={selectedChatId}
             selectChat={setSelectedChatId}
             addToDisplay={addChat}
             deleteFromDisplay={deleteChat}
             deleteMessagesFromDisplay={(chatId) => setMessagesInChat([], chatId)}
             displayGroup={addGroup}
             updateProfile={setUser} />
            <ChatDisplay chat={selectedChatId&&chats.find(chat => chat.id === selectedChatId)}
            group={selectedGroup}
            userId={user.id}
            addToDisplay={(message) => addMessageToChat(message, selectedChatId)}
            display={(messages) => setMessagesInChat(messages, selectedChatId)}
            setAllMessages={(allMessages) => setAllMessagesInChat(allMessages, selectedChatId)}
            updateMessage={(messageId, props) => changeMessageInChat(messageId, selectedChatId, props)}
            sendMessage={sendMessageFromUser}
            setUsersGroup={setUsersGroup}
            displayAddUserToGroup={(group, user) => {sendAddUser(group, user); addUserToGroup(group.id, user)}}
            displayRemoveUserFromGroup={(groupId, userId) => {sendLeaveGroup(groupId, userId); removeUserFromGroup(groupId, userId)}}
            displayChangeAdminUserInGroup={(groupId, userId) => {sendChangeAdmin(groupId, userId); changeAdminUserInGroup(groupId, userId)}}
            displayLeaveGroup={(groupId) => {sendLeaveGroup(groupId, user.id); leaveGroup(groupId)}}
            deleteMassageToEveryone={deleteMassageToEveryone}
            deleteMessage={(messageId) => deleteMessageFromChat(selectedChatId, messageId)} />
        </div>
    );
}
export default Whatsapp;