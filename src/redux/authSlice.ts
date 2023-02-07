import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { UserInfo } from "../submodule/models/user";
import {
  apiGetUserFromToken, apiLogin
} from "../api/auth";
import TTCSconfig from "../submodule/common/config";
// import _ from "lodash";

export interface UserState {
  userInfo: UserInfo | null;
  loading: boolean;
  loadingCheckLogin: boolean;
}

const initialState: UserState = {
  userInfo: null,
  loading: false,
  loadingCheckLogin: true,
};

export const requestLogin = createAsyncThunk(
  "auth/login",
  async (props: { account: string; password: string, userRole: number }) => {
    const res = await apiLogin(props);
    return res.data;
  }
);

export const requestGetUserFromToken = createAsyncThunk(
  "user/requestGetUserFromToken",
  async (props: { token: string }) => {
    const res = await apiGetUserFromToken(props.token);
    return res.data;
  }
);

export const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loadUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    /**
     * login
     */
    builder.addCase(requestLogin.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      requestLogin.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userInfo = new UserInfo(action.payload.userLogin);
      }
    );
    // requestGetUserFromToken
    builder.addCase(requestGetUserFromToken.pending, (state) => {
      state.loadingCheckLogin = true;
    });
    builder.addCase(
      requestGetUserFromToken.fulfilled,
      (
        state,
        action: PayloadAction<{
          status: number;
          userInfo: UserInfo;
        }>
      ) => {
        state.userInfo = action.payload.userInfo;
        state.loadingCheckLogin = false;
      }
    );
    builder.addCase(requestGetUserFromToken.rejected, (state) => {
      state.loadingCheckLogin = false;
    });
  },
});

export const authState = (state: RootState) => state.authState;

export const { loadUserInfo } = authSlice.actions;
export default authSlice.reducer;
