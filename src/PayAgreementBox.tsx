import React, { useCallback, useContext, useEffect } from "react";
import "./PayAgreementBox.css";
import PayAgreement from "./model/PayAgreement";
import { backendFetch, backendFetchYagna } from "./common/BackendCall";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import PayActivity from "./model/PayActivity";
import PayActivityBox from "./PayActivityBox";
import {Simulate} from "react-dom/test-utils";
import {BigNumber} from "bignumber.js";

interface PayAgreementBoxProps2 {
    agreementId: string;
    ownerId: string;
    loadActivities: boolean;
    loadOrderItems: boolean;
}

interface GetActivitiesResponse {
    activities: any[];
}

interface GetOrderItemsResponse {
    orderItems: any;
}

const PayAgreementBox = (props: PayAgreementBoxProps2) => {
    const { backendSettings } = useContext(BackendSettingsContext);
    //const [config] =
    //if (props.payAgreement == null) {
    //    return <div>Unknown payAgreement</div>;
    //}


    const [reloadCounter, setReloadCounter] = React.useState<number>(0);
    const [agreement, setAgreement] = React.useState<PayAgreement | null>(null);

    const loadAgreement = useCallback(async () => {
        const yagnaServer = backendSettings.yagnaServers.find((ys) => ys.identity == props.ownerId);

        if (yagnaServer) {
            const response = await backendFetchYagna(
                yagnaServer,
                `/payment-api/v1/payAgreements/${props.agreementId}`,
            );
            const response_json = await response.json();
            setAgreement(response_json);
        }
    }, [props.agreementId, props.ownerId]);

    const [activities, setActivities] = React.useState<GetActivitiesResponse | null>(null);
    const loadActivities = useCallback(async () => {
        if (props.loadActivities) {
            const yagnaServer = backendSettings.yagnaServers.find((ys) => ys.identity == props.ownerId);

            if (yagnaServer) {
                const response = await backendFetchYagna(
                    yagnaServer,
                    `/payment-api/v1/payAgreements/${props.agreementId}/activities`,
                );
                const response_json = await response.json();
                setActivities({ activities: response_json });
            }
        }
    }, [props.loadActivities]);

    const [agreementOrderItems, setAgreementOrderItems] = React.useState<GetOrderItemsResponse | null>(null);
    const loadAgreementOrderItems = useCallback(async () => {
        if (props.loadOrderItems) {
            const response = await backendFetch(
                backendSettings,
                `/payment-api/v1/payAgreements/${props.agreementId}/orders`,
            );
            const response_json = await response.json();
            setAgreementOrderItems({ orderItems: response_json });
        }
    }, [props.loadOrderItems]);

    useEffect(() => {
        Promise.all([loadActivities(), loadAgreementOrderItems(), loadAgreement()]).then();
    }, [loadActivities, loadAgreementOrderItems, loadAgreement, reloadCounter]);

    const listActivities = () => {
        if (activities == null) {
            return <div className="debit-note-list">Activities loaded</div>;
        }
        if (activities.activities.length === 0) {
            return <div className="debit-note-list">No activities</div>;
        }
        return (
            <div className="debit-note-list">
                <div className="activity-list-title">Activities</div>
                <div className="activity-list-body">
                    {activities.activities.map((activity: PayActivity, i: number) => (
                        <div key={i}>
                            <PayActivityBox
                                loadOrderItems={true}
                                loadDebitNotes={true}
                                loadActivityState={true}
                                activityId={activity.id}
                                ownerId={props.ownerId}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const listOrderItems = () => {
        if (agreementOrderItems == null) {
            return <div className="debit-note-list">Order items not loaded</div>;
        }
        if (agreementOrderItems.orderItems.length === 0) {
            return <div className="debit-note-list">No order items</div>;
        }
        let orderItemSum = BigNumber(0);
        for (const orderItem of agreementOrderItems.orderItems) {
            orderItemSum = orderItemSum.plus(BigNumber(orderItem.amount));
        }
        return (
            <div className="debit-note-list">
                <div className="debit-note-list-title">Payment order items</div>
                <table className="debit-note-list-table">
                    <thead>
                    <tr>
                        <th>Order id</th>
                        <th>Owner id</th>
                        <th>Payee address</th>
                        <th>Amount</th>
                        <th>Allocation id</th>
                        <th>Agreement id</th>
                        <th>Invoice id</th>
                        <th>Activity id</th>
                        <th>Debit note id</th>
                    </tr>
                    </thead>
                    <tbody>
                    {agreementOrderItems.orderItems.map((orderItem: any, i: number) => (
                        <tr key={i}>
                            <td>{orderItem.orderId}</td>
                            <td>{orderItem.ownerId}</td>
                            <td>{orderItem.payeeAddr}</td>
                            <td>{orderItem.amount}</td>
                            <td>{orderItem.allocationId}</td>
                            <td>{orderItem.agreementId}</td>
                            <td>{orderItem.invoiceId}</td>
                            <td>{orderItem.activityId}</td>
                            <td>{orderItem.debitNoteId}</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan={3}>Total</td>
                        <td>{orderItemSum.toString()}</td>
                        <td colSpan={5}></td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        );
    };

    return (
        <div className={"pay-agreement-box"}>
            <div className={"pay-agreement-box-body"}>
                <div className={"pay-agreement-id"}>PayAgreement no {props.agreementId}</div>
                <div className="pay-agreement-entry">Owner: {props.ownerId}</div>

                <button onClick={() => setReloadCounter(reloadCounter + 1)}>Reload</button>
                <table className="pay-agreement-amount-table">
                    <thead>
                    <tr>
                        <th>Due</th>
                        <th>Accepted</th>
                        <th>Scheduled</th>
                        <th>Paid</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{agreement?.totalAmountDue ?? "N/A"}</td>
                        <td>{agreement?.totalAmountAccepted ?? "N/A"}</td>
                        <td>{agreement?.totalAmountScheduled ?? "N/A"}</td>
                        <td>{agreement?.totalAmountPaid ?? "N/A"}</td>
                    </tr>
                    </tbody>
                </table>
                {listOrderItems()}
                {listActivities()}
            </div>
        </div>
    );
};

export default PayAgreementBox;
