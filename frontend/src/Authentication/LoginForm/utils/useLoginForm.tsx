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

    const [errors, setErrors] = useState<formErrors>({})
    const [authError, setAuthError] = useState<string>("")

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: value
        }))
        
        if (errors[name as keyof FormValuesInterface]) {
            setErrors({
                ...errors,
                [name]: ""
            })
        }
        
        if (authError) {
            setAuthError("")
        }
    }

    const handleCheckErrors = () => {
        let newErrors: formErrors = {};
        
        if (!formValues.user_email.trim()) {
            newErrors["user_email"] = "Email is required";
        } else {

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formValues.user_email)) {
                newErrors["user_email"] = "Please enter a valid email address";
            }
        }

        if (!formValues.user_password.trim()) {
            newErrors["user_password"] = "Password is required";
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0;
    }

    const [isLogging, setIsLogging] = useState<boolean>(false)
    const navigate = useNavigate()
    
    const onFinish = async (e: React.FormEvent) => {
        e.preventDefault()
        setAuthError("")

        if (handleCheckErrors()) {
            setIsLogging(true)
            try {
                const result = await loginUser(formValues)
                setIsLogging(false)
                
                if (result) {
                    setFormValues({
                        user_email: "",
                        user_password: ""
                    })

                    const { user_id, user_name } = getLocaleUserInfo()
                    if (!user_id) {
                        setAuthError("Failed to retrieve user information")
                        return
                    }
                    
                    showNotification({ 
                        title: `Welcome back, ${user_name}`, 
                        message: "", 
                        autoClose: 1500, 
                        position: "top-right", 
                        color: "green" 
                    })
                    
                    return navigate(`/home/${user_id}`)
                } else {
                    setAuthError("Invalid email or password")
                }
            } catch (error) {
                setIsLogging(false)
                setAuthError("Connection error. Please try again.")
                console.error("Login error:", error)
            }
        }
    }
    
    return {
        errors, 
        handleInputChange, 
        formValues, 
        onFinish, 
        isLogging,
        authError
    }
}

export default useLoginForm