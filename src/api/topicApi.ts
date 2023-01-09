import ENDPONTAPI from "../submodule/common/endpoint"
import { Topic } from "../submodule/models/topic"
import { ApiConfig } from "./config"

export const apiLoadTopics = async (payload: {
    status: number
}) => {
    return ApiConfig(ENDPONTAPI.GET_TOPICS_BY_STATUS, {
        params: {
            status: payload?.status
        }
    })
}

export const apiUpdateTopic = async (payload: Topic) => {
    return ApiConfig(ENDPONTAPI.UPDATE_CATEGORY, {
        payload
    })
}

export const apiGetTopicsByCourse = async (payload: {
    idCourse: string[],
    type: number,
    parentId?: string,
}) => {
    return ApiConfig(ENDPONTAPI.GET_TOPIC_BY_COURSE, {
        params: {
            idCourse: payload?.idCourse,
            type: payload?.type,
            parentId: payload?.parentId
        }
    })
}


export const apiOrderTopic = async (payload: {
    indexRange : Array<{
        id: string,
        index: number
    }>, 
}) => {
    return ApiConfig(ENDPONTAPI.ORDER_TOPIC, {
        payload
    })
}

