import React, { useCallback, useMemo } from 'react'
import { globalApis } from './APIs'
import { showNotification } from '@mantine/notifications'

function useUsers() {
    const createUser = useCallback(async (userData: any) => {
        const url = new URL(globalApis.users + "/create-user")
        console.log(url)
        try {
            const result = await fetch(url,{
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })

            const responseData = await result.json()
            if(!result.ok){ showNotification({
                title:"No fue posible crear su cuenta",
                message: responseData.msg || "Error desconocido",
                position: "top-right",
                autoClose: 3500,
                color: "red"
            })
            return false
        }

            showNotification({
                title:"Cuenta creada con éxito",
                message: responseData.msg,
                position: "top-right",
                autoClose: 3500,
                color: "green" 
            })

            return true
        } catch (error) {
            console.log(error)
            showNotification({
                title:"No fue posible crear su cuenta",
                message: error.message || "Error desconocido",
                position: "top-right",
                autoClose: 5000,
                color: "red"
            })

            return false;
        };
    },[]);
  
    return useMemo(()=> ({
        createUser
  }),[
        createUser
  ])
}

export default useUsers