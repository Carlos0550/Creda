export interface RedisFileMetadata {
    file_name: string; 
    file_path: string; 
    file_type: string; 
    file_size: string; 
    created_at: string;
    status: "pending" | "completed"
}

export interface FileMetadataWithKey extends RedisFileMetadata {
    key: string;
}