interface createUserFunctionInterface{
    user_name: string,
    user_password: string,
    user_email: string,
}

interface loginUserFunctionInterface{
    user_password: string,
    user_email: string,
}

export {
    createUserFunctionInterface, loginUserFunctionInterface
}