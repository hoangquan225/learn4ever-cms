import ENDPONTAPI from "../submodule/common/endpoint"
import { Category } from "../submodule/models/category"
import { ApiConfig } from "./config"

export const apiLoadCategorys = async (payload: {
    status: number
}) => {
    return ApiConfig(ENDPONTAPI.GET_CATEGORYS_BY_STATUS, {
        params: {
            status: payload?.status
        }
    })
}

export const apiUpdateCategory = async (payload: Category) => {
    return ApiConfig(ENDPONTAPI.UPDATE_CATEGORY, {
        payload
    })
}