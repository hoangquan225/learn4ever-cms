import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../pages/categorys/categorySlice";
import tagReducer from "../pages/tags/tagSlice";
import courseReducer from "../pages/courses/courseSlice";
import topicReducer from "../pages/courseDetail/topicSlice";
import lessonReducer from "./lessonSlice";
import feedbackReducer from "../pages/feedback/feedbackSlice";
import questionReducer from "./question";

export const store = configureStore({
    reducer: {
        category: categoryReducer,
        tag: tagReducer,
        course: courseReducer,
        topic: topicReducer, 
        lesson: lessonReducer, 
        feedback: feedbackReducer,
        question: questionReducer,
    },
    middleware: (getDefaultMiddle) => getDefaultMiddle({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;