import React from 'react'

import { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux'

import axios from 'axios';
import { setAdminInformation } from '../../redux/reducers/adminInformationSlice';
import { setAdmin } from '../../redux/reducers/adminSlice';
import { setStyle } from '../../redux/reducers/styleSlice';

const Complaints = () => {
  const dispatch = useDispatch();

  const styleState = useSelector(state => state.style);
  const adminState = useSelector(state => state.admin);
  const adminInformationState = useSelector(state => state.adminInformation);

  useEffect(() => {
    axios.get(`/api/postgre?action=get_complaints_as_admin&admin_id=${localStorage.CAESSINO_ADMIN_ID}`).then(res => {
      if (res.data?.success) {
        dispatch(setAdminInformation({
          ...adminInformationState.adminInformation,
          complaints: res.data?.complaints,
        }))
      }
    })
  }, [])
  
  function hideComplaintsScreen() {
    dispatch(setAdmin({
      ...adminState.admin,
      displays: {
        ...adminState.admin.displays,
        complaintsScreen: false,
      }
    }))
  }

  function answerComplaint(idx) {
    dispatch(setAdminInformation({
      ...adminInformationState.adminInformation,
      answeringComplaintIndex: idx,
      answerForComplaint: '',
    }))
  }

  function sendAnswer(complaint) {
    axios.post(`/api/postgre`, {
      action: 'send_complaint_answer_as_admin',
      admin_id: localStorage.CAESSINO_ADMIN_ID,
      complaint: {
        ...complaint,
        answer: adminInformationState.adminInformation.answerForComplaint,
      }
    }).then(res => {
      if (res.data?.success) {
        dispatch(setAdminInformation({
          ...adminInformationState.adminInformation,
          complaints: res.data?.complaints,
          answerForComplaint: '',
        }))

        dispatch(setStyle({
          ...styleState.style,
          notification: {
            show: true,
            text: 'Answer sent successfully',
            status: 'success',
          },
        }))
      }
    });
  }

  function onChangeAnswer(e) {
    dispatch(setAdminInformation({
      ...adminInformationState.adminInformation,
      answerForComplaint: e.target.value,
    }))
  }

  return (
    <div className="fullscreen top-to-bottom-centered admin complaintsScreen">
      <div>
          <p className="link" onClick={() => hideComplaintsScreen()}>⬅ Go Back</p>

          <h3>These are the complaints sent by players. You can answer them, and an email will be sent to the player so that he knows his complaint has been listened to.</h3>

          { adminInformationState.adminInformation?.complaints?.map(function(complaint, complaintIndex) {
            if (complaint.answered === "false") return (
              <div className='complaint' key={complaint.by + complaint.description.substr(0, 20)}>
                <div>
                  <p>By: {complaint.by}</p>
                  <p>Date: {new Date(complaint.date).toGMTString()}</p>
                  <div>
                    { adminInformationState.adminInformation.answeringComplaintIndex !== complaintIndex &&
                      <button className='primaryButton' onClick={() => answerComplaint(complaintIndex)}>Answer Complaint</button>
                    }
                  </div>
                </div>
                <div>
                  <textarea readOnly value={complaint.description}></textarea>
                </div>
                { adminInformationState.adminInformation.answeringComplaintIndex === complaintIndex && (
                  <div className="answering">
                    <p>Your answer:</p>
                    <textarea value={adminInformationState.adminInformation.answerForComplaint} onChange={(e) => onChangeAnswer(e)} placeholder="Post your answer here admin."></textarea>
                    <div>
                      <button className='secondaryButton' onClick={() => sendAnswer(complaint)}>Send Your Answer</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          )}

          { adminInformationState.adminInformation?.complaints?.map(function(complaint, complaintIndex) {
            if (complaint.answered === "true") return (
              <div className='complaint' key={complaint.by + complaint.description.substr(0, 20)}>
                <div>
                  <p>By: {complaint.by}</p>
                  <p>Date: {new Date(complaint.date).toGMTString()}</p>
                  <div>
                    <p>Answered</p>
                  </div>
                </div>
                <div>
                  <textarea readOnly value={complaint.description}></textarea>
                </div>
                <div className="answering">
                  <p>Your answer:</p>
                  <textarea readOnly value={complaint.answer}></textarea>
                </div>
              </div>
            )}
          )}
      </div>
    </div>
  )
}

export default Complaints