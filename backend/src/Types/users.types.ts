interface createUserFunctionInterface{
    user_name: string,
    user_password: string,
    user_email: string,
}

interface loginUserFunctionInterface{
    user_password: string,
    user_email: string,
}
type ResponseUserTypes = {
    user_id: string,
    user_name: string,
    user_email: string,
    user_password: string
}

export {
    createUserFunctionInterface, loginUserFunctionInterface, ResponseUserTypes
}