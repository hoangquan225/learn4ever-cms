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

export const apiLoadTopicById = async (payload: {
    id: string
}) => {
    return ApiConfig(ENDPONTAPI.GET_TOPIC_BY_ID, {
        params: {
            id: payload?.id
        }
    })
}

export const apiUpdateTopic = async (payload: Topic) => {
    return ApiConfig(ENDPONTAPI.UPDATE_TOPIC, {
        payload
    })
}

export const apiLoadTopicsByCourse = async (params: {
    idCourse: string,
    type: number,
    parentId?: string,
    status?: number
}) => {
    return ApiConfig(ENDPONTAPI.GET_TOPIC_BY_COURSE, { params })
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

