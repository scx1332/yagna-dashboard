export interface YagnaServer {
    name: string;
    identity: string;
    role: string;
    version: string;
    url: string;
    appKey: string;
    enabled: boolean;
    lastConnected: string;
}

export default interface BackendSettings {
    backendUrl: string;
    bearerToken: string;
    enableBearerToken: boolean;
    yagnaServers: YagnaServer[];
}
