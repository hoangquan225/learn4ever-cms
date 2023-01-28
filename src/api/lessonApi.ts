import ENDPONTAPI from "../submodule/common/endpoint"
import { Lesson } from "../submodule/models/lesson"
import { ApiConfig } from "./config"

export const apiLoadLessonByIdTopic = async (payload: {
    idTopic: string,
    status: number
}) => {
    return ApiConfig(ENDPONTAPI.GET_LESSONS_BY_IDTOPIC, {
        params: {
            idTopic: payload?.idTopic,
            status: payload?.status
        }
    })
}

export const apiUpdateLesson = async (payload: Lesson) => {
    return ApiConfig(ENDPONTAPI.UPDATE_LESSON, {
        payload
    })
}