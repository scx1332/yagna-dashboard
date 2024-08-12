export interface YagnaVersion {
    version: string;
    name: string;
    seen: boolean;
    releaseTs: string;
    insertionTs: string;
    updateTs: string;
}

export interface YagnaIdentity {
    identity: string,
    name: string,
    role: string,
}