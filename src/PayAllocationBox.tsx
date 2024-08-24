import React, {useCallback, useContext} from "react";
import "./PayAllocationBox.css";
import DateBox from "./DateBox";
import { PayAllocation } from "./model/PayAllocations";
import {backendFetchYagna} from "./common/BackendCall";
import {getYagnaServerById, YagnaServer} from "./common/BackendSettings";
import {BackendSettingsContext} from "./BackendSettingsProvider";

interface PayAllocationBoxProps {
    payAllocation: PayAllocation | null;
}
interface PayAllocationBoxWrapperProps {
    payAllocationId: string;
    nodeId: string;
}

/*
export interface PayAgreementPayment {
    agreementId: string,
    amount: string,
    allocationId: string | null,
}

export interface PayActivityPayment {
    activityId: string,
    amount: string,
    allocationId: string | null,
}

export interface PayAllocation {
    paymentId: string,
    payerId: string,
    payeeId: string,
    payerAddr: string,
    payeeAddr: string,
    paymentPlatform: string,
    amount: string,
    timestamp: string,
    agreementPayments: [PayAgreementPayment],
    activityPayments: [PayActivityPayment],
    details: string,
}

 */

export const PayAllocationBoxWrapper = (props: PayAllocationBoxWrapperProps) => {
    const { backendSettings } = useContext(BackendSettingsContext);
    const [payAllocation, setPayAllocation] = React.useState<PayAllocation | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const loadPayAllocation = useCallback(async () => {

        try {
            const yagnaServer = getYagnaServerById(backendSettings, props.nodeId);
            const response = await backendFetchYagna(yagnaServer, "/payment-api/v1/allocations/" + props.payAllocationId);
            const response_json = await response.json();
            response_json.yagnaServer = yagnaServer;

            setPayAllocation(response_json);
            setError(null);
        } catch (e) {
            setError(`Error encountered: ${e}`);
        }
    }, []);

    React.useEffect(() => {
        loadPayAllocation().then();
    }, [loadPayAllocation]);
    return (
        <div>
            <h3>PayAllocation with {props.payAllocationId}</h3>
            {error && <div>{error}</div>}
            <PayAllocationBox payAllocation={payAllocation} />
        </div>
    );
}

export const PayAllocationBox = (props: PayAllocationBoxProps) => {
    //const [config] = useConfig();
    if (props.payAllocation == null) {
        return <div>Unknown payAllocation</div>;
    }

    return (
        <div className={"pay-allocation-box"}>

            <div className={"pay-allocation-box-body"}>
                <h3>PayAllocation - from node id: {props.payAllocation.yagnaServer.identity} </h3>
                <h3>{props.payAllocation.paymentPlatform}</h3>
                <div className={"pay-allocation-box-entry"}>PayAllocation no: {props.payAllocation.allocationId}</div>
                <div className={"pay-allocation-box-entry"}>Remaining amount: <b>{props.payAllocation.remainingAmount} GLM</b></div>
                <div className={"pay-allocation-box-entry"}>Spent amount: <b>{props.payAllocation.spentAmount} GLM</b></div>
                <div className={"pay-allocation-box-entry"}>Timestamp: <DateBox date={props.payAllocation.timestamp} title={""}/></div>


            </div>
        </div>
    );
};
