interface usersHookInterface{
    createUser: (userData: any) => Promise<boolean>;
}

export interface AppContextValuesInterface{
    width: number,
    usersHook: usersHookInterface,
}