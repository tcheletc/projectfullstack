import { useState } from 'react';
import '../css/Message.css';
import {RiArrowDropDownLine} from 'react-icons/ri'
function Message({text, my, senderName, groupId}) {
    const [shown, setShown] = useState(false);
    const handleClick = () => setShown(shown => !shown);
    return (
    <div className={"message" + (my? ' my': '')}>
        <h3 className={(my||!groupId)?'unvisible':undefined}>{senderName}</h3>
        <div className={"dropdown"+(!my? ' unvisible': '')}>
            <RiArrowDropDownLine className="dropbtn" onClick={handleClick} />
            <div className={"dropdown-content"+(shown?' shown':'')}>
                <div>מחיקה מהצ'אט</div>
                <div>מחיקה אצל כולם</div>
                <div>Link 3</div>
            </div>
        </div>
        {text.split('\n').map((line,index) => <span key={index}>{line}<br /></span>)}
    </div>
    );
}
export default Message;