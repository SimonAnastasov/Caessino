import React from 'react'

import { AiOutlineClose } from 'react-icons/ai';

import { useDispatch, useSelector } from 'react-redux';
import { setStyle } from '../redux/reducers/styleSlice';

const Notification = () => {
    const styleState = useSelector(state => state.style);

    const dispatch = useDispatch();

    const display = styleState.style.notification.show === true ? 'flex' : 'none';
    const bg = styleState.style.notification.status === 'success' ? 'rgba(0, 200, 255, 0.8)' : 'rgba(255, 0, 0, 0.8)';

    function close() {
        dispatch(setStyle({
            ...styleState.style,
            notification: {
                ...styleState.style.notification,
                show: false,
            }
        }))
    }

    return (
        <div className="notification" style={{display: display, backgroundColor: bg}}>
            <AiOutlineClose onClick={() => close()}/>
            <div>
                {styleState.style.notification.text}
            </div>
        </div>
    )
}

export default Notification