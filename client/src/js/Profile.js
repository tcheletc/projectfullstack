import profileImage from '../images/profile.png';
import {BiArrowBack} from 'react-icons/bi';
import fetchServer from './fetchServer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FaSave } from 'react-icons/fa';
import { useState } from 'react';
import '../css/Profile.css';

function Profile({user, goBack, updateProfile}) {
    const [editableFields, setEditableFields] = useState({
        fullname: false,
        email: false,
        phone: false,
        password_: false,
    });
    const [updatedFields, setUpdatedFields] = useState({
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        password_: '',
        newPassword: '',
        newPasswordVerify: '',
    });

    const handleEdit = (field) => {
        setEditableFields((prevEditableFields) => ({
            ...prevEditableFields,
            [field]: true,
        }));
    };

    const handleInputChange = (e, field) => {
        const { value } = e.target;
        setUpdatedFields((prevUpdatedFields) => ({
          ...prevUpdatedFields,
          [field]: value,
        }));
    };

    const handlePasswordSave = async () => {
        const { newPassword, newPasswordVerify } = updatedFields;
      
        if (newPassword !== newPasswordVerify) {
          alert('הסיסמא החדשה לא תואמת לאימות שלה');
          return;
        }
      
        fetchServer(`/passwords/${user.id}`,(res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat||''}: עדכון הפרופיל נכשל`);
            } else {
                alert("הסיסמא השתנתה בהצלחה!");
                const updatedUser = { ...user, password_: newPassword };
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
                updateProfile(updatedUser);
                setEditableFields((prevEditableFields) => ({
                ...prevEditableFields,
                password_: false,
                }));
        
                setUpdatedFields((prevUpdatedFields) => ({
                ...prevUpdatedFields,
                newPassword: '',
                newPasswordVerify: '',
                }));
            }
        },'PUT',
             JSON.stringify({ currentPassword: user.password_, newPassword }),
             { 'Content-Type': 'application/json'}
        );
      };
    
    const handleSave = (field) => {
        fetchServer(`/users/${user.id}`,(res, error, status) => {
            if(error) {
                alert(`שגיאה${status||''}: עדכון הפרופיל נכשל`);
            } else {
                const updatedUser = { ...user, [field]: updatedFields[field] };
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
                updateProfile(updatedUser);
                setEditableFields((prevEditableFields) => ({
                ...prevEditableFields,
                [field]: false,
                }));
            }
            }, 'PUT',
            JSON.stringify({ [field]: updatedFields[field] }),
            { 'Content-Type': 'application/json' }
        );
    }

    return (
        <div className="nav-chats">
            <BiArrowBack className='back-icon' onClick={goBack} />
            <div className='details-chat' >
                <h3>פרופיל אישי</h3>
                <img src={profileImage} alt="תמונת פרופיל" />
                <p>
                <span className="edit-icon-container">
                    <strong>שם:</strong> {' '}
                    {editableFields.fullname ? (
                    <>
                        <input
                        type="text"
                        value={updatedFields.fullname}
                        onChange={(e) => handleInputChange(e, 'fullname')}
                        />
                        <FaSave className="save-button" onClick={() => handleSave('fullname')} />
                    </>
                    ) : (
                    <>
                        {user.fullname}
                        <FontAwesomeIcon
                        icon={faPencilAlt}
                        className="edit-icon"
                        onClick={() => handleEdit('fullname')}
                        />
                    </>
                    )}
                </span>
                </p>
                <p><strong>שם משתמש:</strong> {user.username}</p>
                <p>
                <span className="edit-icon-container">
                    <strong>דוא"ל:</strong>{' '}
                    {editableFields.email ? (
                    <>
                        <input
                        type="text"
                        value={updatedFields.email}
                        onChange={(e) => handleInputChange(e, 'email')}
                        />
                        <FaSave className="save-button" onClick={() => handleSave('email')} />
                    </>
                    ) : (
                    <>
                        {user.email}
                        <FontAwesomeIcon
                        icon={faPencilAlt}
                        className="edit-icon"
                        onClick={() => handleEdit('email')}
                        />
                    </>
                    )}
                </span>
                </p>
                <p>
                <span className="edit-icon-container">
                    <strong>מספר טלפון:</strong>{' '}
                    {editableFields.phone ? (
                    <>
                        <input
                        type="text"
                        value={updatedFields.phone}
                        onChange={(e) => handleInputChange(e, 'phone')}
                        />
                        <FaSave className="save-button" onClick={() => handleSave('phone')} />
                    </>
                    ) : (
                    <>
                        {user.phone}
                        <FontAwesomeIcon
                        icon={faPencilAlt}
                        className="edit-icon"
                        onClick={() => handleEdit('phone')}
                        />
                    </>
                    )}
                </span>
                </p>
                <p>
            <span className="edit-icon-container">
                <strong>סיסמא:</strong>{' '}
                {editableFields.password_ ? (
                <>
                    <div>
                    <input
                    type="password"
                    placeholder="סיסמא חדשה"
                    value={updatedFields.newPassword}
                    onChange={(e) => handleInputChange(e, 'newPassword')}
                    /><br />
                    <input
                    type="password"
                    placeholder="אימות סיסמא חדשה"
                    value={updatedFields.newPasswordVerify}
                    onChange={(e) => handleInputChange(e, 'newPasswordVerify')}
                    />
                    </div>
                    <button className="save-button" onClick={handlePasswordSave} >
                        <FaSave />
                    </button>
                </>
                ) : (
                <>
                {user.password_.replace(/./g, '●')}
                <FontAwesomeIcon
                    icon={faPencilAlt}
                    className="edit-icon"
                    onClick={() => handleEdit('password_')}
                />
                </>
                )}
            </span>
            </p>
            </div>
        </div>
    );
}
export default Profile;