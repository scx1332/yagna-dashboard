import React, { useCallback, useContext, useEffect } from "react";
import { PayAllocationBox, PayAllocationBoxWrapper} from "./PayAllocationBox";
import { PayAllocation } from "./model/PayAllocations";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import {backendFetch, backendFetchYagna} from "./common/BackendCall";

interface GetPayAllocationsResponse {
    payAllocations: PayAllocation[];
}

const PayAllocations = () => {
    const [payAllocations, setPayAllocations] = React.useState<GetPayAllocationsResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

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
        const payAllocationsSorted = payAllocations.sort((a: PayAllocation, b: PayAllocation) => {
            return a.timestamp.localeCompare(b.timestamp);
        }).reverse();
        setPayAllocations({ payAllocations: payAllocationsSorted });
    }, []);

    function row(payAllocation: PayAllocation, i: number) {
        return <PayAllocationBoxWrapper key={i} payAllocationId={payAllocation.allocationId} nodeId={payAllocation.yagnaServer.identity} />;
    }

    useEffect(() => {
        loadPayAllocations().then();
    }, [loadPayAllocations]);
    return (
        <div>
            <h1>PayAllocations</h1>
            {payAllocations?.payAllocations.map(row)}
            {JSON.stringify(payAllocations)}
        </div>
    );
};

export default PayAllocations;
