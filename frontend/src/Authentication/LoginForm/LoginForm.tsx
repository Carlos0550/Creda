import React from 'react'
import { Button, Input } from "@mantine/core"

import "./LoginForm.css"
import useLoginForm from './utils/useLoginForm'
function LoginForm() {
    const {
        errors, handleInputChange, onFinish, formValues, isLogging
    } = useLoginForm()

    return (
        <div className='login-form-container'>
            <form className='login-form' onSubmit={onFinish}>
                <h2>Iniciá sesión en Creda</h2>

                <Input.Wrapper label="Ingresá tu correo" required c={"white"}>
                    <Input
                        placeholder='jhondoe@example.com'
                        type='text'
                        name='user_email'
                        value={formValues.user_email}
                        onChange={handleInputChange}
                    />
                    {errors.user_email && (
                        <p
                            style={{ color: "red" }}
                        >
                            {errors.user_email}
                        </p>
                    )}
                </Input.Wrapper>

                <Input.Wrapper label="Ingresa tu contraseña" required c={"white"} >
                    <Input
                        name='user_password'
                        type='text'
                        value={formValues.user_password}
                        onChange={handleInputChange}
                    />

                    {errors.user_password && (
                        <p
                            style={{ color: "red" }}
                        >
                            {errors.user_password}
                        </p>
                    )}
                </Input.Wrapper>

                <Button type='submit'
                    disabled= {isLogging}
                    loading={isLogging}
                    styles={{
                        label: {
                            color: 'black',
                        },
                        root: {
                            backgroundColor: isLogging ? "black" : "white"

                        }

                    }}
                >Iniciá sesión</Button>
            </form>
        </div>
    )
}

export default LoginForm
