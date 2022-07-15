import React from 'react'

import { useSelector } from 'react-redux'

const LostConnection = () => {
    const styleState = useSelector(state => state.style);
    
    return (
        <div className="fullscreen fs-centered lostConnectionScreen" style={{display: styleState.style.lostConnectionInfo.show ? 'block' : 'none', zIndex: 100}}>
            <div>
                <h3>Lost connection to the server.</h3>
                <h3>This is a server error. Nothing you can do.</h3>
                <h3>{styleState.style.lostConnectionInfo.message}</h3>
            </div>
        </div>
    )
}

export default LostConnection