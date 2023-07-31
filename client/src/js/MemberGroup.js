import '../css/MemberGroup.css'
import fetchServer from './fetchServer'

function MemberGroup({user, me, admin, displayRemoveUserFromGroup, displayChangeAdminUserInGroup, groupId}) {
    const toggleAdmin = () => {
        fetchServer(`/groups/${groupId}/users/${user.id}`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat||''}: עדכון המשתמש ${user.fullname} בקבוצה נכשלה`);
            } else {
                displayChangeAdminUserInGroup();
            }
        }, 'PUT', JSON.stringify({is_admin: !user.is_admin}),
        { 'Content-Type': 'application/json'});
    }

    const removeFromGroup = () => {
        fetchServer(`/groups/${groupId}/users/${user.id}`, (res, err, stat) => {
            if(err) {
                alert(`שגיאה${stat||''}: הסרת המשתמש ${user.fullname} מהקבוצה נכשלה`);
            } else {
                displayRemoveUserFromGroup();
            }
        }, 'DELETE');
    }
    return (
        <div className="member-group">
            <div className="name">{me? 'את/ה' : user.fullname}</div>
            {user.is_admin?<div className="is_admin">מנהל/ת</div>:<></>}
            {admin? <>
            <button onClick={toggleAdmin}>
                {user.is_admin? 'הסרה מניהול הקבוצה' : 'הגדר/י כמנהל/ת קבוצה'}
            </button>
            {!me?<button onClick={removeFromGroup}>
                {'הסרה מהקבוצה'}
            </button>:<></>}
            </>: <></>}
        </div>
    )
}
export default MemberGroup;