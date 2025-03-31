import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define user type
interface User {
  id?: string;
  name?: string;
  email?: string;
  token?: string;
  // Add other user properties as needed
}

// Define a type for the slice state
interface UserState {
  user: User | null;
  afterLogin: {
    path?: string;
    params?: Record<string, unknown>;
  } | null;
}

// Define the initial state using that type
const initialState: UserState = {
  user: null,
  afterLogin: null,
};

export const userSlice = createSlice({
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

// Action creators are generated for each case reducer function
export const { setUser, setAfterLogin, clearUser } = userSlice.actions;

// Other code could use the imported selectors to select specific pieces of state
export const selectUser = (state: { userReducer: UserState }) => state.userReducer?.user;
export const selectAfterLogin = (state: { userReducer: UserState }) => state.userReducer?.afterLogin;

export default userSlice.reducer;
