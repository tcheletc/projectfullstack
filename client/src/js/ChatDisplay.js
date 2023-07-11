import { useEffect, useState } from "react";
import Message from "./Message";
import fetchServer from "./fetchServer";

function ChatDisplay({chat, addToDisplay, sendMessage, display, userId}) {
    const [text, setText] = useState('');
    useEffect(() => {
        console.log(chat);
        if(chat && chat.messages.length === 0) {
            fetchServer(`/messages?chatId=${chat.id}&reverse=true&limit=20`, (result, error, status) => {
                if(error) {
                    alert(`שגיאה${status}: טעינת הודעות הצ'אט נכשלה`);
                } else {
                    display(result);
                }
            })
        }
    }, [chat]);

    const addChat = () => {
        const body = {text_ : text, senderId: userId, chatId: chat.id, is_read: true};
        fetchServer('/messages', (result, error, status) => {
            if(error) {
                alert(`שגיאה${status}: הוספת ההודעה נכשלה`);
            } else {
                addToDisplay({...body, id: result.id});
                sendMessage({text_ : text, senderId: userId, id: result.id});
            }
        }, 'POST', JSON.stringify(body), { 'Content-Type': 'application/json'})
    }
    return (
        <div className="chat-display">
            <div style={{display: chat? 'block': 'none'}}>
                {chat&&chat.messages.map(message => <Message
                    key={message.id}
                    text={message.text_}
                    senderId={message.senderId}
                    read={message.is_read} />)}
                <textarea value={text} onChange={({target}) => setText(target.value)} />
                <button onClick={addChat}>שלח הודעה</button>
            </div>
        </div>
        
    )
}
export default ChatDisplay;