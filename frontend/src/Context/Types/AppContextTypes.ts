import { LocaleUserTypes } from "./UserTypes";


interface usersHookInterface{
    createUser: (userData: any) => Promise<boolean>;
    loginUser: (userData: any) => Promise<boolean>;
    getLocaleUserInfo: () => Partial<Record<keyof LocaleUserTypes, string>>;
}

export interface AppContextValuesInterface{
    width: number,
    usersHook: usersHookInterface,
}