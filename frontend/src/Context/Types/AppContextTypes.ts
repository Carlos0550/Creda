import { LocaleUserTypes } from "./UserTypes";


interface usersHookInterface{
    createUser: (userData: any) => Promise<boolean>;
    loginUser: (userData: any) => Promise<boolean>;
    getLocaleUserInfo: () => Partial<Record<keyof LocaleUserTypes, string>>;
}

interface usePredictHookInterface{
    uploading: boolean;
    sendFile: (file: File) => Promise<boolean>;
    pendingColumns: boolean
}

export interface AppContextValuesInterface{
    width: number;
    usersHook: usersHookInterface;
    usePredictHook: usePredictHookInterface;
}