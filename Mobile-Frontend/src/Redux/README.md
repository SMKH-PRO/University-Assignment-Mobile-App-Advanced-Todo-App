# Redux Toolkit Migration Guide

This project is in the process of migrating from traditional Redux to Redux Toolkit. This document provides guidance on how to update your components and reducers.

## Using Redux in Components

### Old way:
```javascript
import { useSelector, useDispatch } from 'react-redux';

function MyComponent() {
  const dispatch = useDispatch();
  const data = useSelector(state => state.someReducer.data);
  
  // Dispatching action
  dispatch({ type: 'SOME_ACTION', payload: data });
}
```

### New way:
```javascript
import { useAppSelector, useAppDispatch } from '../Redux/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => state.someReducer.data);
  
  // Option 1: Using legacy action format (for backward compatibility)
  dispatch({ type: 'SOME_ACTION', payload: data });
  
  // Option 2: Using action creators from a slice (preferred)
  dispatch(someSlice.actions.someAction(data));
}
```

## Creating a New Reducer with Redux Toolkit

Instead of manually creating reducers with switch statements, use createSlice:

```javascript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyState {
  data: any | null;
  loading: boolean;
}

const initialState: MyState = {
  data: null,
  loading: false,
};

const mySlice = createSlice({
  name: 'mySlice',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
});

export const { setData, setLoading, clearData } = mySlice.actions;
export default mySlice.reducer;
```

## Backward Compatibility

During the migration, we're maintaining backward compatibility by supporting both the old action types and the new action creators. See the implementation in `userReducer.ts` for a reference pattern. 