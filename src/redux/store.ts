import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../pages/categorys/categorySlice";
import tagReducer from "../pages/tags/tagSlice";
import courseReducer from "../pages/courses/courseSlice";
import topicReducer from "../pages/courseDetail/topicSlice";
import lessonReducer from "./lessonSlice";
import feedbackReducer from "../pages/feedback/feedbackSlice";
import questionReducer from "./question";
import authReducer from "./authSlice";
import statisticReducer from "../pages/statistic/statisticSlice";
import userReducer from "../pages/user/usersSlice";

export const store = configureStore({
    reducer: {
        category: categoryReducer,
        tag: tagReducer,
        course: courseReducer,
        topic: topicReducer, 
        lesson: lessonReducer,
        feedback: feedbackReducer,
        question: questionReducer,
        authState: authReducer,
        statistic: statisticReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddle) => getDefaultMiddle({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;