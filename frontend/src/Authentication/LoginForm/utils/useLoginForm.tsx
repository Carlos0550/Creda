import { useState } from "react"
import { useAppContext } from "../../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";

interface FormValuesInterface {
    user_email: string,
    user_password: string,
}
type formErrors = Partial<Record<keyof FormValuesInterface, string>>

function useLoginForm() {
    const [formValues, setFormValues] = useState<FormValuesInterface>({
        user_email: "",
        user_password: ""
    });

    const { usersHook: { loginUser, getLocaleUserInfo } } = useAppContext()

    const [errors, setErrors] = useState<formErrors>({
        user_email: "",
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues.user_email)) {
            errors["user_email"] = "El correo electrónico ingresado no es válido.";
        }

        if (!formValues.user_password.trim()) {
            errors["user_password"] = "La contraseña no puede estar vacía";
        }

        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            return false
        } else {
            setErrors({
                user_email: "",
                user_password: ""
            })
            return true
        }
    }

    const [isLogging, setIsLogging] = useState<boolean>(false)
    const navigate = useNavigate()
    const onFinish = async (e: React.FormEvent) => {
        e.preventDefault()

        if (handleCheckErrors()) {
            setIsLogging(true)
            const result = await loginUser(formValues)
            setIsLogging(false)
            if (result) {
                setFormValues({
                    user_email: "",
                    user_password: ""
                })

                const { user_id, user_name } = getLocaleUserInfo()
                if (!user_id) return;
                showNotification({ title: `Bienvenido nuevamente, ${user_name}`, message: "", autoClose: 1500, position: "top-right", color: "green" })
                return navigate(`/home/${user_id}`)
            }
        }
    }
    return {
        errors, handleInputChange, formValues, onFinish, isLogging
    }
}

export default useLoginForm
