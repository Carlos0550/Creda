import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { globalApis } from './APIs'

import { showNotification } from "@mantine/notifications"
function usePredict() {
    const [uploading, setUploading] = useState(false)
    const [userId, setUserId] = useState<string | null>("")

    useEffect(()=>{
        const user_data = localStorage.getItem("user_data")
        const parsedData = user_data ? JSON.parse(user_data) : {}
        
        if(Object.keys(parsedData).length > 0) setUserId(parsedData.user_id)
    },[])


    const [pendingColumns, setPendingColumns] = useState(false)

    const sendFile = useCallback(async(file:File) => {
        const url = new URL(globalApis.predict + "/analyze-file")
        const formData = new FormData()

        formData.append("file", file)
        formData.append("user_id", userId || "")
       
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
            setPendingColumns(true)
            showNotification({
                title: "Aguarde un segundo...",
                message: "En cola de análisis...",
                loading: true,
                autoClose: 2500,
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
    },[userId])

    const [currentFileColumns, setCurrentFileColumns] = useState([])
    const verifyFileState = useCallback(async()=> {
        const url = new URL(globalApis.predict + "/file-status")
        url.searchParams.append("status", "analyzed")
        url.searchParams.append("userId", userId ? userId.toString() : "")
        try {
            const response = await fetch(url)   
            const responseData = await response.json()
            if(response.status === 404) return;
            if(!response.ok) throw new Error(responseData.msg || "Error desconocido")

            setPendingColumns(false)
            showNotification({
                title:"Análisis completado.",
                message: "",
                autoClose: 2500,
                color: "green",
                position: "top-right"
            });
            console.log(responseData)
            setCurrentFileColumns(responseData.columns)

            return true
        } catch (error) {
            console.log(error)
            showNotification({
                title:"Error al completar el análisis",
                message: error.message,
                autoClose: 5500,
                color: "red",
                position: "top-right"
            });

            return false
        }
    },[userId])

    useEffect(()=>{
        if (!pendingColumns) return;

        const timer = setInterval(() => {
            verifyFileState()
        }, 5000);

        return () => clearInterval(timer)
    },[pendingColumns, verifyFileState])

    return useMemo(() => ({
        uploading, sendFile, pendingColumns
    }), [
        uploading, sendFile, pendingColumns
    ])
}

export default usePredict
