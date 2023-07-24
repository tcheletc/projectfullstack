import { useState, useEffect } from 'react';
import { MdGroup, MdPerson } from 'react-icons/md';
import '../css/ChatDescribe.css';

function ChatDescribe({chat, setFullDesc}) {
    const [name, setName] = useState('');

    useEffect (() => {
        let name_ = name;
        if(chat) {
            if(chat.partnerId && chat.fullname) {
                name_ = chat.fullname;
            } else if(chat.name_) {
                name_ = chat.name_;
            }
        }
        if(name_&&name_.length > 20) {
            name_ = name_.slice(0, 17) + '...';
        }
        setName(name_);
    }, [chat]);

    return (
        <div className="chat-desc">
            {chat&&chat.groupId? <MdGroup className='icon' /> : <MdPerson className='icon' />}
            <span onClick={setFullDesc}>{name}</span>
        </div>
    );
}
export default ChatDescribe;