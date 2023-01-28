import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Lesson } from "../submodule/models/lesson";
import { apiLoadLessonByIdTopic } from "../api/lessonApi";
import { RootState } from "./store";

// Define a type for the slice state
interface LessonState {
  loading: boolean;
  error: string;
  lessons: Lesson[];
  dataLesson: Lesson | null;
}

// Define the initial state using that type
const initialState: LessonState = {
  loading: false,
  error: "",
  lessons: [],
  dataLesson: null
};

export const requestLoadLessonByIdTopic = createAsyncThunk(
  "lesson/requestLoadLessonByIdTopic",
  async (props: { idTopic: string, status: number }) => {
    const res = await apiLoadLessonByIdTopic(props);
    return res.data;
  }
);

export const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: { },
  extraReducers: (builder) => {
    const actionList = [requestLoadLessonByIdTopic];
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

    // load lesson by idTopic
    builder.addCase(
        requestLoadLessonByIdTopic.fulfilled,
      (
        state,
        action: PayloadAction<{
          data: Lesson;
          status: number;
        }>
      ) => {
        state.dataLesson = action.payload.data;
        state.loading = false;
      }
    );
  },
});

export const {  } = lessonSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const lessonState = (state: RootState) => state.lesson;

export default lessonSlice.reducer;
