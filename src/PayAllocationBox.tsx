import React, {useCallback, useContext, useEffect} from "react";
import "./PayAllocationBox.css";
import DateBox from "./DateBox";
import {AllocationDepositUpdate, PayAllocation, UpdateAllocation} from "./model/PayAllocations";
import {backendFetchYagna} from "./common/BackendCall";
import {getYagnaServerById, YagnaServer} from "./common/BackendSettings";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {DateTime} from "luxon";
import ContractDetails from "./ContractDetails";

interface PayAllocationBoxProps {
    payAllocation: PayAllocation | null;
}

interface PayAllocationBoxWrapperProps {
    payAllocationId: string;
    nodeId: string;
    deletedEvent?: () => void;
}

export const PayAllocationBoxWrapper = (props: PayAllocationBoxWrapperProps) => {
    const {backendSettings} = useContext(BackendSettingsContext);
    const [payAllocation, setPayAllocation] = React.useState<PayAllocation | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const loadPayAllocation = useCallback(async () => {
        try {
            const yagnaServer = getYagnaServerById(backendSettings, props.nodeId);
            const response = await backendFetchYagna(yagnaServer, "/payment-api/v1/allocations/" + props.payAllocationId);
            const responseJson = await response.json();
            responseJson.yagnaServer = yagnaServer;

            setPayAllocation(responseJson);
            setInputValue(responseJson.totalAmount);
            setInputTimeout(responseJson.timeout);
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
            const responseJson = await response.json();
            responseJson.yagnaServer = yagnaServer;

            setRequestExtended(false);
            setPayAllocation(responseJson);
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
        if (window.confirm("Are you sure you want to release the allocation?")) {
            releaseAllocation().then();
        }
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
    const [requestExtended, setRequestExtended] = React.useState<boolean>(false);

    React.useEffect(() => {
        loadPayAllocation().then();
    }, [loadPayAllocation]);
    return (
        <div className="pay-allocation-box">
            <div className="pay-allocation-box-node-id">
                <div>Id:</div>
                <div className={"pay-allocation-box-node-id-entry"}>{props.payAllocationId}</div>
            </div>
            <div className="pay-allocation-box-node-id">
                <div>Node id:</div>
                <div>
                    <ContractDetails chainId={17000} contractAddress={props.nodeId} isAddress={true}/>
                </div>
            </div>
            {error && <div>{error}</div>}
            <div style={{display: "flex", flexDirection: "row"}}>
                <PayAllocationBox payAllocation={payAllocation}/>
                <div className="allocation-item-button-box">
                    <button disabled={requestExtended} onClick={_ => setRequestExtended(true)}>Change</button>
                    <button onClick={e => releaseAllocationClick()}>Release</button>
                </div>
            </div>
            {requestExtended && <div className={"change-allocation"}>
                <h4>Change allocation</h4>
                <div className={"change-allocation-entry"}>
                    <div>Amount:</div>
                    <div>
                        <input value={inputValue} onChange={e => setInputValue(e.target.value)}/>
                    </div>
                    <div> {inputValueValidated} GLM</div>
                </div>

                <div className={"change-allocation-entry"}>
                    <div>Timeout:</div>
                    <div>
                        <input value={inputTimeout} onChange={e => setInputTimeout(e.target.value)}/>
                    </div>
                    <div>
                        <DateBox date={inputTimeoutValidated} title={""}/>
                    </div>
                </div>
                <button disabled={inProgress} onClick={_ => extendAllocationClick()}>Submit changes</button>
                <button disabled={inProgress} onClick={_ => setRequestExtended(false)}>Cancel changes</button>
            </div>}
        </div>
    );
}

export const PayAllocationBox = (props: PayAllocationBoxProps) => {
    //const [config] = useConfig();
    if (props.payAllocation == null) {
        return <div>Unknown payAllocation</div>;
    }

    return (
        <div className={"pay-allocation-box-body"}>
            <div className={"pay-allocation-box-entry-col-left"}>
                <div className={"pay-allocation-box-entry"} title="payment platform"><b>{props.payAllocation.paymentPlatform}</b></div>
                <div className={"pay-allocation-box-entry"}>Remaining
                    amount: <br/><b>{props.payAllocation.remainingAmount} GLM</b></div>
                <div className={"pay-allocation-box-entry"}>
                    Spent amount:<br/><b>{props.payAllocation.spentAmount} GLM</b>
                </div>
            </div>
            <div className={"pay-allocation-box-entry-col-right"}>
                <div className={"pay-allocation-box-entry"}>
                    Created: <DateBox date={props.payAllocation.timestamp} title={""}/>
                </div>
                <div className={"pay-allocation-box-entry"}>
                    Expired: <DateBox date={props.payAllocation.timeout} title={""}/>
                </div>
            </div>
        </div>
    );
};
