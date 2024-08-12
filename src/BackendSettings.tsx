import React, {useContext, useEffect} from "react";
import "./BackendSettings.css";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {backendFetch} from "./common/BackendCall";
import { YagnaVersion, YagnaIdentity} from "./model/YagnaVersion";
import {YagnaServer} from "./common/BackendSettings";
import {DateTime} from "luxon";
import DateBox from "./DateBox";

interface YagnaServerNodeProps {
    server: YagnaServer;
}

const YagnaServerNode = (props: YagnaServerNodeProps) => {
    return <table className="yagna-node-table">
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
            <td>{props.server.enabled ? "active":"inactive"}</td>
        </tr>
        <tr>
            <th>Last connected</th>
            <td><DateBox date={props.server.lastConnected} title=""/></td>
        </tr>


        </tbody>
    </table>
}

const BackendSettingsBox = () => {
    const {backendSettings, setBackendSettings, resetSettings} = useContext(BackendSettingsContext);

    const [backendUrl, setBackendUrl] = React.useState(backendSettings.backendUrl);
    const backendChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBackendUrl(e.target.value);
    };
    const [bearerToken, setBearerToken] = React.useState(backendSettings.bearerToken);
    const [enableBearerToken, setEnableBearerToken] = React.useState(backendSettings.enableBearerToken);

    const bearerEnabledChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnableBearerToken(e.target.checked);
    };
    const bearerChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBearerToken(e.target.value);
    };

    const [checkInProgress, setCheckInProgress] = React.useState(false);
    const [checkSuccessful, setCheckSuccessful] = React.useState(false);
    const [checkResponse, setCheckResponse] = React.useState("");
    const [checkError, setCheckError] = React.useState("");
    const [checkData, setCheckData] = React.useState<YagnaServer | null>(null);
    const check = async () => {
        //
        const settingsToCheck = {
            backendUrl: backendUrl,
            bearerToken: bearerToken,
            enableBearerToken: true,
            yagnaServers: [],
        };
        setCheckResponse(`Connecting to ${backendUrl} ...`);
        setCheckInProgress(true);
        setCheckSuccessful(false);
        setCheckData(null)
        setCheckError("");
        try {
            let version: YagnaVersion;
            let identity: YagnaIdentity;
            {
                const response = await backendFetch(settingsToCheck, "/version/get");
                if (response.type === "opaque") {
                    setCheckError(`Failed to connect to ${backendSettings.backendUrl} due to CORS policy`);
                    return;
                }
                const responseErr = response;
                const responseBody = await response.text();
                const response_json = JSON.parse(responseBody);
                version = response_json["current"];
            }
            {
                const response = await backendFetch(settingsToCheck, "/me");
                if (response.type === "opaque") {
                    setCheckError(`Failed to connect to ${backendSettings.backendUrl} due to CORS policy`);
                    return;
                }
                const responseErr = response;
                const responseBody = await response.text();
                const response_json = JSON.parse(responseBody);
                identity = response_json;
            }

            setCheckInProgress(false);
            setCheckResponse(`Success`);
            setCheckSuccessful(true);
            setCheckData({
                name: identity.name,
                identity: identity.identity,
                role: identity.role,
                version: version.version,
                url: backendUrl,
                appKey: bearerToken,
                enabled: true,
                lastConnected: new Date().toISOString(),
            });
        } catch (e) {
            setCheckError(`Failed to connect to ${backendUrl}`);
            setCheckInProgress(false);
        }

    };

    const cancelChanges = () => {
        setBackendUrl(backendSettings.backendUrl);
        setBearerToken(backendSettings.bearerToken);
        setEnableBearerToken(backendSettings.enableBearerToken);
    };
    const saveAndAdd = () => {
        if (checkData === null) {
            return;
        }
        const newSettings = backendSettings;

        for (let i = 0; i < newSettings.yagnaServers.length; i++) {
            if (newSettings.yagnaServers[i].identity === checkData.identity && newSettings.yagnaServers[i].appKey === checkData.appKey) {
                setCheckError("Server with specified identity and app-key already added");
                return;
            }
        }
        newSettings.yagnaServers.push(checkData);
        setCheckSuccessful(false);
        setBackendSettings(newSettings);
    }

    useEffect(() => {
        setBackendUrl(backendSettings.backendUrl);
        setBearerToken(backendSettings.bearerToken);
        setEnableBearerToken(backendSettings.enableBearerToken);
    }, [backendSettings]);

    const resetToDefault = () => {
        resetSettings();
    };

    const isCancelEnabled = () => {
        return (
            backendUrl !== backendSettings.backendUrl ||
            bearerToken !== backendSettings.bearerToken ||
            enableBearerToken !== backendSettings.enableBearerToken
        );
    };

    function forgetConnection(id: string, appKey: string, url: string) {
        return () => {
            const newSettings = backendSettings;

            const retainElements = [];
            for (const server of newSettings.yagnaServers) {
                if (server.identity !== id || server.appKey !== appKey || server.url !== url) {
                    retainElements.push(server);
                }
            }
            newSettings.yagnaServers = retainElements;
            setBackendSettings(newSettings);
        }
    }

    const backendList = () => {
        return (
            <div>
                <h1>Connected yagna servers:</h1>

                <div>
                    {backendSettings.yagnaServers.map((server, i) =>
                        <div key={i} className="yagna-server-entry">
                            <YagnaServerNode server={server}/>
                            <button onClick={forgetConnection(server.identity, server.appKey, server.url)}>Forget connection</button>

                        </div>
                    )}
                </div>

            </div>
        );
    }

    return (
        <div className={"backend-settings"}>
            <div>Backend settings</div>
            <hr/>
            <div>{checkResponse}</div>
            <div className="backend-check-error">{checkError}</div>


            {checkSuccessful && checkData && (
                <YagnaServerNode
                    server={checkData}
                />)
            }


            {backendList()}
            <h3>Backend URL:</h3>
            <input type="text" value={backendUrl} onChange={backendChanged}/>
            <hr/>
            <h3>Backend security:</h3>
            <p>
                <span style={{fontWeight: "bold"}}>Bearer authentication</span> - token is added to bearer header
                value. When using Yagna backend it is appkey
            </p>
            <div>
                <label>
                    <input type="checkbox" checked={enableBearerToken} onChange={bearerEnabledChanged}/>
                    Enabled
                </label>
            </div>
            <input type="text" value={bearerToken} onChange={bearerChanged} disabled={!enableBearerToken}/>
            <hr/>

            <div className="box-line">
                <input type="button" value="Check" onClick={check} disabled={checkInProgress}/>
                <input type="button" value="Cancel" onClick={cancelChanges} disabled={!isCancelEnabled()}/>
                <input type="button" value="Add" onClick={saveAndAdd} disabled={!checkSuccessful}/>
                <input type="button" value="Reset to default" onClick={resetToDefault}/>
            </div>
        </div>
    );
};

export default BackendSettingsBox;
