import { useEffect, useState, useRef } from "react";
import Message from "./Message";
import fetchServer from "./fetchServer";
import '../css/ChatDisplay.css';
import { IoMdSend } from "react-icons/io";
import ChatDescribe from "./ChatDescribe";
import ChatDetails from './ChatDetails';

function ChatDisplay({chat, group, addToDisplay, sendMessage, display, setAllMessages,
     updateMessage, deleteMessage, deleteMassageToEveryone, userId, setUsersGroup}) {
    const [text, setText] = useState('');
    const [shift, setShift] = useState(false);
    const [fullDesc, setFullDesc] = useState(false);
    const [indexNew, setIndexNew] = useState(-1);
    const [scroll, setScroll] = useState(0);
    const [onBottom, setOnBottom] = useState(false);
    const ref = useRef(null);
    const refNewMsg = useRef(null);

    const scrollToLastMessage = () => {
        const lastChildElement = ref.current?.lastElementChild;
        lastChildElement?.scrollIntoView(/* { behavior: 'smooth' } */);
    };

    const getNextMessages = () => {
        fetchServer(`/messages?chatId=${chat.id}&reverse=true&limit=20&offset=${chat.messages.length}`,
        (result, error, status) => {
            if(error) {
                alert(`שגיאה${status}: טעינת המשך הודעות הצ'אט נכשלה`);
            } else {
                display(result.reverse().concat(chat.messages));
                if(result.length < 20) {
                    setAllMessages(true);
                }
            }
        })
    }

    const readMessages = (stayState, prevIndex) => {
        fetchServer(`/chats/${chat.id}/read`,
        (result, error, status) => {
            if(error) {
                alert(`שגיאה${status}: סימון הודעות הצ'אט כנקראו נכשל`);
            } else {
                display(chat.messages.map(m => ({...m, is_read: true})));
                if(stayState) {
                    setIndexNew(prevIndex);
                }
            }
        }, 'PUT');
    }

    const getUsersGroup = () => {
        fetchServer(`/groups/${group.id}/users`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat}: טעינת משתמשי הקבוצה נכשלה`);
            } else {
                setUsersGroup(group.id, res);
            }
        });
    }

    useEffect(() => {
        if(chat?.groupId && group && !group.users) {
            console.log('get users group');
            getUsersGroup();
        }
    }, [chat?.groupId, group]);

    useEffect(() => {
        const index = chat?.messages?.findIndex(m => !m.is_read);
        setIndexNew(index);
        if( index > -1) {
            setOnBottom(false);
            refNewMsg?.current?.scrollIntoView();
            readMessages(true, index);
        } else {
            setOnBottom(true);
            scrollToLastMessage();
        }
    }, [chat?.id]);

    useEffect(() => {
        if(chat && chat.messages.length < 20 && !chat.allMessages) {
            getNextMessages();
        }
    }, [chat]);

    useEffect(() => {
        if(chat) {
            const index = chat.messages.findIndex(m => !m.is_read);
            setIndexNew(index);
            if(index > -1) {
                if(onBottom) {
                    readMessages();
                } else {
                    readMessages(true, index);
                }
            }
            if(onBottom) {
                scrollToLastMessage();
            } else {
                ref?.current?.scrollTo({top: ref.current.scrollHeight - scroll});
            }
        }
    }, [chat?.messages?.length]);


    const handleScroll = (e) => {
        setScroll(e.currentTarget.scrollHeight - e.currentTarget.scrollTop);
        if(e.currentTarget.scrollHeight === e.currentTarget.scrollTop) {
            setOnBottom(true);
        } else {
            setOnBottom(false);
        }
        if(chat && chat.messages.length > 0 && !chat.allMessages && e.currentTarget.scrollTop === 0) {
            getNextMessages();
        }
    }

    const addMessage = () => {
        const text_ = text.trim();
        setIndexNew(-1);
        if(text_ !== '') {
            const {groupId, partnerId} = chat;
            let body = {text_, senderId: userId, chatId: chat.id};
            if(partnerId) body = {...body, partnerId};
            else body = {...body, groupId};
            fetchServer('/messages', (result, error, status) => {
                if(error) {
                    alert(`שגיאה${status}: הוספת ההודעה נכשלה`);
                } else {
                    sendMessage({text_, senderId: userId, id: result.id, groupId: chat.groupId});
                    addToDisplay({...body, id: result.id, is_read: true});  
                }
            }, 'POST', JSON.stringify(body), { 'Content-Type': 'application/json'})
            setText('');
        }
    }

    const deleteMessageForAll = (messageId) => {
        updateMessage(messageId, {deleted: true, text_: ''});
        deleteMassageToEveryone(messageId);
    }

    const handleKeyUp = ({key}) => {
        if(!shift && key === 'Enter') {
            if(text !== '\n') {
                addMessage();
            } else {
                setText('');
            }
        } else if(key === 'Shift') {
            setShift(false)
        }
    }

    const handleKeyDown = ({key}) => {
        if(key === 'Shift') {
            setShift(true);
        }
    }

    const mapMessagesToElements = (messages) => {
        return messages.map(message => <Message
            key={message.id}
            id={message.id}
            chatId={chat.id}
            text={message.text_}
            senderName={chat?.groupId&&group?.users?.find(u => u.id === message.senderId)?.fullname}
            senderId={message.senderId}
            groupId={chat.groupId}
            my={message.senderId===userId}
            read={message.is_read}
            deleted={message.deleted}
            deleteMessage={() => deleteMessageForAll(message.id)}
            deleteMessageFromChat={() => deleteMessage(message.id)} />);
    }


    return (
        <div className="chat-display">
            {!fullDesc ? (<div className={"chat-display"+(chat?'': ' unvisible')} >
                <ChatDescribe chat={chat} setFullDesc={() => setFullDesc(true)} />
                <div className="chat-messages" ref={ref} onScroll={handleScroll}>
                    {chat&&(indexNew > -1? mapMessagesToElements(chat.messages.slice(0, indexNew))
                        : mapMessagesToElements(chat.messages))}
                    {indexNew > -1? (<>
                        <div className="new-messages" ref={refNewMsg}>{chat&&(chat.messages.length - indexNew)} הודעות חדשות</div>
                        {chat&&mapMessagesToElements(chat.messages.slice(indexNew))}
                    </>) : <></>}
                </div>
                <div className="text-line">
                    <textarea value={text} onChange={({target}) => setText(target.value)}
                    onKeyUp={handleKeyUp}
                    onKeyDown={handleKeyDown} />
                    <IoMdSend className="send" onClick={addMessage}/>
                </div>
            </div>) : (<>{chat ? (<ChatDetails chat={chat}
            goBack={() => setFullDesc(false)} users={group&&group.users} />) : <></>}</>)}
        </div>
        
    )
}
export default ChatDisplay;