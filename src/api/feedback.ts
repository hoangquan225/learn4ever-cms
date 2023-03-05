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

export const apiLoadFeedbackByIdTypeOrCourse = async (payload: {
    type?: string[], idCourse?: string
}) => {
    return ApiConfig(ENDPONTAPI.GET_FEEDBACKS_BY_TYPE_OR_COURSE, {
        params: {
            type: payload?.type,
            idCourse: payload?.idCourse
        }
    })
}

export const apiUpdateFeedback = async (payload: any) => {
    return ApiConfig(ENDPONTAPI.CREATE_FEEDBACK, {
      payload,
    });
  };
  