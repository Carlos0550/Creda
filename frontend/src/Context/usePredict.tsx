import React, { useCallback, useMemo, useState } from 'react'
import { globalApis } from './APIs'

import { showNotification } from "@mantine/notifications"
function usePredict() {
    const [uploading, setUploading] = useState(false)
    const sendFile = useCallback(async(file:File) => {
        const url = new URL(globalApis.predict + "/analyze-file")
        const formData = new FormData()

        formData.append("file", file)
        const user_data = localStorage.getItem("user_data")
        formData.append("user_data", user_data || "")
       
        try {
            setUploading(true)
            const response = await fetch(url,{
                method: "POST",
                body: formData
            })
            const responseData = await response.json()
            if(!response.ok){
                showNotification({
                    title: "Error al hacer la predicción.",
                    message: responseData.msg || "Error desconocido.",
                    autoClose: 3500,
                    position: "top-right",
                    color: "yellow"
                })

                return false;
            }

            showNotification({
                title: "Aguarde un segundo...",
                message: "Estamos procesando el archivo que enviaste, por favor aguarda...",
                loading: true,
                autoClose: 3500,
                position: "top-right",
                color: "blue"
            })
            return true
        } catch (error) {
            console.log(error)
            showNotification({
                title: "Error al hacer la predicción.",
                message: error.message || "Error desconocido.",
                autoClose: 4500,
                position: "top-right",
                color: "red"
            })

            return false;
        }finally{
            setUploading(false)
        }
    },[])


    return useMemo(() => ({
        uploading, sendFile
    }), [
        uploading, sendFile
    ])
}

export default usePredict
