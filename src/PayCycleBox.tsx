import React, {useCallback, useContext, useEffect} from "react";
import "./PayCycleBox.css";
import DateBox from "./DateBox";
import {PayCycle} from "./model/PayCycle";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {backendFetch} from "./common/BackendCall";
import AgreementIdBox from "./AgreementIdBox";
import ActivityIdBox from "./ActivityIdBox";

interface PayCycleBoxProps {
    payCycle: PayCycle;
    loadPayCycleItems: boolean;
}

interface PayCycleItemEntry {
    payCycleItem: PayCycle;
}
interface GetPayCycleItemsResponse {
    orderItemEntries: PayCycleItemEntry[];
}


const PayCycleBox = (props: PayCycleBoxProps) => {
    const { backendSettings } = useContext(BackendSettingsContext);

    //const [config] = useConfig();
    if (props.payCycle == null) {
        return <div>Unknown payCycle</div>;
    }

    return (
        <div className={"pay-cycle-box"}>
            <div className={"pay-cycle-box-body"}>
                <h3>Payment cycle for node id: {props.payCycle.nodeId} platform: {props.payCycle.platform}</h3>
                <table className="pay-cycle-list-table">
                    <thead>
                    <tr>
                        <th>Payment platform</th>
                        <th>Set by interval</th>
                        <th>Set by cron</th>
                        <th>Max interval</th>
                        <th>Next process</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{props.payCycle.platform}</td>
                        <td>{props.payCycle.intervalSec?.toString() ?? "NULL"}</td>
                        <td>{props.payCycle.cron ?? "NULL"}</td>
                        <td>{props.payCycle.maxIntervalSec?.toString() ?? "NULL"}</td>
                        <td>{props.payCycle.nextProcess}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayCycleBox;
