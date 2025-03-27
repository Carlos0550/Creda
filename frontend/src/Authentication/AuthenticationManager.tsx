import React, { useState } from 'react'
import RegisterForm from './RegisterForm/RegisterForm'

import "./AuthenticationManager.css"
function AuthenticationManager() {
    const [formOption, setFormOption] = useState<1 | 2>(1);

    const handleSwitchForm = (option: 1 | 2) => {
        setFormOption(option)
    }
    return (
        <div className="auth-container">
            <div className="auth-container-items">
                <h1>Bienvenido a Creda</h1>
                {formOption === 1 && (
                    <RegisterForm />
                )}

                {formOption === 2 && (
                    <></>
                )}
            </div>
        </div>
    )
}

export default AuthenticationManager