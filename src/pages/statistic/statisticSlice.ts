import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiLoadStatistics, topicProgressStatistic } from "../../api/statisticApi";
import { RootState } from "../../redux/store";
import { apiGetCategoryStatistic } from "../../api/categoryApi";

interface StatisticState {
    statistics: {
        [x: string]: number[];
    }[],
    rangeMonth: string[],
    loading: boolean,
    numResult: any,
    categories: any,
    dataStatisticTopicProgress: any
}

const initialState: StatisticState = {
    statistics: [],
    rangeMonth: [],
    loading: false,
    numResult: 0,
    categories: [],
    dataStatisticTopicProgress: {}
}

export const requestLoadStatistic = createAsyncThunk("statistic/requestLoadStatistic", async (props: {
    startTime?: number,
    endTime?: number
}) => {
    const res = await apiLoadStatistics(props)
    return res.data
})

export const requestGetCategoryStatistic = createAsyncThunk("statistic/requestGetCategoryStatistic", async (props: {
    status: number
}) => {
    const res = await apiGetCategoryStatistic(props)
    return res.data
})

export const requestTopicProgressStatistic = createAsyncThunk("statistic/requestTopicProgressStatistic", async (props:  {
    startTime?: number,
    endTime?: number,
    idCourse?: string,
    idCategory?: string,
}) => {
    const res = await topicProgressStatistic(props)
    return res.data
})

export const statisticSlice = createSlice({
    name: 'statistic',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        const actionList = [requestLoadStatistic, requestGetCategoryStatistic, requestTopicProgressStatistic];
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
        builder.addCase(requestLoadStatistic.fulfilled, ((state, action: PayloadAction<{
            data: {
                numRegiter: number,
                numLogin: number,
                numFeedback: number,
                date: string
            }[],
            status: number
        }>) => {
            state.loading = false
            state.rangeMonth = action.payload.data.map(o => o.date)
            const datas = action.payload.data.map(o => ({
                numFeedback: o.numFeedback,
                numLogin: o.numLogin,
                numRegiter: o.numRegiter
            }))

            const keys = Object.keys(datas[0]);
            const newArray = keys.map(key => {
                const value = datas.map(item => item[key as keyof typeof item])
                return {
                    [key]: value
                }
            });
            state.statistics = newArray
            // const keys = ['numRegiter', 'numLogin', 'numFeedback'];

            const result: any = {};

            keys.forEach(key => {
                result[key] = datas.reduce((total, item) => total + item[key as keyof typeof item], 0);
            });

            state.numResult = result
        }))

        // load category 
        builder.addCase(requestGetCategoryStatistic.fulfilled, ((state, action: PayloadAction<{
            data: any,
            status: number
        }>) => {
            state.loading = false
            state.categories = action.payload.data
        }))

        // load category 
        builder.addCase(requestTopicProgressStatistic.fulfilled, ((state, action: PayloadAction<{
            data: any,
            status: number
        }>) => {
            state.loading = false
            state.dataStatisticTopicProgress = action.payload.data
        }))
    }
})

export const { } = statisticSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const statisticState = (state: RootState) => state.statistic

export default statisticSlice.reducer