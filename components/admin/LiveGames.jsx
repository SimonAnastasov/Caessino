import React from 'react'

import { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux'

import axios from 'axios';
import { setAdminInformation } from '../../redux/reducers/adminInformationSlice';
import { setAdmin } from '../../redux/reducers/adminSlice';

const LiveGames = () => {
  const dispatch = useDispatch();

  const adminState = useSelector(state => state.admin);
  const adminInformationState = useSelector(state => state.adminInformation);

  useEffect(() => {
    axios.get(`/api/postgre?action=get_live_games_as_admin&admin_id=${localStorage.CAESSINO_ADMIN_ID}`).then(res => {
      if (res.data?.success) {
        dispatch(setAdminInformation({
          ...adminInformationState.adminInformation,
          complaints: res.data?.complaints,
        }))
      }
    })
  }, [])
  
  function hideLiveGamesScreen() {
    dispatch(setAdmin({
      ...adminState.admin,
      displays: {
        ...adminState.admin.displays,
        liveGamesScreen: false,
      }
    }))
  }

  return (
    <div className="fullscreen top-to-bottom-centered admin complaintsScreen">
      <div>
          <p className="link" onClick={() => hideLiveGamesScreen()}>⬅ Go Back</p>

          <h3>These are the current live games. You can click on one to see more details about it.</h3>

          { adminInformationState.complaints?.map(complaint => (
            <div key={complaint.by + complaint.description.substr(0, 20)}>
              { complaint.by }
              { complaint.description }
            </div>
          )) }
      </div>
    </div>
  )
}

export default LiveGames