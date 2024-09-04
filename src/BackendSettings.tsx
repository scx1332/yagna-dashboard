import React, { useContext, useEffect } from "react";
import "./BackendSettings.css";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { getYangaServerInfo } from "./common/BackendCall";
import { YagnaServer } from "./common/BackendSettings";
import DateBox from "./DateBox";

interface YagnaServerNodeProps {
    server: YagnaServer;
}

const YagnaServerNode = (props: YagnaServerNodeProps) => {
    return (
        <table className="yagna-node-table">
            <tbody>
                <tr>
                    <th>Node Id:</th>
                    <td>{props.server.identity}</td>
                </tr>
                <tr>
                    <th>Key name</th>
                    <td>{props.server.name}</td>
                </tr>
                <tr>
                    <th>Key role</th>
                    <td>{props.server.role}</td>
                </tr>
                <tr>
                    <th>Node version</th>
                    <td>{props.server.version}</td>
                </tr>
                <tr>
                    <th>Url</th>
                    <td>{props.server.url}</td>
                </tr>
                <tr>
                    <th>AppKey</th>
                    <td>{props.server.appKey}</td>
                </tr>
                <tr>
                    <th>Enabled</th>
                    <td>{props.server.enabled ? "active" : "inactive"}</td>
                </tr>
                <tr>
                    <th>Last connected</th>
                    <td>
                        <DateBox date={props.server.lastConnected} title="" />
                    </td>
                </tr>
                <tr>
                    <th>Last error</th>

                    <td style={{ color: "red" }}>
                        {props.server.lastError && <DateBox date={props.server.lastError} title="" />}
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

const BackendSettingsBox = () => {
    const { backendSettings, setBackendSettings, resetSettings } = useContext(BackendSettingsContext);

    const [backendUrl, setBackendUrl] = React.useState("");
    const backendChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBackendUrl(e.target.value);
    };
    const [bearerToken, setBearerToken] = React.useState("");
    const [enableBearerToken, setEnableBearerToken] = React.useState(true);

    const bearerEnabledChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnableBearerToken(e.target.checked);
    };
    const bearerChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBearerToken(e.target.value);
    };

    const [updateToken, setUpdateToken] = React.useState(0);

    const [checkInProgress, setCheckInProgress] = React.useState(false);
    const [checkSuccessful, setCheckSuccessful] = React.useState(false);
    const [checkResponse, setCheckResponse] = React.useState("");
    const [checkError, setCheckError] = React.useState("");
    const [checkData, setCheckData] = React.useState<YagnaServer | null>(null);
    const check = async () => {
        //
        const settingsToCheck = {
            url: backendUrl,
            appKey: bearerToken,
        };
        setCheckResponse(`Connecting to ${backendUrl} ...`);
        setCheckInProgress(true);
        setCheckSuccessful(false);
        setCheckData(null);
        setCheckError("");
        try {
            const server = await getYangaServerInfo(settingsToCheck);

            setCheckInProgress(false);
            setCheckResponse(`Success`);
            setCheckSuccessful(true);
            setCheckData(server);
        } catch (e) {
            setCheckError(`Failed to connect to ${backendUrl}`);
            setCheckInProgress(false);
        }
    };

    const checkAll = async () => {
        const checkedServers = [];
        for (const server of backendSettings.yagnaServers) {
            try {
                const updateServer = await getYangaServerInfo(server);
                checkedServers.push(updateServer);
            } catch (e) {
                server.lastError = new Date().toISOString();
                checkedServers.push(server);
            }
        }
        const newSettings = backendSettings;
        newSettings.yagnaServers = checkedServers;
        setBackendSettings(newSettings);
        setUpdateToken(updateToken + 1);
    };

    const cancelChanges = () => {
        setBackendUrl("");
        setBearerToken("");
        setEnableBearerToken(true);
    };
    const saveAndAdd = () => {
        if (checkData === null) {
            return;
        }
        const newSettings = backendSettings;

        for (let i = 0; i < newSettings.yagnaServers.length; i++) {
            if (
                newSettings.yagnaServers[i].identity === checkData.identity &&
                newSettings.yagnaServers[i].appKey === checkData.appKey
            ) {
                setCheckError("Server with specified identity and app-key already added");
                return;
            }
        }
        newSettings.yagnaServers.push(checkData);
        setCheckSuccessful(false);
        setBackendSettings(newSettings);
        setUpdateToken(updateToken + 1);
    };

    const resetToDefault = () => {
        resetSettings();
    };

    function moveUp(no: number) {
        return () => {
            const newSettings = backendSettings;
            for (const [server_no, server] of newSettings.yagnaServers.entries()) {
                if (server_no === no) {
                    if (server_no === 0) {
                        window.alert("Main server is already set");
                        return;
                    }
                    [newSettings.yagnaServers[server_no - 1], newSettings.yagnaServers[server_no]] = [
                        newSettings.yagnaServers[server_no],
                        newSettings.yagnaServers[server_no - 1],
                    ];
                    setBackendSettings(newSettings);
                    setUpdateToken(updateToken + 1);
                    return;
                }
            }
        };
    }
    function checkConnection(id: string, appKey: string, url: string) {
        return () => {
            window.alert("Not implemented yet");
        };
    }

    function forgetConnection(id: string, appKey: string, url: string) {
        return () => {
            if (!window.confirm("Are you sure you want to forget this connection?")) {
                return;
            }
            const newSettings = backendSettings;

            const retainElements = [];
            for (const server of newSettings.yagnaServers) {
                if (server.identity !== id || server.appKey !== appKey || server.url !== url) {
                    retainElements.push(server);
                }
            }
            newSettings.yagnaServers = retainElements;
            setBackendSettings(newSettings);
            setUpdateToken(updateToken + 1);
        };
    }

    const backendList = () => {
        return (
            <div>
                <h1>Connected yagna servers:</h1>

                <div>
                    {backendSettings.yagnaServers.map((server, i) => (
                        <div key={i} className="yagna-server-entry">
                            <h3>No {i}</h3>
                            <YagnaServerNode server={server} />
                            <div className="yagna-server-entry-button-list">
                                <button disabled={i == 0} onClick={moveUp(i)}>
                                    Move up
                                </button>
                                <button onClick={checkConnection(server.identity, server.appKey, server.url)}>
                                    Check connection
                                </button>
                                <button onClick={forgetConnection(server.identity, server.appKey, server.url)}>
                                    Forget connection
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={"backend-settings"}>
            <div>Backend settings</div>
            <hr />
            <div>{checkResponse}</div>
            <div className="backend-check-error">{checkError}</div>

            {checkSuccessful && checkData && <YagnaServerNode server={checkData} />}

            <input type="button" value="Check All" onClick={checkAll} />
            {backendList()}
            <h3>Backend URL:</h3>
            <input type="text" value={backendUrl} onChange={backendChanged} />
            <hr />
            <h3>Backend security:</h3>
            <p>
                <span style={{ fontWeight: "bold" }}>Bearer authentication</span> - token is added to bearer header
                value. When using Yagna backend it is appkey
            </p>
            <div>
                <label>
                    <input type="checkbox" checked={enableBearerToken} onChange={bearerEnabledChanged} />
                    Enabled
                </label>
            </div>
            <input type="text" value={bearerToken} onChange={bearerChanged} disabled={!enableBearerToken} />
            <hr />

            <div className="box-line">
                <input type="button" value="Check" onClick={check} disabled={checkInProgress} />
                <input type="button" value="Add" onClick={saveAndAdd} disabled={!checkSuccessful} />
                <input type="button" value="Reset to default" onClick={resetToDefault} />
            </div>
        </div>
    );
};

export default BackendSettingsBox;
