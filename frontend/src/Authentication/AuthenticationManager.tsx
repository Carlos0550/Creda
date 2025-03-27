import React, { useState } from 'react'
import RegisterForm from './RegisterForm/RegisterForm'

import "./AuthenticationManager.css"
function AuthenticationManager() {
    const [formOption, setFormOption] = useState<number>(0)

    const handleSwitchForm = (option: number) => {
        setFormOption(option)
    }
    return (
        <div className="auth-container">
            <div className="auth-container-items">
                <h1>Bienvenido a Creda</h1>
                {formOption === 0 && (
                    <RegisterForm />
                )}

                {formOption === 1 && (
                    <></>
                )}
            </div>
        </div>
    )
}

export default AuthenticationManager