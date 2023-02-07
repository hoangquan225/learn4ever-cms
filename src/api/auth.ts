import { ApiConfig } from "./config";
import EndPoint from "../submodule/common/endpoint";
import { UserInfo } from "../submodule/models/user";

export const apiGetUserFromToken = (token: string) => {
  return ApiConfig(EndPoint.GET_USER_FROM_TOKEN, {
    payload: {
      token,
    },
  });
};

export const apiLogin = (payload: { account: string; password: string, userRole: number }) => {
  return ApiConfig(EndPoint.LOGIN, { payload });
};
