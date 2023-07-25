import { useCallback, useState } from 'react';
import {BiArrowBack} from 'react-icons/bi';
import fetchServer from './fetchServer';
import { MdDelete } from 'react-icons/md';
import '../css/AddGroup.css';

function AddGroup({goBack, userId, username}) {
    const [name_, setName] = useState('');
    const [users, setUsers] = useState([{username: ''}]);

    const handleGoBack = () => {
        setName('');
        setUsers([{username: ''}]);
        goBack();
    }

    const handleUsernameChange = useCallback((value, index) => {
        setUsers(prevUsers => prevUsers.map((u, i) => i === index ? 
        {...u, username: value} : u ));
    }, []);

    const handleAddClick = () => {
        if(users.length === 0) {
            setUsers([{username: ''}]);
            return;
        }
        const lastUser = users[users.length - 1];
        if(lastUser.username === username) {
            alert('אין צורך להוסיף את עצמך לקבוצה');
            return;
        }
        if(!lastUser.fullname) {
            fetchServer(`/users?username=${lastUser.username}&limit=1`, (res, err, stat) => {
                if(err) {
                    if(stat === 404) {
                        alert(`שם המשתמש ${lastUser.username} לא קיים במערכת`);
                    } else {
                        alert(`שגיאה${stat}: מציאת המשתמש ${lastUser.username} נכשלה`);
                    }
                } else {
                    setUsers(prevUsers => prevUsers.slice(0, -1).concat([res, {username: ''}]));
                }
            })
        } else {
            setUsers(prevUsers => prevUsers.concat([{username: ''}]));
        }
    }

    const handleRemoveClick = (index) => {
        setUsers(prevUsers => prevUsers.slice(0, index).concat(prevUsers.slice(index + 1)));
    }

    const createGroup = (users) => {
        fetchServer(`/groups`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat}: יצירת הקבוצה נכשלה`);
            } else {
                //ADD group to display
                setName('');
                setUsers([{username: ''}]);
            }
        }, 'POST', 
        JSON.stringify({name_, users: users.map(u => u.id), userId}),
        { 'Content-Type': 'application/json'})
    }

    const handleSubmit = () => {
        if(users.length === 0) {
            alert('חובה להוסיף לפחות חבר אחד לקבוצה');
            return;
        }
        const lastUser = users[users.length - 1];
        if(lastUser.username === username) {
            alert('אין צורך להוסיף את עצמך לקבוצה');
            return;
        }
        if(!lastUser.fullname) {
            fetchServer(`/users?username=${lastUser.username}&limit=1`, (res, err, stat) => {
                if(err) {
                    if(stat === 404) {
                        alert(`שם המשתמש ${lastUser.username} לא קיים במערכת`);
                    } else {
                        alert(`שגיאה${stat}: מציאת המשתמש ${lastUser.username} נכשלה`);
                    }
                } else {
                    const allUsers = users.slice(0, -1).concat([res]);
                    setUsers(allUsers);
                    createGroup(allUsers);
                }
            })
        } else{
            createGroup(users);
        }
    }

    return (
        <div className="nav-chats">
            <div className='add-group'>
            <BiArrowBack className='back-icon' onClick={handleGoBack} />
            <h3>הוספת קבוצה</h3>
            <form onSubmit={handleSubmit}>
                <label><strong>שם הקבוצה: </strong>{' '}
                <input value={name_} onChange={(({target}) => setName(target.value))} /></label><br />
                <h4><strong>חברי הקבוצה: </strong></h4>
                {users.map((user, index) => 
                    <div key={index} className='member-group'>
                        <input value={user.username} 
                        onChange={(e) => handleUsernameChange(e.target.value, index)}
                        placeholder='שם משתמש' />
                        <MdDelete className="icon" onClick={() => handleRemoveClick(index)} />
                    </div>)}
                <button type='button' onClick={handleAddClick}>+הוספת חבר לקבוצה</button>
                <button type='submit'>יצירת הקבוצה</button>
            </form>
            </div>
        </div>
    );
}
export default AddGroup;