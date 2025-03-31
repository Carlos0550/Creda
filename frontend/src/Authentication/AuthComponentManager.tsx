import React, { useState } from 'react'
import RegisterForm from './RegisterForm/RegisterForm'

import "./AuthenticationManager.css"
import LoginForm from './LoginForm/LoginForm';
import { Button } from '@mantine/core';
function AuthComponentManager() {
    const [formOption, setFormOption] = useState<1 | 2>(2);

    const handleSwitchForm = (option: 1 | 2) => {
        setFormOption(option)
    }
    return (
        <div className="auth-container">
            <div className="auth-container-items">
                <h1>Bienvenido a Creda</h1>
                {formOption === 1 && (
                    <React.Fragment>
                        <RegisterForm />
                        <Button mt={10} onClick={()=> handleSwitchForm(2)}>Ya tengo cuenta</Button>
                    </React.Fragment>
                )}

                {formOption === 2 && (
                    <React.Fragment>
                        <LoginForm/>
                        <Button mt={10} onClick={()=> handleSwitchForm(1)}>Crear una cuenta</Button>
                    </React.Fragment>
                )}
                
            </div>
        </div>
    )
}

export default AuthComponentManager