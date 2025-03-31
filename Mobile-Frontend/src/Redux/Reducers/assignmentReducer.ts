import {
  ADD_ASSIGNMENTS,
  ADD_ASSIGNMENT_TYPES,
  ADD_PENDING_ASSIGNMENTS,
  ADD_ASSIGNMENT_DETAILS,
  ADD_TODAY_ASSIGNMENTS,
} from './../Types';

const initialState = {
  assignments: null,
  assignmentTypes: null,
  pandingAssignments: null,
  todayAssignments: null,
  assignmentDetails: {},
};
export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_ASSIGNMENTS:
      return {...state, assignments: action.payload};
    case ADD_ASSIGNMENT_TYPES:
      return {...state, assignmentTypes: action.payload};
    case ADD_PENDING_ASSIGNMENTS:
      return {...state, pandingAssignments: action.payload};
    case ADD_TODAY_ASSIGNMENTS:
      return {...state, todayAssignments: action.payload};
    case ADD_ASSIGNMENT_DETAILS:
      return {
        ...state,
        assignmentDetails: {
          ...state.assignmentDetails,
          [action.assignmentId]: action.payload,
        },
      };
    default:
      return state;
  }
};
