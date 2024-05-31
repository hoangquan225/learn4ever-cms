import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../redux/store";
import { apiGetAllUser, apiUpdateUser } from "../../api/user";
import { UserInfo } from "../../submodule/models/user";

interface UserState {
  users: UserInfo[],
  loading: boolean,
  error: string,
  usersInfo: UserInfo | null,
  total: number
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: "",
  usersInfo: null,
  total: 0
};

export const requestGetAllUser = createAsyncThunk('user/getAllUser', async (props: any) => {
  const res = await apiGetAllUser(props);
  return res.data
})

export const requestUpdateUser = createAsyncThunk('user/updateUser', async (props: any) => {
  const res = await apiUpdateUser(props);
  return res.data
})

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const actionList: any[] = [requestGetAllUser, requestUpdateUser];
    actionList.forEach(action => {
      builder.addCase(action.pending, (state) => {
        state.loading = true;
      })
    })
    actionList.forEach(action => {
      builder.addCase(action.rejected, (state) => {
        state.loading = false;
      })
    })

    builder.addCase(requestGetAllUser.fulfilled, (state, action: PayloadAction<{
      data: UserInfo[],
      status: number
    }>) => {
      state.loading = false;
      state.users = action.payload.data.map((o) => new UserInfo(o));
    })

    builder.addCase(requestUpdateUser.fulfilled, (state, action: PayloadAction<{
      data: UserInfo,
      status: number
    }>) => {
      state.loading = false;
      state.usersInfo = action.payload.data;
    })
  },
});

export const { } = userSlice.actions;

export const userState = (state: RootState) => state.user;

export default userSlice.reducer;