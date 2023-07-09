import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import io from 'socket.io-client'
const socket = io.connect('http://localhost:6000');

function Whatsapp() {
    const { username } = useParams();
    const navigate = useNavigate(); // Access the navigate function
    const [user, setUser] = useState({});

    useEffect(() => {
        const userString = localStorage.getItem("user");
        if(!userString) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userString));

        if(user.username !== username) {
            navigate(`/users/${user.username}`);
            return;
        }

        socket.emit('join_room', username);
        socket.on('receive_message', message => {
            //TODO: change
            alert(message);
        });
    }, [username, user, navigate]);


    return (
        <div dir='rtl'>
            <h1 style={{textAlign: 'center'}}>{user.fullname}</h1>
        </div>
    );
}
export default Whatsapp;