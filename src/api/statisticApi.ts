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