import {createStore, applyMiddleware, combineReducers} from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import userReducer from './Reducers/userReducer';
import subjectReducer from './Reducers/subjectReducer';
import goalReducer from './Reducers/goalReducer';
import assignmentReducer from './Reducers/assignmentReducer';
import notificationReducer from './Reducers/notificationReducer';
import metaReducer from './Reducers/metaReducer';
import tourReducer from './Reducers/tourReducer';
import {persistStore, persistReducer} from 'redux-persist';
import { thunk } from 'redux-thunk';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  userReducer,
  subjectReducer,
  assignmentReducer,
  goalReducer,
  notificationReducer,
  metaReducer,
  tourReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
// Ensure thunk middleware is properly applied
const middleware = [thunk];
const store = createStore(
  persistedReducer, 
  applyMiddleware(...middleware)
);
const persistor = persistStore(store);

export {store, persistor};
