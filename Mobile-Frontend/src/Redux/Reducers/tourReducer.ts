import {STEP_COUNTER, GOAL_TOUR_COUNTER, HOME_TOUR_COUNTER} from './../Types';

const initialState = {
  stepCounter: 1,
  homeCounter: 1,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case STEP_COUNTER:
      return {...state, stepCounter: action.payload};
    case GOAL_TOUR_COUNTER:
      return {...state, goalCounter: action.payload};
    case HOME_TOUR_COUNTER:
      return {...state, homeCounter: action.payload};

    default:
      return state;
  }
};
