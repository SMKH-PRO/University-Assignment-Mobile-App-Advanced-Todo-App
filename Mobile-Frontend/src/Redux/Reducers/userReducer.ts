import { createSlice, PayloadAction, AnyAction } from '@reduxjs/toolkit';

// Define user type
interface User {
  id?: string;
  name?: string;
  email?: string;
  token?: string;
  // Add other user properties as needed
}

interface UserState {
  user: User | null;
  afterLogin: {
    path?: string;
    params?: Record<string, unknown>;
  } | null;
}

const initialState: UserState = {
  user: null,
  afterLogin: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setAfterLogin: (state, action: PayloadAction<UserState['afterLogin']>) => {
      state.afterLogin = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setAfterLogin, clearUser } = userSlice.actions;

// For backwards compatibility with existing code
export default (state = initialState, action: AnyAction): UserState => {
  if (action.type === 'ADD_USER') {
    return userSlice.reducer(state, setUser(action.payload));
  }
  if (action.type === 'AFTER_LOGIN') {
    return userSlice.reducer(state, setAfterLogin(action.payload));
  }
  return userSlice.reducer(state, action);
};
