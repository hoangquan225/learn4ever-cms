import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../redux/store'
import { Feedback } from '../../submodule/models/feedback'
import { apiLoadFeedbackByIdCourse, apiLoadFeedbackByIdTypeOrCourse, apiLoadFeedbacks } from '../../api/feedback'

interface FeedbackState {
    feedbacks: Feedback[],
    loading: boolean,
    error: string,
    feedbackInfo: Feedback | null, 
    count: number
}

const initialState: FeedbackState = {
    feedbacks: [],
    loading: false,
    error: '',
    feedbackInfo: null,
    count : 0
}

export const requestLoadFeedbacks = createAsyncThunk('feedback/requestLoadFeedbacks', async (props: {
    skip?: number;
    limit?: number;
}) => {
    const res = await apiLoadFeedbacks(props);
    return res.data
})

export const requestLoadFeedbacksByIdCourse = createAsyncThunk('feedback/requestLoadFeedbacksByIdCourse', async (props: {
    idCourse: string
}) => {
    const res = await apiLoadFeedbackByIdCourse(props);
    return res.data
})


export const requestLoadFeedbacksByTypeOrCourse = createAsyncThunk('feedback/requestLoadFeedbacksByTypeOrCourse', async (props: {
    type?: string[], idCourse?: string, limit?: number, skip?: number
}) => {
    const res = await apiLoadFeedbackByIdTypeOrCourse(props);
    return res.data
})


export const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
        setFeedbackInfo : (state, action) => {
            state.feedbackInfo = action.payload
        },
        setFeedbacks : (state, action) => {
            console.log(state.feedbacks);
            
            state.feedbacks = action.payload
        }
    },
    extraReducers: (builder) => {
        const actionList = [requestLoadFeedbacks, requestLoadFeedbacksByIdCourse, requestLoadFeedbacksByTypeOrCourse];
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

        // load 
        builder.addCase(requestLoadFeedbacks.fulfilled, (state, action: PayloadAction<{
            data: Feedback[],
            status: number,
            count: number
        }>) => {
            state.loading = false;
            state.feedbacks = action.payload.data;
            state.count = action.payload.count
        })

        // load by id course
        builder.addCase(requestLoadFeedbacksByIdCourse.fulfilled, (state, action: PayloadAction<{
            data: Feedback[],
            status: number,
            count: number
        }>) => {
            state.loading = false;
            state.feedbacks = action.payload.data;
            state.count = action.payload.count
        })

        // load by id type
        builder.addCase(requestLoadFeedbacksByTypeOrCourse.fulfilled, (state, action: PayloadAction<{
            data: Feedback[],
            status: number,
            count: number
        }>) => {
            state.loading = false;
            state.feedbacks = action.payload.data;
            state.count = action.payload.count
        })
    }
})

export const { setFeedbackInfo, setFeedbacks } = feedbackSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const feedbackState = (state: RootState) => state.feedback

export default feedbackSlice.reducer