import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { setAdmin } from '../../redux/reducers/adminSlice';

const Dashboard = () => {
  const dispatch = useDispatch();

  const adminState = useSelector(state => state.admin);

  function seeComplaints() {
    dispatch(setAdmin({
      ...adminState.admin,
      displays: {
        ...adminState.admin.displays,
        complaintsScreen: true,
      }
    }))
  }

  function seeLiveGames() {
    dispatch(setAdmin({
      ...adminState.admin,
      displays: {
        ...adminState.admin.displays,
        liveGamesScreen: true,
      }
    }))
  }

  return (
    <div className="fullscreen fs-centered admin dashboardScreen">
        <div className="fs-inputs-container">
            <div>
                <span>Hello Admin</span>
                <div>
                  <button className="primaryButton" onClick={() => seeComplaints()}>See complaints</button>
                  <button className="primaryButton" onClick={() => seeLiveGames()}>See live games</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard