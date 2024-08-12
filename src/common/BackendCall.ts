import BackendSettings, {YagnaServer} from "./BackendSettings";
import {YagnaIdentity, YagnaVersion} from "../model/YagnaVersion";

interface BackendFetch {
    method?: string;
    body?: string;
    headers?: Headers;
}

export async function getYangaServerInfo(backendSettings: BackendSettings): Promise<YagnaServer> {
    let version: YagnaVersion;
    let identity: YagnaIdentity;
    {
        const response = await backendFetch(backendSettings, "/version/get");
        if (response.type === "opaque") {
            throw `Failed to connect to ${backendSettings.backendUrl} due to CORS policy`;
        }
        const responseBody = await response.text();
        const response_json = JSON.parse(responseBody);
        version = response_json["current"];
    }
    {
        const response = await backendFetch(backendSettings, "/me");
        if (response.type === "opaque") {
            throw `Failed to connect to ${backendSettings.backendUrl} due to CORS policy`;
        }
        const responseBody = await response.text();
        const response_json = JSON.parse(responseBody);
        identity = response_json;
    }
    return {
        name: identity.name,
            identity: identity.identity,
        role: identity.role,
        version: version.version,
        url: backendSettings.backendUrl,
        appKey: backendSettings.bearerToken,
        enabled: true,
        lastConnected: new Date().toISOString(),
        lastError: null,
    }
}

export function backendFetchYagna(yagnaServer: YagnaServer, uri: string, params?: BackendFetch): Promise<Response> {
    const headers = params?.headers ?? new Headers();
    const method = params?.method ?? "GET";
    const body = params?.body;

    let url = uri;
    if (uri.startsWith("/")) {
        if (yagnaServer.url.endsWith("/")) {
            url = yagnaServer.url + uri.substring(1);
        } else {
            url = yagnaServer.url + uri;
        }
    } else {
        throw new Error("Uri must start with /");
    }

    headers.append("Authorization", "Bearer " + yagnaServer.appKey);
    if (body) {
        headers.append("Content-Type", "application/json");
    }
    console.log("Calling backend: " + url);

    return fetch(url, {
        method: method,
        headers: headers,
        body: body,
    });
}

export function backendFetch(backendSettings: BackendSettings, uri: string, params?: BackendFetch): Promise<Response> {
    const headers = params?.headers ?? new Headers();
    const method = params?.method ?? "GET";
    const body = params?.body;

    console.log("Backend fetch: ", backendSettings, uri, params);
    let url = uri;
    if (uri.startsWith("/")) {
        if (backendSettings.backendUrl.endsWith("/")) {
            url = backendSettings.backendUrl + uri.substring(1);
        } else {
            url = backendSettings.backendUrl + uri;
        }
    } else {
        throw new Error("Uri must start with /");
    }

    if (backendSettings.enableBearerToken) {
        headers.append("Authorization", "Bearer " + backendSettings.bearerToken);
    }
    if (body) {
        headers.append("Content-Type", "application/json");
    }
    console.log("Calling backend: " + url);

    return fetch(url, {
        method: method,
        headers: headers,
        body: body,
    });
}
