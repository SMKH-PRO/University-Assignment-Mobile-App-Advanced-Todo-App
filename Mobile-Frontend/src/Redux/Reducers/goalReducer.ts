import {ADD_GOALS} from './../Types';

const initialState = {
  goals: null,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_GOALS:
      return {...state, goals: action.payload};


    default:
      return state;
  }
};
