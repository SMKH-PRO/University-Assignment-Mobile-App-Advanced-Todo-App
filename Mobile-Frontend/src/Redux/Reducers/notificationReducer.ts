import {ADD_NOTIFICATIONS} from './../Types';

const initialState = {
  notifications: null,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_NOTIFICATIONS:
      return {...state, notifications: action.payload};


    default:
      return state;
  }
};
