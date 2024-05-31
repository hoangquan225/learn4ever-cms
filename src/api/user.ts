import { ApiConfig } from "./config";
import EndPoint from "../submodule/common/endpoint";
import { UserInfo } from "../submodule/models/user";
import ENDPONTAPI from "../submodule/common/endpoint";

export const apiGetAllUser = async (params) => {
  return ApiConfig(
    // ENDPONTAPI.GET_ALL_USER
    "/cms/user/get-all-user", {
      params
    }
  );
};

export const apiUpdateUser = async (payload: {status: number}) => {
  return ApiConfig("/cms/user/update-status-user", {
    payload
  });
};
