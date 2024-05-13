import ENDPONTAPI from "../submodule/common/endpoint"
import { ApiUploadFile } from "./config"

export const apiUploadFile = async (file: any) => {
    return ApiUploadFile(ENDPONTAPI.UPLOAD, file)
}

export const apiUploadMultipleVideo =async (files:any, setProgress?: any, onProgress?: any) => {
    return ApiUploadFile(ENDPONTAPI.UPLOAD_MULTIPLE_VIDEO, files, setProgress, onProgress)
}

export const apiUploadExcel = async (file:any) => {
    return ApiUploadFile("/read-excel-to-json", file)
}
