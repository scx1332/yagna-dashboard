import React, { createContext, useCallback, useState } from "react";
export let DEFAULT_BACKEND_URL = "http://127.0.0.1:7465";
export function globalSetDefaultBackendUrl(backendUrl: string) {
    DEFAULT_BACKEND_URL = backendUrl;
}

import BackendSettings from "./common/BackendSettings";

interface BackendSettingsContextType {
    backendSettings: BackendSettings;
    setBackendSettings: (backendSettings: BackendSettings) => void;
    resetSettings: () => void;
}

export const BackendSettingsContext = createContext<BackendSettingsContextType>({
    backendSettings: {
        backendUrl: DEFAULT_BACKEND_URL,
        bearerToken: "66iiOdkvV29",
        enableBearerToken: true,
        yagnaServers: [],
    },
    setBackendSettings: (backendSettings: BackendSettings) => {
        console.error(`setBackendSettings not implemented: ${backendSettings}`);
    },
    resetSettings: () => {
        console.error("resetSettings not implemented");
    },
});

interface BackendSettingsProviderProps {
    children: React.ReactNode;
}

export const BackendSettingsProvider = (props: BackendSettingsProviderProps) => {
    const backendUrl = window.localStorage.getItem("backendUrl") ?? DEFAULT_BACKEND_URL;
    const bearerToken = window.localStorage.getItem("bearerToken") ?? "";
    const enableBearerToken = window.localStorage.getItem("bearerTokenEnabled") === "1" ?? false;
    const yagnaServers = JSON.parse(window.localStorage.getItem("yagnaServers") ?? "[]");

    const defaultBackendSettings = {
        backendUrl: backendUrl,
        bearerToken: bearerToken,
        enableBearerToken: enableBearerToken,
        yagnaServers: yagnaServers,
    };

    const [backendSettings, _setBackendSettings] = useState<BackendSettings>(defaultBackendSettings);
    const setBackendSettings = useCallback(
        (settings: BackendSettings) => {
            window.localStorage.setItem("backendUrl", settings.backendUrl);
            window.localStorage.setItem("bearerToken", settings.bearerToken);
            window.localStorage.setItem("bearerTokenEnabled", settings.enableBearerToken ? "1" : "0");
            window.localStorage.setItem("yagnaServers", JSON.stringify(settings.yagnaServers));
            _setBackendSettings(settings);
        },
        [_setBackendSettings],
    );

    const resetSettings = useCallback(() => {
        const newSettings = {
            backendUrl: DEFAULT_BACKEND_URL,
            bearerToken: "66iiOdkvV29",
            enableBearerToken: true,
            yagnaServers: [],
        };
        setBackendSettings(newSettings);
    }, [setBackendSettings]);

    return (
        <BackendSettingsContext.Provider value={{ backendSettings, setBackendSettings, resetSettings }}>
            {props.children}
        </BackendSettingsContext.Provider>
    );
};
