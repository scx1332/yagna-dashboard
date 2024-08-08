import React, { useCallback, useContext, useEffect } from "react";
import InvoiceBox from "./InvoiceBox";
import Invoice from "./model/Invoice";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { backendFetch } from "./common/BackendCall";
import {BatchOrder, BatchOrderItem} from "./model/Batch";
import DebitNote from "./model/DebitNote";
import BatchOrderBox from "./PayBatchOrderBox";

interface GetBatchOrdersResponse {
    batchOrders: BatchOrder[];
}

const BatchOrders = () => {
    const [batchOrders, setBatchOrders] = React.useState<GetBatchOrdersResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const loadBatchOrders = useCallback(async () => {
        const response = await backendFetch(backendSettings, "/payment-api/v1/batchOrders");
        const response_json = await response.json();
        setBatchOrders({ batchOrders: response_json });
    }, []);

    function row(batchOrder: BatchOrder, i: number) {
        return <BatchOrderBox loadBatchOrderItems={true} key={i} batchOrder={batchOrder} />;
    }

    useEffect(() => {
        loadBatchOrders().then();
    }, [loadBatchOrders]);
    return (
        <div>
            <h1>BatchOrders</h1>
            {batchOrders?.batchOrders.map(row)}
            {JSON.stringify(batchOrders)}
        </div>
    );
};

export default BatchOrders;
