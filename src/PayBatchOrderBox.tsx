import React, {useCallback, useContext, useEffect} from "react";
import "./PayBatchOrderBox.css";
import DateBox from "./DateBox";
import {BatchOrder, BatchOrderItem, BatchOrderItemDocument} from "./model/Batch";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {backendFetch} from "./common/BackendCall";
import AgreementIdBox from "./AgreementIdBox";
import ActivityIdBox from "./ActivityIdBox";

interface BatchOrderBoxProps {
    batchOrder: BatchOrder;
    loadBatchOrderItems: boolean;
}

interface BatchOrderItemEntry {
    batchOrderItem: BatchOrderItem;
    details: BatchOrderItemDocument[] | null;
}
interface GetBatchOrderItemsResponse {
    orderItemEntries: BatchOrderItemEntry[];
}


const BatchOrderBox = (props: BatchOrderBoxProps) => {
    const { backendSettings } = useContext(BackendSettingsContext);

    //const [config] = useConfig();
    if (props.batchOrder == null) {
        return <div>Unknown batchOrder</div>;
    }
    const [batchOrderItems, setBatchOrderItems] = React.useState<GetBatchOrderItemsResponse | null>(null);
    const loadBatchOrders = useCallback(async () => {
        if (props.loadBatchOrderItems) {
            const response = await backendFetch(
                backendSettings,
                `/payment-api/v1/batchOrders/${props.batchOrder.id}/items`,
            );
            const response_json = await response.json();
            const entries = [];
            for (const entry of response_json) {
                entries.push({batchOrderItem: entry, details: null});
            }
            if (props.loadBatchOrderItems && entries != null) {
                for (let i = 0; i < entries.length; i++) {
                    const response = await backendFetch(
                        backendSettings,
                        `/payment-api/v1/batchOrders/${props.batchOrder.id}/items/${entries[i].batchOrderItem.payeeAddr}/details`,
                    );
                    const response_json = await response.json();
                    entries[i].details = response_json;
                }
                const response = await backendFetch(
                    backendSettings,
                    `/payment-api/v1/batchOrders/${props.batchOrder.id}/items`,
                );
                const response_json = await response.json();
            }
            setBatchOrderItems({"orderItemEntries":entries});

        }
    }, [props.loadBatchOrderItems]);

    useEffect(() => {
        setBatchOrderItems(null);
        Promise.all([loadBatchOrders()]).then();
    }, [loadBatchOrders]);



    const listBatchOrderItems = () => {
        if (batchOrderItems == null) {
            return <div className="batch-order-list">Payees not loaded</div>;
        }
        if (batchOrderItems.orderItemEntries.length === 0) {
            return <div className="batch-order-list">No payees found</div>;
        }
        return (
            <div className="batch-order-list">
                <div className="batch-order-list-title">Payees</div>
                <table className="batch-order-list-table">
                    <thead>
                    <tr>
                        <th>Payee Addr</th>
                        <th>Amount</th>
                        <th>Agreement</th>
                        <th>Activity</th>
                    </tr>
                    </thead>
                    <tbody>
                    {batchOrderItems.orderItemEntries.map((batchOrderItemEntry: BatchOrderItemEntry, i: number) => (
                        <>
                            <tr key={i}>
                                <td>{batchOrderItemEntry.batchOrderItem.payeeAddr}</td>
                                <td><b>{batchOrderItemEntry.batchOrderItem.amount}</b></td>
                            </tr>

                            {batchOrderItemEntry.details != null && (batchOrderItemEntry.details.map((detail: BatchOrderItemDocument, j: number) => (
                                <tr key={j + 1000}>
                                    <td></td>
                            <td>{detail.amount}</td>
                            <td><AgreementIdBox agreementId={detail.agreement_id}/></td>
                            <td><ActivityIdBox activityId={detail.activity_id}/></td>
                            </tr>)))}
                        </>
                        ))}

                    </tbody>
                </table>
            </div>
        );
    };
    return (
        <div className={"batch-order-box"}>
            <div className={"batch-order-box-body"}>
                <h3>Payment cycle (batch order) id: {props.batchOrder.id}</h3>
                <table className="batch-order-list-table">
                    <thead>
                    <tr>
                        <th>Owner ID</th>
                        <th>Timestamp</th>
                        <th>Total amount</th>
                        <th>Is paid</th>
                        <th>Payment platform</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{props.batchOrder.ownerId}</td>
                            <td>{props.batchOrder.ts}</td>
                            <td>{props.batchOrder.totalAmount}</td>
                            <td>{props.batchOrder.paid}</td>
                            <td>{props.batchOrder.platform}</td>
                        </tr>
                    </tbody>
                </table>

                {listBatchOrderItems()}

            </div>
        </div>
    );
};

export default BatchOrderBox;
