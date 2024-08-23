import React, {useCallback, useContext, useEffect} from "react";
import "./PayCycleBox.css";
import {PayCycle} from "./model/PayCycle";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {backendFetch, backendFetchYagna} from "./common/BackendCall";
import DateBox from "./DateBox";

interface PayCycleBoxProps {
    payCycle: PayCycle;
    loadPayCycleItems: boolean;
}

const PayCycleBox = (props: PayCycleBoxProps) => {
    const {backendSettings} = useContext(BackendSettingsContext);


    const [intervalInputValue, setIntervalInputValue] = React.useState<string>("");
    const [cronInputValue, setCronInputValue] = React.useState<string>("");
    const [extraInputValue, setExtraInputValue] = React.useState<string>("");
    const [nextInputValue, setNextInputValue] = React.useState<string>("");

    const [payCycle, setPayCycle] = React.useState<PayCycle | null>(null);

    const [updateNo, setUpdateNo] = React.useState(0);
    const [autoUpdate, setAutoUpdate] = React.useState(0);

    const loadPayCycle = useCallback(async () => {
        const response = await backendFetch(backendSettings, "/payment-api/v1/batchCycle/" + props.payCycle.platform);
        const response_json = await response.json();
        setPayCycle(response_json);

        if (response_json.intervalSec) {
            setIntervalInputValue(response_json.intervalSec.toString());
            setIntervalCheckBox(true);
        } else {
            setIntervalInputValue("");
            setIntervalCheckBox(false);
        }


        if (response_json.cron) {
            setCronInputValue(response_json.cron);
            setCronCheckBox(true);
        } else {
            setCronInputValue("")
            setCronCheckBox(false);
        }

        setExtraInputValue(response_json.extraPayTimeSec.toString());
        setNextInputValue(response_json.nextProcess);
        setNextProcessChecked(false);
    }, [updateNo]);

    useEffect(() => {
        if (!editMode) {
            loadPayCycle().then();
        }
    }, [autoUpdate]);

    useEffect(() => {
        const autoUpdateInterval =  10 * 1000;
        const interval = setInterval(() => {
            setAutoUpdate(new Date().getTime());
        }, autoUpdateInterval);
        return () => clearInterval(interval);
    }, []);

    const [payCycleIntervalValid, setCycleIntervalValid] = React.useState<number | null>(null);
    const [editMode, setEditMode] = React.useState<boolean>(false);

    const [cronInputValid, setCronInputValid] = React.useState<string | null>(null);
    const [extraValid, setExtraValid] = React.useState<number | null>(null);
    const [nextUpdateValid, setNextUpdateValid] = React.useState<string | null>(null);

    const [intervalCheckBox, setIntervalCheckBox] = React.useState<boolean>(false);
    const [cronCheckBox, setCronCheckBox] = React.useState<boolean>(false);
    const [nextProcessChecked, setNextProcessChecked] = React.useState<boolean>(false);
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

    useEffect(() => {
        validatePayCycleInterval();
        validateCron();
        validateExtra();
        validateNext();
    }, [cronCheckBox, intervalCheckBox, intervalInputValue, cronInputValue, extraInputValue, nextInputValue, nextProcessChecked])

    function validatePayCycleInterval() {
        if (!intervalCheckBox) {
            setCycleIntervalValid(null);
            return;
        }
        const interval = intervalInputValue;
        try {
            if (isDigitsOnly(interval)) {
                const intervalSec = parseInt(interval);
                setCycleIntervalValid(intervalSec);
            } else {
                setCycleIntervalValid(null);
                throw "locally";
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

    function validateCron() {
        if (!cronCheckBox) {
            setCronInputValid(null);
            return;
        }
        setCronInputValid(cronInputValue);
    }

    function validateExtra() {
        const extra = extraInputValue;
        try {
            if (isDigitsOnly(extra)) {
                const extraSec = parseInt(extra);
                setExtraValid(extraSec);
            } else {
                setExtraValid(null);
                throw "locally";
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

    function validateNext() {
        if (!nextProcessChecked) {
            setNextUpdateValid(null);
            return;
        }
        setNextUpdateValid(nextInputValue);
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
        const timePattern = /(\d+d\s*)?(\d+h\s*)?(\d+m\s*)?(\d+s)?/;
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
                        <th>Extra payment time</th>
                        <th>Last process</th>
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
                        <td>{payCycle.lastProcess ? <DateBox date={payCycle.lastProcess} title={""}/> : "NULL"}</td>
                        <td><DateBox date={payCycle.nextProcess} title={""}/></td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div className={editMode ? "pay-cycle-edit" : "pay-cycle-edit-hidden"}>
                <div className="pay-cycle-edit-entry">
                    <div>
                        <input checked={intervalCheckBox} type="checkbox" onChange={(e) => intervalCheckBoxChanged(e)}/>
                    </div>
                    <div>
                        Interval
                    </div>
                    <div>
                        <input disabled={!intervalCheckBox} value={intervalInputValue}
                               onChange={(e) => setIntervalInputValue(e.target.value)}></input></div>
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
                        <input disabled={!cronCheckBox} value={cronInputValue}
                               onChange={(e) => setCronInputValue(e.target.value)}></input></div>
                    <div>
                        {cronInputValid}
                    </div>
                </div>
                <div className="pay-cycle-edit-entry">
                    <div>

                    </div>
                    <div>
                        Extra payment time:
                    </div>
                    <div>
                        <input value={extraInputValue} onChange={(e) => setExtraInputValue(e.target.value)}></input>
                    </div>
                    <div>
                        {extraValid}
                    </div>
                </div>
                <div className="pay-cycle-edit-entry">
                    <div>
                    <input checked={nextProcessChecked} type="checkbox" onChange={(e) => setNextProcessChecked(e.target.checked)}/>
                    </div>
                    <div>
                        Overwrite next process:
                    </div>
                    <div>
                        <input disabled={!nextProcessChecked} value={nextInputValue} onChange={(e) => setNextInputValue(e.target.value)}></input>
                    </div>
                    <div>
                        {nextUpdateValid}
                    </div>
                </div>
            </div>

            <div className={"pay-cycle-button-row"}>
                <button>Run process now</button>
                {!editMode && <button onClick={_e => setEditMode(true)}>Edit</button>}
                {editMode && <button onClick={saveHandler()}>Save</button>}
                {editMode && <button onClick={_e => setEditMode(false)}>Cancel</button>}
            </div>
        </div>
    );
};

export default PayCycleBox;
