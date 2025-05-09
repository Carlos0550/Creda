import { Button, Input } from '@mantine/core'
import React from 'react'

import "./RegisterForm.css"
import useRegisterForm from './utils/useRegisterForm'
function RegisterForm() {

    const {
        handleInputChange, formValues, errors, onFinish, creatingUser
    } = useRegisterForm()
    return (
        <div className='w-full'>
            <form className='space-y-6' onSubmit={onFinish}>
                <h2 className="text-2xl font-medium text-center text-slate-700 mb-6">
                Register
                </h2>
                
                <div className="space-y-4">
                    <Input.Wrapper 
                        label="Enter your name" 
                        required
                        styles={{
                            label: {
                                color: "#334155",
                                fontWeight: 500,
                                marginBottom: "4px",
                            },
                        }}
                    >
                        <Input
                            placeholder='Jhon Doe'
                            type='text'
                            value={formValues.manager_name}
                            name='manager_name'
                            onChange={handleInputChange}
                            styles={{
                                input: {
                                    borderColor: errors?.manager_name ? "#ef4444" : "#e2e8f0",
                                    borderRadius: "9999px",
                                    "&:focus": {
                                        borderColor: "#3b82f6",
                                        boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                                    },
                                },
                            }}
                        />
                        {errors?.manager_name && (
                            <p className="mt-1 text-sm text-red-500">{errors?.manager_name}</p>
                        )}
                    </Input.Wrapper>

                    <Input.Wrapper 
                        label="Enter your email" 
                        required
                        styles={{
                            label: {
                                color: "#334155",
                                fontWeight: 500,
                                marginBottom: "4px",
                            },
                        }}
                    >
                        <Input
                            placeholder='jhondoe@example.com'
                            type='email'
                            onChange={handleInputChange}
                            name='manager_email'
                            value={formValues.manager_email}
                            styles={{
                                input: {
                                    borderColor: errors?.manager_email ? "#ef4444" : "#e2e8f0",
                                    borderRadius: "9999px",
                                    "&:focus": {
                                        borderColor: "#3b82f6",
                                        boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                                    },
                                },
                            }}
                        />
                        {errors?.manager_email && (
                            <p className="mt-1 text-sm text-red-500">{errors?.manager_email}</p>
                        )}
                    </Input.Wrapper>

                    <Input.Wrapper 
                        label="Enter your password" 
                        required
                        styles={{
                            label: {
                                color: "#334155",
                                fontWeight: 500,
                                marginBottom: "4px",
                            },
                            description: {
                                fontSize: "0.875rem",
                                color: "#64748b",
                            },
                        }}
                        description="It must be a secure password between 8 and 24 characters."
                    >
                        <Input
                            onChange={handleInputChange}
                            name='manager_password'
                            value={formValues.manager_password}
                            type='password'
                            styles={{
                                input: {
                                    borderColor: errors?.manager_password ? "#ef4444" : "#e2e8f0",
                                    borderRadius: "9999px",
                                    "&:focus": {
                                        borderColor: "#3b82f6",
                                        boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                                    },
                                },
                            }}
                        />
                        {errors?.manager_password && (
                            <p className="mt-1 text-sm text-red-500">{errors?.manager_password}</p>
                        )}
                    </Input.Wrapper>
                </div>

                <div className="flex justify-center mt-6">
                    <Button 
                        type='submit'
                        disabled={creatingUser}
                        loading={creatingUser}
                        styles={{
                            root: {
                                backgroundColor: creatingUser ? "#93c5fd" : "#3b82f6",
                                borderRadius: "9999px",
                                height: "2.75rem",
                                padding: "0 2.5rem",
                                minWidth: "12rem",
                                maxWidth: "18rem",
                                width: "100%",
                                transition: "background-color 0.2s",
                                "&:hover": {
                                    backgroundColor: "#2563eb",
                                },
                                "&:disabled": {
                                    backgroundColor: "#bfdbfe",
                                    opacity: 0.7,
                                },
                            },
                            label: {
                                color: "white",
                                fontWeight: 500,
                                fontSize: "0.95rem",
                            },
                        }}
                    >
                        Create account
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default RegisterForm