import ENDPONTAPI from "../submodule/common/endpoint"
import { ApiConfig } from "./config"

export const apiLoadStatistics = async (payload: {
    startTime?: number,
    endTime?: number
}) => {
    return ApiConfig(ENDPONTAPI.LOAD_STATISTIC, {
        payload
    })
}

export const topicProgressStatistic = async (payload: {
    startTime?: number,
    endTime?: number,
    idCourse?: string,
    idCategory?: string,
}) => {
    return ApiConfig("/cms/topic-progress-statistic", {
        payload: {
            startTime: payload?.startTime,
            endTime: payload?.endTime,
            idCourse: payload?.idCourse,
            idCategory: payload?.idCategory,
        }
    })
}