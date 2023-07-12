import { useState } from 'react';
import '../css/Message.css';
import {RiArrowDropDownLine} from 'react-icons/ri'
function Message({text, my, senderName, groupId}) {
    const [shown, setShown] = useState(false);
    const handleClick = () => setShown(shown => !shown);
    return (
    <div className={"message" + (my? ' my': '')}>
        <h3 className={(my||!groupId)&&'unvisible'}>{senderName}</h3>
        <div class={"dropdown"+(!my? ' unvisible': '')}>
            <RiArrowDropDownLine class="dropbtn" onClick={handleClick} />
            <div class={"dropdown-content"+(shown?' shown':'')}>
                <div>מחיקה מהצ'אט</div>
                <div>מחיקה אצל כולם</div>
                <div>Link 3</div>
            </div>
        </div>
        {text.split('\n').map(line => <>{line}<br /></>)}
    </div>
    );
}
export default Message;