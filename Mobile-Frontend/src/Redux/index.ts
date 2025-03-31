import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import userReducer from './Reducers/userReducer';
import subjectReducer from './Reducers/subjectReducer';
import goalReducer from './Reducers/goalReducer';
import assignmentReducer from './Reducers/assignmentReducer';
import notificationReducer from './Reducers/notificationReducer';
import metaReducer from './Reducers/metaReducer';
import tourReducer from './Reducers/tourReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['userReducer', 'metaReducer', 'tourReducer'],
};

const rootReducer = {
  userReducer,
  subjectReducer,
  assignmentReducer,
  goalReducer,
  notificationReducer,
  metaReducer,
  tourReducer
};

const persistedReducer = persistReducer(persistConfig, 
  // Using combineReducers is not needed with configureStore
  // as it combines reducers automatically
  (state, action) => {
    const newState = {};
    Object.keys(rootReducer).forEach(key => {
      newState[key] = rootReducer[key](state?.[key], action);
    });
    return newState;
  }
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };

// Define the RootState interface to properly type the state structure
export interface RootState {
  userReducer: ReturnType<typeof userReducer>;
  subjectReducer: ReturnType<typeof subjectReducer>;
  assignmentReducer: ReturnType<typeof assignmentReducer>;
  goalReducer: ReturnType<typeof goalReducer>;
  notificationReducer: ReturnType<typeof notificationReducer>;
  metaReducer: ReturnType<typeof metaReducer>;
  tourReducer: ReturnType<typeof tourReducer>;
  _persist: any; // Redux persist adds this
}

export type AppDispatch = typeof store.dispatch;
