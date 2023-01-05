import axios, { AxiosRequestConfig } from "axios";

export const PREFIX_API = process.env.REACT_APP_PREFIX_API;
export const ENDPOINT_LOCAL = process.env.REACT_APP_ENDPOINT;

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = `${ENDPOINT_LOCAL}/${PREFIX_API}`;
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.timeout = 20000;
axiosInstance.defaults.headers['Content-Type'] = "application/json";

export const ApiConfig = async (url: string, data?: {
    payload ?: any, 
    params ?: any
}, _method = "POST", apiPrefix = PREFIX_API) => {
    const method = _method.toLowerCase() as AxiosRequestConfig["method"];
    const config: AxiosRequestConfig = {
        url,
        method,
        data: data?.payload, 
        params: data?.params
    };
    if (apiPrefix !== PREFIX_API) config.baseURL = `${ENDPOINT_LOCAL}/${apiPrefix}`;
    //  if (method === 'post') {
    //     return axiosInstance.post(`${url}`, payload, config)
    //         .then(response => {
    //             return response
    //         })
    //         .catch(error => error);
    // }
    return axiosInstance.request(config);
}