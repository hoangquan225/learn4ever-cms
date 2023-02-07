import { LoadingOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { notification } from 'antd';
import Cookies from 'js-cookie';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { apiGetUserFromToken } from '../api/auth'
import { authState, requestGetUserFromToken } from '../redux/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { UserInfo } from '../submodule/models/user';

const PrivateRoute = () => {
    const dispatch = useAppDispatch()
    const authStates = useAppSelector(authState)
    useLayoutEffect(() => {
        if(!authStates.userInfo?._id)
        checkLogin()
    }, [])

    const checkLogin = async () => {
        const cookie = Cookies.get("tokenAdmin");
        try {
            const result = await dispatch(
                requestGetUserFromToken({ token: cookie || "" })
            );
            unwrapResult(result);
        } catch (error) {
            if (cookie)
                notification.error({
                    message: "Server đang bị lỗi",
                });
        }
    }

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return authStates.loadingCheckLogin ? (
        <LoadingOutlined size={100} />
    ): (
        authStates.userInfo?._id ? <Outlet /> : <Navigate to="/dang-nhap" />
    );
}

export default PrivateRoute