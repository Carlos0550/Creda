import React, { useEffect, useState } from "react"
import {showNotification} from "@mantine/notifications"
import { useAppContext } from "../../../Context/AppContext"
interface formValuesInterface{
    user_name: string,
    user_password: string,
    user_email: string
}

type formErrors = Partial<Record<keyof formValuesInterface, string>>

function useRegisterForm() {
    const { 
        usersHook:{
            createUser
        }
    } = useAppContext()

    const [formValues, setFormValues] = useState<formValuesInterface>({
        user_email: "",
        user_name: "",
        user_password: ""
    })

    const [errors, setErrors] = useState<formErrors>({
        user_email: "",
        user_name: "",
        user_password: ""
    })

    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: value
        }))
    }

    const handleCheckErrors = () => {
        let errors: formErrors = {};

        if (formValues.user_name.trim().length < 3) {
            errors["user_name"] = "The name must have at least 3 characters.";
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues.user_email)) {
            errors["user_email"] = "The email address entered is not valid.";
        }
    
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,24}$/;
        if (!passwordRegex.test(formValues.user_password)) {
            errors["user_password"] = "The password must be between 8 and 24 characters, including letters, numbers, and at least one special character.";
        }
    
        if(Object.keys(errors).length > 0){
            setErrors(errors)
            return false
        }else{
            setErrors({
                user_email: "",
                user_name: "",
                user_password: ""
            })
            return true
        }
    }

    const [creatingUser, setCreatingUser] = useState<boolean>(false)
    const onFinish = async(e: React.FormEvent) => {
        e.preventDefault()
        
        if(handleCheckErrors()){
            try {
                setCreatingUser(true)
                const result = await createUser(formValues)
                setCreatingUser(false)

                if(result){
                    return setFormValues({
                        user_email: "",
                        user_name: "",
                        user_password: ""
                    })
                }
            } catch (error) {
                console.log(error)
            }
        }else{
            showNotification({
                title:"No fue posible enviar crear su cuenta",
                message: "Hay algunos errores en el formulario, verifique todos los campos e intente nuevamente.",
                autoClose: 4500,
                position: "top-right",
                color: "red"
            })
        }
    }

  return {
    handleInputChange, formValues,
    errors, onFinish, creatingUser
  }
}

export default useRegisterForm