import ENDPONTAPI from "../submodule/common/endpoint"
import { ApiConfig } from "./config"

export const apiLoadFeedbacks = async () => {
    return ApiConfig(ENDPONTAPI.GET_FEEDBACKS, {} , "GET")
}

export const apiLoadFeedbackByIdCourse = async (payload: {
    idCourse: string
}) => {
    return ApiConfig(ENDPONTAPI.GET_FEEDBACKS_BY_COURSE, {
        params: {
            idCourse: payload?.idCourse
        }
    })
}