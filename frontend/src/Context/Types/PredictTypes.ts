interface RequestRecordsInterface{
    columns: [],
    columns_count: number,
    null_summari: {},
    sample_data: []
}

export interface FileAnalyzedInterface{
    data: RequestRecordsInterface;
    file: string;
}