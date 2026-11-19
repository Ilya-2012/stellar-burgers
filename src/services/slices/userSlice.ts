import {
  getOrdersApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  orderBurgerApi,
  registerUserApi,
  updateUserApi,
} from '@/utils/burger-api';
import { deleteCookie, setCookie } from '@/utils/cookie';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder, TUser } from '@/utils/types';
import type { PayloadAction } from '@reduxjs/toolkit';

export type TUserState = {
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  user: TUser | null;
  orders: TOrder[];
  orderModalData: TOrder | null;
  loading: boolean;
  error: string | null;
};

const initialState: TUserState = {
  isAuthChecked: false,
  isAuthenticated: false,
  user: null,
  orders: [],
  orderModalData: null,
  loading: false,
  error: null,
};

export const getUser = createAsyncThunk('user/getUser', async () => await getUserApi());

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (user: { name: string; email: string; password: string }) =>
    await updateUserApi(user)
);

export const getOrders = createAsyncThunk(
  'user/getOrders',
  async () => await getOrdersApi()
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (data: { email: string; password: string }) => await loginUserApi(data)
);

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (data: { name: string; email: string; password: string }) =>
    await registerUserApi(data)
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
});

export const orderBurger = createAsyncThunk(
  'order/orderBurger',
  async (data: string[]) => await orderBurgerApi(data)
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    setUser: (state, action: PayloadAction<TUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    clearOrderModalData: (state) => {
      state.orderModalData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthChecked = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthChecked = true;
        state.error = action.error.message ?? null;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;

        localStorage.setItem('refreshToken', action.payload.refreshToken);
        setCookie('accessToken', action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isAuthChecked = true;
      })
      .addCase(orderBurger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.loading = false;
        state.orderModalData = action.payload.order;
      })
      .addCase(orderBurger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});
export const { authChecked, setUser, logout, clearOrderModalData } = userSlice.actions;
export const userReducer = userSlice.reducer;
