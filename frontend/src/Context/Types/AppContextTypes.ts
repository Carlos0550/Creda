import { FileAnalyzedInterface } from "./PredictTypes";
import { LocaleUserTypes } from "./UserTypes";


interface usersHookInterface{
    createUser: (userData: any) => Promise<boolean>;
    loginUser: (userData: any) => Promise<boolean>;
    getLocaleUserInfo: () => Partial<Record<keyof LocaleUserTypes, string>>;
    logout: () => void;
}

interface usePredictHookInterface{
    uploading: boolean;
    sendFile: (file: File) => Promise<boolean>;
    pendingColumns: boolean;
    verifyPendingFilesForUser: () => Promise<boolean>;
    gettingPendingFiles: boolean;
    userId: string;
    currentFileData: FileAnalyzedInterface
}

export interface AppContextValuesInterface{
    width: number;
    usersHook: usersHookInterface;
    usePredictHook: usePredictHookInterface;
}