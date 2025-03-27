import React, { useEffect, useState } from "react"
import {showNotification} from "@mantine/notifications"
interface formValuesInterface{
    user_name: string,
    user_password: string,
    user_email: string
}

type formErrors = Partial<Record<keyof formValuesInterface, string>>

function useRegisterForm() {
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
            errors["user_name"] = "El nombre debe tener al menos 3 caracteres.";
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues.user_email)) {
            errors["user_email"] = "El correo electrónico ingresado no es válido.";
        }
    
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{8,24}$/;
        if (!passwordRegex.test(formValues.user_password)) {
            errors["user_password"] = "La contraseña debe tener entre 8 y 24 caracteres, incluyendo letras, números y al menos un carácter especial.";
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

    const onFinish = (e: React.FormEvent) => {
        e.preventDefault()
        
        if(handleCheckErrors()){
            showNotification({
                message: "Enviando formulario",
                title: "Formulario válido"
            })
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

    useEffect(()=>{
console.log(errors)
    },[errors])
  return {
    handleInputChange, formValues,
    errors, onFinish
  }
}

export default useRegisterForm