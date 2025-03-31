import {ADD_PENDING_SUBJECTS, ADD_SUBJECT, ADD_SUBJECT_DETAILS} from './../Types';

const initialState = {
  subjects: null,
  pendingSubjects: null,
  subjectDetails: {},
};
export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_SUBJECT:
      return {...state, subjects: action.payload};

    case ADD_PENDING_SUBJECTS:
      return {...state, pendingSubjects: action.payload};
    case ADD_SUBJECT_DETAILS:
      return {
        ...state,
        subjectDetails: {
          ...state.subjectDetails,
          [action.subjectId]: action.payload,
        },
      };

    default:
      return state;
  }
};
