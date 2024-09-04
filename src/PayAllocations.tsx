import React, { useCallback, useContext, useEffect } from "react";
import { PayAllocationBox, PayAllocationBoxWrapper } from "./PayAllocationBox";
import { NewAllocation, PayAllocation } from "./model/PayAllocations";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { backendFetch, backendFetchYagna } from "./common/BackendCall";
import { getYagnaServerById, YagnaServer } from "./common/BackendSettings";
import DateBox from "./DateBox";
import "./PayAllocations.css";
import { DateTime } from "luxon";

interface GetPayAllocationsResponse {
    payAllocations: PayAllocation[];
}

const PayAllocations = () => {
    const [payAllocations, setPayAllocations] = React.useState<GetPayAllocationsResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const [updateNo, setUpdateNo] = React.useState<number>(0);
    const loadPayAllocations = useCallback(async () => {
        let payAllocations: PayAllocation[] = [];
        for (const yagna_server of backendSettings.yagnaServers) {
            const response = await backendFetchYagna(yagna_server, "/payment-api/v1/allocations");
            const response_json = await response.json();
            const payAllocationsLoc = response_json;
            for (const payAllocation of payAllocationsLoc) {
                payAllocation.yagnaServer = yagna_server;
            }
            payAllocations = payAllocations.concat(payAllocationsLoc);
        }
        //sort by timestamp
        const payAllocationsSorted = payAllocations
            .sort((a: PayAllocation, b: PayAllocation) => {
                return a.timestamp.localeCompare(b.timestamp);
            })
            .reverse();
        setPayAllocations({ payAllocations: payAllocationsSorted });
    }, [updateNo]);

    function onDelete() {
        setUpdateNo(updateNo + 1);
    }

    function row(payAllocation: PayAllocation, i: number) {
        return (
            <PayAllocationBoxWrapper
                deletedEvent={() => onDelete()}
                key={i}
                payAllocationId={payAllocation.allocationId}
                nodeId={payAllocation.yagnaServer.identity}
            />
        );
    }

    const [enableNewAllocation, setEnableNewAllocation] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    async function createAllocation(yagnaServer: YagnaServer, args: NewAllocation) {
        try {
            const response = await backendFetchYagna(yagnaServer, "/payment-api/v1/allocations", {
                method: "POST",
                body: JSON.stringify(args),
            });
            //check for 400
            if (response.status === 400) {
                const response_json = await response.json();
                setError(`Error encountered when creating allocation: ${response_json.detail}
                Available funds: ${response_json.availableFunds}`);
            } else {
                const response_json = await response.json();
                response_json.yagnaServer = yagnaServer;

                setEnableNewAllocation(false);
                setError("");
            }
        } catch (e) {
            setError(`Error encountered: ${e}`);
        }
        setInProgress(false);
        setUpdateNo(updateNo + 1);
    }

    const [inProgress, setInProgress] = React.useState<boolean>(false);

    function newAllocationClick() {
        setInProgress(true);
        createAllocation(backendSettings.yagnaServers[selectedYaServer], {
            address: backendSettings.yagnaServers[selectedYaServer].identity,
            paymentPlatform: inputPlatformValidated,
            totalAmount: inputValueValidated,
            timeout: inputTimeoutValidated,
            deposit: null,
            makeDeposit: false,
            extendTimeout: null,
        }).then();
    }
    const [inputValue, setInputValue] = React.useState<string>("10.0");
    const [inputPlatform, setInputPlatform] = React.useState<string>("erc20-holesky-tglm");
    const [inputTimeout, setInputTimeout] = React.useState<string>(DateTime.now().plus({ hour: 1 }).toISO());

    const [inputValueValidated, setInputValueValidated] = React.useState<string>("");
    const [inputPlatformValidated, setInputPlatformValidated] = React.useState<string>("");
    const [inputTimeoutValidated, setInputTimeoutValidated] = React.useState<string>("");

    useEffect(() => {
        setInputValueValidated(inputValue);
        setInputPlatformValidated(inputPlatform);
        setInputTimeoutValidated(inputTimeout);
    }, [inputValue, inputPlatform, inputTimeout]);

    const [selectedYaServer, setSelectedYaServer] = React.useState<number>(0);
    useEffect(() => {
        loadPayAllocations().then();
    }, [loadPayAllocations, updateNo]);
    return (
        <div>
            {enableNewAllocation && (
                <div className={"new-allocation"}>
                    <h3>Create new</h3>
                    <div className={"new-allocation-entry"}>
                        <div>Server</div>
                        <div>
                            <select onChange={(e) => setSelectedYaServer(parseInt(e.target.value))}>
                                {backendSettings.yagnaServers.map((server, i) => (
                                    <option key={i} value={i}>
                                        {server.name}({server.identity})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={"new-allocation-entry"}>
                        <div>GLM value:</div>
                        <div>
                            <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                        </div>
                        <div> {inputValueValidated} GLM</div>
                    </div>
                    <div className={"new-allocation-entry"}>
                        <div>
                            Payment <br />
                            platform:
                        </div>
                        <div>
                            <input value={inputPlatform} onChange={(e) => setInputPlatform(e.target.value)} />
                        </div>
                        <div> {inputPlatformValidated}</div>
                    </div>
                    <div className={"new-allocation-entry"}>
                        <div>Timeout:</div>
                        <div>
                            <input value={inputTimeout} onChange={(e) => setInputTimeout(e.target.value)} />
                        </div>
                        <div>
                            <DateBox date={inputTimeoutValidated} title={""} />
                        </div>
                    </div>
                    <button disabled={inProgress} onClick={(e) => newAllocationClick()}>
                        Submit new
                    </button>
                    <button disabled={inProgress} onClick={(e) => setEnableNewAllocation(false)}>
                        Cancel
                    </button>
                </div>
            )}
            {!enableNewAllocation && (
                <div className={"new-allocation"}>
                    <button onClick={(_) => setEnableNewAllocation(true)}>New Allocation</button>
                </div>
            )}
            {error && <div className="error-message">{error}</div>}
            <div className={"pay-allocations-row-container"}>{payAllocations?.payAllocations.map(row)}</div>
            {/*JSON.stringify(payAllocations)*/}
        </div>
    );
};

export default PayAllocations;
