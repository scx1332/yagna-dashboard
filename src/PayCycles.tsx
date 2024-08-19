import React, { useCallback, useContext, useEffect } from "react";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { backendFetch } from "./common/BackendCall";
import PayCycleBox  from "./PayCycleBox";
import {PayCycle} from "./model/PayCycle";

interface GetPayCyclesResponse {
    payCycles: PayCycle[];
}

const PayCycles = () => {
    const [payCycles, setPayCycles] = React.useState<GetPayCyclesResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const loadPayCycles = useCallback(async () => {
        const response = await backendFetch(backendSettings, "/payment-api/v1/batchCycles");
        const response_json = await response.json();
        setPayCycles({ payCycles: response_json });
    }, []);

    function row(payCycle: PayCycle, i: number) {
        return <PayCycleBox loadPayCycleItems={true} key={i} payCycle={payCycle} />;
    }

    useEffect(() => {
        loadPayCycles().then();
    }, [loadPayCycles]);
    return (
        <div>
            <h1>PayCycles</h1>
            {payCycles?.payCycles.map(row)}
            {JSON.stringify(payCycles)}
        </div>
    );
};

export default PayCycles;
