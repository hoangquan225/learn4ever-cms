import ENDPONTAPI from "../submodule/common/endpoint";
import { ApiConfig } from "./config";

export const apiLoadFeedbacks = async (payload: {
  skip?: number;
  limit?: number;
}) => {
  return ApiConfig(
    ENDPONTAPI.GET_FEEDBACKS,
    {
      params: {
        skip: payload?.skip,
        limit: payload?.limit,
      },
    },
    "GET"
  );
};

export const apiLoadFeedbackByIdCourse = async (payload: {
  idCourse: string;
}) => {
  return ApiConfig(ENDPONTAPI.GET_FEEDBACKS_BY_COURSE, {
    params: {
      idCourse: payload?.idCourse,
    },
  });
};

export const apiLoadFeedbackByIdTypeOrCourse = async (payload: {
  type?: string[];
  idCourse?: string;
  limit?: number;
  skip?: number;
}) => {
  return ApiConfig(ENDPONTAPI.GET_FEEDBACKS_BY_TYPE_OR_COURSE, {
    params: {
      type: payload?.type,
      idCourse: payload?.idCourse,
      limit: payload?.limit,
      skip: payload?.skip
    },
  });
};

export const apiUpdateFeedback = async (payload: any) => {
  return ApiConfig(ENDPONTAPI.CREATE_FEEDBACK, {
    payload,
  });
};
