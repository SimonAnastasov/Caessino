import React from 'react'

import Link from 'next/link'

import { AiOutlineArrowLeft } from 'react-icons/ai'

import { useDispatch, useSelector } from 'react-redux'

const PokerHeader = () => {
    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    return (
        <header className="header">
            <Link href="/" passHref>
                <h2>
                    <AiOutlineArrowLeft />
                </h2>
            </Link>
            <nav>
                <ul>
                    <li>Hi, {playerState?.player?.displayName}</li>
                    <li>Balance: ${playerState?.player?.credits}</li>
                </ul>
            </nav>
        </header>
    )
}

export default PokerHeader