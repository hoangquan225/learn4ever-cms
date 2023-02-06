import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiLoadQuestionsByIdTopic } from "../api/question";
import { Question } from "../submodule/models/question"
import { RootState } from "./store";


interface QuestionState {
    questions: Question[],
    loading: boolean,
    questionInfo: Question | null,
    total: number,
}

const initialState: QuestionState = {
    questions: [],
    loading: false,
    questionInfo: null,
    total: 0
}

export const requestLoadQuestionsByIdTopic = createAsyncThunk('question/requestLoadQuestionsByIdTopic', async (props: {
    status: number,
    idTopic: string
}) => {
    const res = await apiLoadQuestionsByIdTopic(props);
    return res.data
})

export const questionSlice = createSlice({
    name: 'question',
    initialState,
    reducers: {
        setQuestionInfo : (state, action) => {
            state.questionInfo = action.payload
        }
    },
    extraReducers: (builder) => {
        const actionList = [requestLoadQuestionsByIdTopic];
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

        // load by id topic
        builder.addCase(requestLoadQuestionsByIdTopic.fulfilled, (state, action: PayloadAction<{
            data: Question[],
            status: number,
            total: number
        }>) => {
            state.loading = false;
            state.questions = action.payload.data;
            state.total = action.payload.total
        })
    
    }
})

export const { setQuestionInfo } = questionSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const questionState = (state: RootState) => state.question

export default questionSlice.reducer