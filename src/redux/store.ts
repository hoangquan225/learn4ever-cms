import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../pages/categorys/categorySlice";
import tagReducer from "../pages/tags/tagSlice";
import courseReducer from "../pages/courses/courseSlice";

export const store = configureStore({
    reducer: {
        category: categoryReducer,
        tag: tagReducer,
        course: courseReducer
    },
    middleware: (getDefaultMiddle) => getDefaultMiddle({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;