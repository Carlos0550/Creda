import { createUserFunctionInterface } from "./users.types";

export interface PredicRequestEndpointInterface{
    user_data: Partial<createUserFunctionInterface>;
}

export interface MarkAsAnalyzedEndpointInterface{
    columns: [];
    fileName: string;
}