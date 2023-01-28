import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../redux/store";
import { Topic } from "../../submodule/models/topic";
import { apiLoadTopicsByCourse } from "../../api/topicApi";

// Define a type for the slice state
interface TopicState {
  loading: boolean;
  error: string;
  topics: Topic[];
  dataTopic: Topic | null;
}

// Define the initial state using that type
const initialState: TopicState = {
  loading: false,
  error: "",
  topics: [],
  dataTopic: null
};

export const requestLoadTopicByCourse = createAsyncThunk(
  "topic/requestLoadTopicByCourse",
  async (props: { idCourse: string; type: number; parentId?: string }) => {
    const res = await apiLoadTopicsByCourse(props);
    return res.data;
  }
);

export const topicSlice = createSlice({
  name: "topic",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setDataTopic: (state, action) => {
      state.dataTopic = action.payload
    }
  },
  extraReducers: (builder) => {
    const actionList = [requestLoadTopicByCourse];
    actionList.forEach((action) => {
      builder.addCase(action.pending, (state) => {
        state.loading = true;
      });
    });
    actionList.forEach((action) => {
      builder.addCase(action.rejected, (state) => {
        state.loading = false;
      });
    });

    // load topic by id Course
    builder.addCase(
      requestLoadTopicByCourse.fulfilled,
      (
        state,
        action: PayloadAction<{
          data: Topic[];
          total: number;
          status: number;
        }>
      ) => {
        state.topics = action.payload.data;
        state.loading = false;
      }
    );
  },
});

export const { setDataTopic } = topicSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const topicState = (state: RootState) => state.topic;

export default topicSlice.reducer;
