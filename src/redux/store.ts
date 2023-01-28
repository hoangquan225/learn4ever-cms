import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../pages/categorys/categorySlice";
import tagReducer from "../pages/tags/tagSlice";
import courseReducer from "../pages/courses/courseSlice";
import topicReducer from "../pages/courseDetail/topicSlice";
import lessonReducer from "./lessonSlice";

export const store = configureStore({
    reducer: {
        category: categoryReducer,
        tag: tagReducer,
        course: courseReducer,
        topic: topicReducer, 
        lesson: lessonReducer
    },
    middleware: (getDefaultMiddle) => getDefaultMiddle({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;