export interface CreateManager{
    manager_name: string,
    manager_email: string,
    manager_password: string,
    manager_verified: boolean
}

export interface LoginManager{
    manager_email: string,
    manager_password: string
}

export interface ResetManagerPassword{
    manager_id: string,
    new_password: string
    confirm_password: string
    email: string;
    url_id: string
}