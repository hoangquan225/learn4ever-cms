import ENDPONTAPI from "../submodule/common/endpoint"
import { Question } from "../submodule/models/question"
import { ApiConfig } from "./config"

export const apiLoadQuestionsByIdTopic = async (payload: {
    status: number,
    idTopic: string
}) => {
    return ApiConfig(ENDPONTAPI.GET_QUESTIONS_BY_TOPIC, {
        params: payload
    })
}

export const apiUpdateQuestion = async (payload: Question) => {
    return ApiConfig(ENDPONTAPI.UPDATE_QUESTION, {
        payload
    })
}

export const apiDeleteQuestion = async (payload: {id: string}) => {
    return ApiConfig("/question/delete-question", {
        payload
    })
}

export const createQuestionByExcel = async (payload: {questions: any, idTopic: string, isDelete: boolean}) => {
    return ApiConfig("/question/update-question-by-excel", {
        payload
    })
}

