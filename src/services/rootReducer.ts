import { combineReducers } from '@reduxjs/toolkit';

import { constructorSlice } from './slices/constructorSlice';
import { feedReducer } from './slices/feedSlice';
import { ingredientsReducer } from './slices/ingredientsSlice';
import { userReducer } from './slices/userSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorSlice.reducer,
  feed: feedReducer,
  user: userReducer,
});
