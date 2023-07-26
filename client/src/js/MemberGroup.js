function MemberGroup({user}) {
    return (
        <div className="member-group">
            <div>{user.fullname}</div>
            {user.is_admin?<div className="is_admin">מנהל/ת</div>:<></>}
        </div>
    )
}
export default MemberGroup;