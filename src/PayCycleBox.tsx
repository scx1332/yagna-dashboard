import React, {useCallback, useContext, useEffect} from "react";
import "./PayCycleBox.css";
import {PayCycle} from "./model/PayCycle";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {backendFetch, backendFetchYagna} from "./common/BackendCall";

interface PayCycleBoxProps {
    payCycle: PayCycle;
    loadPayCycleItems: boolean;
}

const PayCycleBox = (props: PayCycleBoxProps) => {
    const {backendSettings} = useContext(BackendSettingsContext);


    const divInputRef = React.useRef<HTMLDivElement>(null);
    const intervalInputRef = React.useRef<HTMLInputElement>(null);
    const cronInputRef = React.useRef<HTMLInputElement>(null);
    const extraInputRef = React.useRef<HTMLInputElement>(null);
    const nextInputRef = React.useRef<HTMLInputElement>(null);
    const editBtn = React.useRef<HTMLButtonElement>(null);
    const saveBtn = React.useRef<HTMLButtonElement>(null);
    const cancelBtn = React.useRef<HTMLButtonElement>(null);

    const [payCycle, setPayCycle] = React.useState<PayCycle | null>(null);

    const [updateNo, setUpdateNo] = React.useState(0);

    const loadPayCycle = useCallback(async () => {
        const response = await backendFetch(backendSettings, "/payment-api/v1/batchCycle/" + props.payCycle.platform);
        const response_json = await response.json();
        setPayCycle(response_json);
        if (intervalInputRef.current) {
            if (response_json.intervalSec) {
                intervalInputRef.current.value = response_json.intervalSec.toString();
                setIntervalCheckBox(true);
                validatePayCycleInterval(intervalInputRef.current.value);
            } else {
                intervalInputRef.current.value = "";
                setIntervalCheckBox(false);
            }
        }
        if (cronInputRef.current) {
            if (response_json.cron) {
                cronInputRef.current.value = response_json.cron;
                setCronCheckBox(true);
                validateCron(cronInputRef.current.value);
            } else {
                cronInputRef.current.value = "";
                setCronCheckBox(false);
            }
        }
        if (extraInputRef.current) {
            extraInputRef.current.value = response_json.extraPayTimeSec.toString();
            validateExtra(extraInputRef.current.value);
        }
        if (nextInputRef.current) {
            nextInputRef.current.value = response_json.nextProcess;
            validateNext(nextInputRef.current.value);
        }
    }, [updateNo]);

    const [payCycleIntervalValid, setCycleIntervalValid] = React.useState<number | null>(null);
    const [editMode, setEditMode] = React.useState<boolean>(false);

    const [cronInputValid, setCronInputValid] = React.useState<string | null>(null);
    const [extraValid, setExtraValid] = React.useState<number | null>(null);
    const [nextUpdateValid, setNextUpdateValid] = React.useState<string | null>(null);

    const [intervalCheckBox, setIntervalCheckBox] = React.useState<boolean>(false);
    const [cronCheckBox, setCronCheckBox] = React.useState<boolean>(false);
    const intervalCheckBoxChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enable = e.target.checked;
        setIntervalCheckBox(enable);
        setCronCheckBox(!enable);
    }
    const cronCheckBoxChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enable = e.target.checked;
        setIntervalCheckBox(!enable);
        setCronCheckBox(enable);
    }
    const payCycleEnabledChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        validatePayCycleInterval(e.target.value);
    };

    const cronChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        validateCron(e.target.value);
    }
    const extraChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        validateExtra(e.target.value);
    }
    const nextChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        validateNext(e.target.value);
    }

    useEffect(() => {
        validatePayCycleInterval(intervalInputRef.current?.value ?? "");
        validateCron(cronInputRef.current?.value ?? "");
    }, [cronCheckBox, intervalCheckBox])

    function validatePayCycleInterval(interval: string) {
        if (!intervalCheckBox) {
            setCycleIntervalValid(null);
            return;
        }
        try {
            if (isDigitsOnly(interval)) {
                const intervalSec = parseInt(interval);
                setCycleIntervalValid(intervalSec);
            } else {
                setCycleIntervalValid(null);
            }
        } catch (e) {
            try {
                const time = parseTimeString(interval);
                const intervalSec = time.days * 24 * 3600 + time.hours * 3600 + time.minutes * 60 + time.seconds;
                if (intervalSec >= 5) {
                    setCycleIntervalValid(intervalSec);
                } else {
                    setCycleIntervalValid(null);
                }
            } catch (e) {
                setCycleIntervalValid(null);
            }
        }
    }

    function validateCron(cron: string) {
        if (!cronCheckBox) {
            setCronInputValid(null);
            return;
        }
        setCronInputValid(cron);
    }

    function validateExtra(extra: string) {
        try {
            if (!isDigitsOnly(extra)) {
                const extraSec = parseInt(extra);
                setExtraValid(extraSec);
            } else {
                setExtraValid(null);
            }
        } catch (e) {
            try {
                const time = parseTimeString(extra);
                const extraSec = time.days * 24 * 3600 + time.hours * 3600 + time.minutes * 60 + time.seconds;
                setExtraValid(extraSec);
            } catch (e) {
                setExtraValid(null);
            }
        }
    }

    function validateNext(next: string) {
        setNextUpdateValid(next);
    }

    async function savePayCycle() {
        const platform = props.payCycle.platform;

        const bodyStr = JSON.stringify({
            platform: platform,
            intervalSec: payCycleIntervalValid,
            cron: cronInputValid,
            extraPayTimeSec: extraValid,
            nextUpdate: nextUpdateValid,
        });
        console.log("savePayCycle: ", bodyStr);
        const response = await backendFetchYagna(backendSettings.yagnaServers[0], "/payment-api/v1/batchCycle",
            {
                method: "POST",
                body: bodyStr,
            });
        const response_json = await response.json();
        console.log("savePayCycle result: ", response_json);
        setUpdateNo(updateNo + 1);
    }

    useEffect(() => {
        loadPayCycle().then();
    }, [loadPayCycle]);


    if (props.payCycle == null) {
        return <div>Unknown payCycle</div>;
    }

    function isDigitsOnly(str: string) {
        return /^\d+$/.test(str);
    }

    function parseTimeString(timeStr: string) {
        const timePattern = /(\d+d)?(\d+h)?(\d+m)?(\d+s)?/;
        const matches = timeStr.match(timePattern);

        // Extract hours, minutes, and seconds
        if (matches) {
            console.log("parseTimeString: ", timeStr);
            const days = matches[1] ? parseInt(matches[1], 10) : 0;
            const hours = matches[2] ? parseInt(matches[2], 10) : 0;
            const minutes = matches[3] ? parseInt(matches[3], 10) : 0;
            const seconds = matches[4] ? parseInt(matches[4], 10) : 0;
            console.log("parseTimeString: ", days, hours, minutes, seconds);
            return {days, hours, minutes, seconds};
        }
        throw "Invalid time string";
    }


    function saveHandler() {
        return async () => {
            await savePayCycle();
        }
    }

    if (payCycle == null) {
        return <div>Loading...</div>;
    }

    return (
        <div className={"pay-cycle-box"}>
            <div className={"pay-cycle-box-body"}>
                <h3>Payment cycle for node id: {payCycle.nodeId} platform: {payCycle.platform}</h3>
                <table className="pay-cycle-list-table">
                    <thead>
                    <tr>
                        <th>Payment platform</th>
                        <th>Set by interval</th>
                        <th>Set by cron</th>
                        <th>Max interval</th>
                        <th>Max payment time</th>
                        <th>Next process</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{payCycle.platform}</td>
                        <td>{payCycle.intervalSec?.toString() ?? "NULL"}</td>
                        <td>{payCycle.cron ?? "NULL"}</td>
                        <td>{payCycle.maxIntervalSec?.toString() ?? "NULL"}</td>
                        <td>{payCycle.extraPayTimeSec.toString()}</td>
                        <td>{payCycle.nextProcess}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div ref={divInputRef} className={editMode ? "pay-cycle-edit" : "pay-cycle-edit-hidden"}>
                <div className="pay-cycle-edit-entry">
                    <div>
                        <input checked={intervalCheckBox} type="checkbox" onChange={(e) => intervalCheckBoxChanged(e)}/>
                    </div>
                    <div>
                        Interval
                    </div>
                    <div>
                        <input disabled={!intervalCheckBox} ref={intervalInputRef}
                               onChange={(e) => payCycleEnabledChanged(e)}></input></div>
                    <div>
                        {payCycleIntervalValid}
                    </div>
                </div>
                <div className="pay-cycle-edit-entry">
                    <div>
                        <input checked={cronCheckBox} type="checkbox" onChange={(e) => cronCheckBoxChanged(e)}/>
                    </div>
                    <div>
                        Cron:
                    </div>
                    <div>
                        <input disabled={!cronCheckBox} ref={cronInputRef}
                               onChange={(e) => cronChanged(e)}></input></div>
                    <div>
                        {cronInputValid}
                    </div>
                </div>
                <div className="pay-cycle-edit-entry">
                    <div>
                        Max payment time:
                    </div>
                    <div>
                        <input ref={extraInputRef} onChange={(e) => extraChanged(e)}></input>
                    </div>
                    <div>
                        {extraValid}
                    </div>
                </div>
                <div className="pay-cycle-edit-entry">
                    <div>
                        Next process:
                    </div>
                    <div>
                        <input ref={nextInputRef} onChange={(e) => nextChanged(e)}></input>
                    </div>
                    <div>
                        {nextUpdateValid}
                    </div>
                </div>
            </div>

            <div className={"pay-cycle-button-row"}>
                <button>Run process now</button>
                {!editMode && <button ref={editBtn} onClick={_e => setEditMode(true)}>Edit</button>}
                {editMode && <button ref={saveBtn} onClick={saveHandler()}>Save</button>}
                {editMode && <button ref={cancelBtn} onClick={_e => setEditMode(false)}>Cancel</button>}


            </div>
        </div>
    );
};

export default PayCycleBox;
