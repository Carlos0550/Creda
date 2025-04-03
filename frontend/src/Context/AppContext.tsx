import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppContextValuesInterface } from "./Types/AppContextTypes";
import useUsers from "./useUsers";
import usePredict from "./usePredict";

const AppContext = createContext<AppContextValuesInterface | undefined>(undefined)

export const useAppContext = () => {
    const ctx = useContext(AppContext)

    if(!ctx){
        throw new Error("El AppContextProvider debe ser usado en la raiz del proyecto")
    }
    return ctx
};


export const AppContextProvider = ({children}: any) => {
    const [width, setWidth] = useState(innerWidth)

    useEffect(()=>{
        const resizeE = () => setWidth(window.innerWidth)
        window.addEventListener("resize", resizeE)

        return () => window.removeEventListener("resize", resizeE)
    },[])
    
    const usersHook = useUsers()

    const usePredictHook = usePredict()

    const contextValues = useMemo(() => ({
        width,
        usersHook,
        usePredictHook
    }),[
        usePredictHook,
        usersHook
    ])
    return (
    <AppContext.Provider value={contextValues}>
        {children}
    </AppContext.Provider>
    )
}