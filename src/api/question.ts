import ENDPONTAPI from "../submodule/common/endpoint"
import { ApiConfig } from "./config"

export const apiLoadQuestionsByIdTopic = async (payload: {
    status: number,
    idTopic: string
}) => {
    return ApiConfig(ENDPONTAPI.GET_QUESTIONS_BY_TOPIC, {
        params: payload
    })
}