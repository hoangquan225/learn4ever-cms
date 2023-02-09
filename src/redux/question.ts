import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { apiLoadQuestionsByIdTopic, apiUpdateQuestion } from "../api/question";
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

export const requestUpdateQuestion = createAsyncThunk('question/requestUpdateQuestion', async (props: Question) => {
    const res = await apiUpdateQuestion(props);
    return res.data
})

export const questionSlice = createSlice({
    name: 'question',
    initialState,
    reducers: {
        setQuestionInfo : (state, action) => {
            state.questionInfo = action.payload
        }, 
        setQuestions: (state, action) => {
            state.questions = _.orderBy(action.payload, ['index'], 'asc')
        }
    },
    extraReducers: (builder) => {
        const actionList = [requestLoadQuestionsByIdTopic, requestUpdateQuestion];
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
            state.questions = _.orderBy(
                action.payload.data,
                ["index"],
                ["asc"]
              ).map((question, index) => {
                return {
                  ...question,
                  index: index + 1,
                  answer: _.orderBy(question.answer, ["index"], ["asc"]).map(
                    (answer, index) => ({
                      ...answer,
                      index,
                    })
                  ),
                };
              });
            state.total = action.payload.total
        })

        // update 
        builder.addCase(requestUpdateQuestion.fulfilled, (state, action: PayloadAction<{
            data: Question,
            status: number,
        }>)=> {
            state.loading = false;
        })
    
    }
})

export const { setQuestionInfo, setQuestions } = questionSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const questionState = (state: RootState) => state.question

export default questionSlice.reducer