import { createUserFunctionInterface } from "./users.types";

export interface PredicRequestEndpointInterface{
    user_data: Partial<createUserFunctionInterface>;
}

interface RequestRecordsInterface{
    columns: [],
    columns_count: number,
    null_summari: {},
}
export interface MarkAsAnalyzedEndpointInterface{
    records: RequestRecordsInterface;
    fileName: string;
}