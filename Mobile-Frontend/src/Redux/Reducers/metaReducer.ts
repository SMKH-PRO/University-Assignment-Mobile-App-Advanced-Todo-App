import {SET_SUBJECT, ADD_META, ADD_HOME_FILTERS} from './../Types';

const initialState = {
  selectedSubject: null,
  meta: null,
  homeFilters: null,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_SUBJECT:
      return {...state, selectedSubject: action.payload};

      case ADD_META:
        return {...state, meta: action.payload};
     case ADD_HOME_FILTERS:
       console.log('FILERTSAKDJSAL', action.payload);
       return {...state, homeFilters: action.payload};
    default:
      return state;
  }
};
