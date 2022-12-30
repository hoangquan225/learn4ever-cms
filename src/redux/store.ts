import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../pages/categorys/categorySlice";

export const store = configureStore({
    reducer: {
        category: categoryReducer,
    },
    middleware: (getDefaultMiddle) => getDefaultMiddle({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;