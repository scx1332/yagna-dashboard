import React, {useCallback, useContext, useEffect} from "react";
import "./PayAllocationBox.css";
import DateBox from "./DateBox";
import {AllocationDepositUpdate, PayAllocation, UpdateAllocation} from "./model/PayAllocations";
import {backendFetchYagna} from "./common/BackendCall";
import {getYagnaServerById, YagnaServer} from "./common/BackendSettings";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {DateTime} from "luxon";

interface PayAllocationBoxProps {
    payAllocation: PayAllocation | null;
}

interface PayAllocationBoxWrapperProps {
    payAllocationId: string;
    nodeId: string;
    deletedEvent?: () => void;
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
    const {backendSettings} = useContext(BackendSettingsContext);
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
    }, [props.payAllocationId, props.payAllocationId]);

    async function extendAllocation(args: UpdateAllocation) {
        try {
            const yagnaServer = getYagnaServerById(backendSettings, props.nodeId);
            const response = await backendFetchYagna(yagnaServer, "/payment-api/v1/allocations/" + props.payAllocationId, {
                method: "PUT",
                body: JSON.stringify(args),
            });
            const response_json = await response.json();
            response_json.yagnaServer = yagnaServer;

            setPayAllocation(response_json);
            setError(null);
        } catch (e) {
            setError(`Error encountered: ${e}`);
        }
        setInProgress(false);

    }

    async function releaseAllocation() {
        try {
            const yagnaServer = getYagnaServerById(backendSettings, props.nodeId);
            const response = await backendFetchYagna(yagnaServer, "/payment-api/v1/allocations/" + props.payAllocationId, {
                method: "DELETE",
            });
            await response.json();
            setError(null);
            props.deletedEvent && props.deletedEvent();
        } catch (e) {
            setError(`Error encountered: ${e}`);
        }
    }

    function releaseAllocationClick() {
        releaseAllocation().then();
    }
    const [inputValue, setInputValue] = React.useState<string>("10.0");
    const [inputTimeout, setInputTimeout] = React.useState<string>(DateTime.now().plus({hour: 1}).toISO());

    const [inputValueValidated, setInputValueValidated] = React.useState<string>("");
    const [inputTimeoutValidated, setInputTimeoutValidated] = React.useState<string>("");
    useEffect(() => {
        setInputValueValidated(inputValue);
        setInputTimeoutValidated(inputTimeout);
    }, [inputValue, inputTimeout]);
    const [inProgress, setInProgress] = React.useState<boolean>(false);

    function extendAllocationClick() {
        setInProgress(true);
        extendAllocation({
            totalAmount: inputValueValidated,
            timeout: inputTimeoutValidated,
            deposit: null,
        }).then()
    }


    React.useEffect(() => {
        loadPayAllocation().then();
    }, [loadPayAllocation]);
    return (
        <div>
            <h3>PayAllocation with {props.payAllocationId}</h3>
            {error && <div>{error}</div>}
            <PayAllocationBox payAllocation={payAllocation}/>
            <button onClick={e => releaseAllocationClick()}>Release allocation</button>
            <div className={"new-allocation"}>
                <h3>Extend Allocation</h3>
                <div className={"new-allocation-entry"}>
                    <div>GLM value:</div>
                    <div>
                        <input value={inputValue} onChange={e => setInputValue(e.target.value)}/>
                    </div>
                    <div> {inputValueValidated} GLM</div>
                </div>

                <div className={"new-allocation-entry"}>
                    <div>Timeout:</div>
                    <div>
                        <input value={inputTimeout} onChange={e => setInputTimeout(e.target.value)}/>
                    </div>
                    <div>
                        <DateBox date={inputTimeoutValidated} title={""}/>
                    </div>
                </div>
                <button disabled={inProgress} onClick={_ => extendAllocationClick()}>Change allocation</button>
            </div>

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
            <h1>PayAllocations</h1>

            <div className={"pay-allocation-box-body"}>
                <h3>PayAllocation - from node id: {props.payAllocation.yagnaServer.identity} </h3>
                <h3>{props.payAllocation.paymentPlatform}</h3>
                <div className={"pay-allocation-box-entry"}>PayAllocation no: {props.payAllocation.allocationId}</div>
                <div className={"pay-allocation-box-entry"}>Remaining
                    amount: <b>{props.payAllocation.remainingAmount} GLM</b></div>
                <div className={"pay-allocation-box-entry"}>
                    Spent amount: <b>{props.payAllocation.spentAmount} GLM</b>
                </div>
                <div className={"pay-allocation-box-entry"}>
                    Timestamp: <DateBox date={props.payAllocation.timestamp} title={""}/>
                </div>
                <div className={"pay-allocation-box-entry"}>
                    Timeout: <DateBox date={props.payAllocation.timeout} title={""}/>
                </div>
            </div>
        </div>
    );
};
