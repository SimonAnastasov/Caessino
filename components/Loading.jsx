import React from 'react'

import { useSelector } from 'react-redux'

const Loading = () => {
    const styleState = useSelector(state => state.style);
    
    return (
        <div className="fullscreen fs-centered loadingScreen" style={{display: styleState.style.displayLoadingScreen ? 'block' : 'none', zIndex: 10}}>
            <div>
                <h1>Loading...</h1>
            </div>
        </div>
    )
}

export default Loading