import React from 'react'

import { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setPoker } from '../../../redux/reducers/styleSlice';

import axios from 'axios';
import { setPokerGame } from '../../../redux/reducers/playerSlice';

const PickATable = () => {
    const ref = useRef(null);

    const dispatch = useDispatch();

    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);
    
    function keyUp(e) {
        if (e.key === 'Enter') {
            createATable();
        }
    }

    function onChangeTableName(e) {
        dispatch(setPoker({
            ...styleState.poker,
            inputControls: {
                ...styleState.poker.inputControls,
                tableName: e.target.value,
            }
        }))
    }

    function createATable() {
        axios.get(`/api/poker?action=create_a_table&session_id=${localStorage.CAESSINO_SESSION_ID}&displayName=${playerState.player.displayName}&tableName=${styleState.poker.inputControls.tableName}`);
    }

    function joinATable(e) {
        axios.get(`/api/poker?action=join_a_table&session_id=${localStorage.CAESSINO_SESSION_ID}&tableId=${e.target?.dataset?.table}&displayName=${playerState.player.displayName}`);
    }

    return (
        <div className="pokerPickATableContainer">
            <div className="createATable">
                <input ref={ref} type="text" onChange={(e) => {onChangeTableName(e)}} onKeyUp={(e) => keyUp(e)} value={styleState.poker.inputControls.tableName} placeholder="Table name"/>
                <button className="secondaryButton" onClick={() => createATable()}>Create a table</button>
            </div>
            <div>
                <h3>Pick a table:</h3>
                <div onClick={(e) => joinATable(e)}>
                    {playerState.pokerGame.tables.map(table => (
                        <div data-table={table.id} key={table.id}>
                            <p data-table={table.id}>Table name: {table.name}</p>
                            <p data-table={table.id}>Creator: {table.creator}</p>
                            <p data-table={table.id}>Players: {table.players.length}/8</p>
                            <p data-table={table.id}>Join</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PickATable