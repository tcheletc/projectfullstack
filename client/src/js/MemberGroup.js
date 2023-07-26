import '../css/MemberGroup.css'

function MemberGroup({user, me, admin}) {
    const toggleAdmin = () => {

    }

    const removeFromGroup = () => {
        
    }
    return (
        <div className="member-group">
            <div className="name">{me? 'את/ה' : user.fullname}</div>
            {user.is_admin?<div className="is_admin">מנהל/ת</div>:<></>}
            {admin? <>
            <button onClick={toggleAdmin}>
                {user.is_admin? 'הסרה מניהול הקבוצה' : 'הגדר/י כמנהל/ת קבוצה'}
            </button>
            <button onClick={removeFromGroup}>
                הסרה מהקבוצה
            </button>
            </>: <></>}
        </div>
    )
}
export default MemberGroup;