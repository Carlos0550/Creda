import React, { useCallback, useMemo } from 'react'
import { globalApis } from './APIs'
import { showNotification } from '@mantine/notifications'

function useUsers() {
    const createUser = useCallback(async (userData: any) => {
        const url = new URL(globalApis.users + "/create-user")
        console.log(url)
        try {
            const result = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })

            const responseData = await result.json()
            if (!result.ok) {
                showNotification({
                    title: "No fue posible crear su cuenta",
                    message: responseData.msg || "Error desconocido",
                    position: "top-right",
                    autoClose: 3500,
                    color: "red"
                })
                return false
            }

            showNotification({
                title: "Cuenta creada con éxito",
                message: responseData.msg,
                position: "top-right",
                autoClose: 3500,
                color: "green"
            })

            return true
        } catch (error) {
            console.log(error)
            showNotification({
                title: "No fue posible crear su cuenta",
                message: error.message || "Error desconocido",
                position: "top-right",
                autoClose: 5000,
                color: "red"
            })

            return false;
        };
    }, []);

    const loginUser = useCallback(async (userData: any) => {
        const url = new URL(globalApis.users + "/login-user")
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const responseData = await response.json()
            if (!response.ok) {
                showNotification({
                    title: "Error al iniciar sesión",
                    message: responseData.msg || "Error desconocido.",
                    position: "top-right",
                    autoClose: 3500,
                    color: "yellow"
                })

                return false
            };
            showNotification({
                title: "Iniciaste sesión correctamente.",
                message: responseData.msg || "Un momento...",
                position: "top-right",
                autoClose: 2500,
                color: "blue"
            })
            const respondeUserData = responseData.userData
            localStorage.setItem("user_data", JSON.stringify(respondeUserData))
            return true

        } catch (error) {
            console.log(error)
            showNotification({
                title: "Error al iniciar sesión",
                message: error.message || "Error desconocido.",
                position: "top-right",
                autoClose: 5500,
                color: "red"
            })

            return false
        }
    }, [])

    const getLocaleUserInfo = useCallback(() => {
        const locale_user = localStorage.getItem("user_data")
        if (!locale_user) {
            showNotification({
                title: "No se encontraron datos del usuario.",
                message: "Intente iniciar sesion nuevamente,",
                autoClose: 3500,
                position: "top-right",
                color: "yellow"
            })

            return undefined
        }
        const user_info = JSON.parse(locale_user)
        return user_info
    }, [loginUser])

    return useMemo(() => ({
        createUser, loginUser, getLocaleUserInfo
    }), [
        createUser, loginUser, getLocaleUserInfo
    ])
}

export default useUsers