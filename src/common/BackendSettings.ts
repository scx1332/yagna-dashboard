export interface YagnaServer {
    name: string;
    identity: string;
    role: string;
    version: string;
    url: string;
    appKey: string;
    enabled: boolean;
    lastConnected: string;
    lastError: string | null;
}

export default interface BackendSettings {
    yagnaServers: YagnaServer[];
}


