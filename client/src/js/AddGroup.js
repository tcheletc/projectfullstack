import {BiArrowBack} from 'react-icons/bi';

function AddGroup({goBack}) {
    return (
        <div className="nav-chats">
            <BiArrowBack className='back-icon' onClick={goBack} />
        </div>
    );
}
export default AddGroup;