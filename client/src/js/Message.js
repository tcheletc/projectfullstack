import { useState } from 'react';
import '../css/Message.css';
import { RiArrowDropDownLine, RiForbid2Line } from 'react-icons/ri';
import { AiOutlineStop } from 'react-icons/ai'
import fetchServer from './fetchServer'

function Message({id, text, deleted, my, senderName, groupId, chatId, deleteMessage, deleteMessageFromChat}) {
    const [shown, setShown] = useState(false);
    const handleClickMenu = () => setShown(shown => !shown);

    const deleteFromChat = () => {
        fetchServer(`/chats/${chatId}/messages/${id}`, (result, error, status) => {
            if(error) {
                if(status === 404) alert("ההודעה לא נמצאה בצ'אט");
                else alert(`שגיאה${status||''}: מחיקת ההודעה מהצ'אט נכשלה`);
            } else {
                deleteMessageFromChat();
            }
        }, 'DELETE');
    }

    const deleteForAll = () => {
        fetchServer(`/messages/${id}`, (result, error, status) => {
            if(error) {
                if(status === 404) alert("ההודעה לא נמצאה");
                else alert(`שגיאה${status||''}: מחיקת ההודעה מהצ'אט נכשלה`);
            } else {
                deleteMessage();
            }
        }, 'DELETE');
    }


    return (
        <div className={"message" + (my? ' my': '')}>
            <h3 className={(my||!groupId)?'unvisible':undefined}>{senderName}</h3>
            <div className={deleted? 'unvisible' : undefined}>
                <div className={"dropdown"+(!my? ' unvisible': '')}>
                    <RiArrowDropDownLine className="dropbtn" onClick={handleClickMenu} />
                    <div className={"dropdown-content"+(shown?' shown':'')}>
                        <div onClick={deleteFromChat}>מחיקה מהצ'אט</div>
                        <div onClick={deleteForAll}>מחיקה אצל כולם</div>
                    </div>
                </div>
                {text.split('\n').map((line,index) => <span key={index}>{line}<br /></span>)}
            </div>
            <div className={!deleted? 'unvisible' : 'deleted'}>
                <AiOutlineStop />
                ההודעה נמחקה
            </div>
        </div>
    );
}
export default Message;