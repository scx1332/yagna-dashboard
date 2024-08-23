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


export function getYagnaServerById(settings: BackendSettings, id: string): YagnaServer {
    const entries =  settings.yagnaServers.filter(server => server.identity === id);
    if (entries.length === 0) {
        throw new Error("No server found with id: " + id);
    }
    const entriesSorted = entries.sort((a, b) => {
        //todo - return most important role
        return a.role.localeCompare(b.role);
    });
    return entriesSorted[0];
}

