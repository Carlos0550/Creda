import { Button, Input } from '@mantine/core'
import React from 'react'

import "./RegisterForm.css"
import useRegisterForm from './utils/useRegisterForm'
function RegisterForm() {

    const {
        handleInputChange, formValues, errors, onFinish, creatingUser
    } = useRegisterForm()
    return (
        <div className='register-form-container'>
            <form className='register-form' onSubmit={onFinish}>
                <h2>Registrate en Creda</h2>
                <Input.Wrapper label="Ingresá tu nombre" required c={"white"}>
                    <Input
                        placeholder='Jhon Doe'
                        type='text'
                        value={formValues.user_name}
                        name='user_name'
                        onChange={handleInputChange}
                    />
                    {errors?.user_name && (
                        <p style={{color: "#ff2e3f"}}>{errors?.user_name}</p>
                    )}
                </Input.Wrapper>

                <Input.Wrapper label="Ingresá tu correo" required c={"white"}>
                    <Input
                        placeholder='jhondoe@example.com'
                        type='text'
                        onChange={handleInputChange}
                        name='user_email'
                        value={formValues.user_email}
                    />
                    {errors?.user_email && (
                        <p style={{color: "#ff2e3f"}}>{errors?.user_email}</p>
                    )}
                </Input.Wrapper>

                <Input.Wrapper label="Ingresa tu contraseña" required c={"white"}
                    description="Debe ser una contraseña segura de entre 8 y 24 caracteres"
                >
                    <Input
                        onChange={handleInputChange}
                        name='user_password'
                        value={formValues.user_password}
                        type='text'
                    />

                    {errors?.user_password && (
                        <p style={{color: "#ff2e3f"}}>{errors?.user_password}</p>
                    )}
                </Input.Wrapper>

                <Button type='submit'
                    disabled={creatingUser}
                    loading={creatingUser}
                    styles={{
                        label: {
                            color: 'black'
                        },
                        root: {
                            backgroundColor: creatingUser ? "black" : "white"
                        }
                    }}
                >Crear cuenta</Button>
            </form>
        </div>
    )
}

export default RegisterForm