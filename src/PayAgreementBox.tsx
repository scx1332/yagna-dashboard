import React, { useCallback, useContext, useEffect } from "react";
import "./PayAgreementBox.css";
import PayAgreement from "./model/PayAgreement";
import {backendFetch, backendFetchYagna} from "./common/BackendCall";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import PayActivity from "./model/PayActivity";
import PayActivityBox from "./PayActivityBox";

interface PayAgreementBoxProps {
    payAgreement: PayAgreement;
    loadActivities: boolean;
    loadOrderItems: boolean;
}

interface GetActivitiesResponse {
    activities: any[];
}

interface GetOrderItemsResponse {
    orderItems: any;
}


const PayAgreementBox = (props: PayAgreementBoxProps) => {
    const { backendSettings } = useContext(BackendSettingsContext);
    //const [config] =
    //if (props.payAgreement == null) {
    //    return <div>Unknown payAgreement</div>;
    //}

    const [activities, setActivities] = React.useState<GetActivitiesResponse | null>(null);
    const loadActivities = useCallback(async () => {
        if (props.loadActivities) {
            const yagnaServer = backendSettings.yagnaServers.find((ys) => ys.identity == props.payAgreement.ownerId);

            if (yagnaServer) {
                const response = await backendFetchYagna(
                    yagnaServer,
                    `/payment-api/v1/payAgreements/${props.payAgreement.id}/activities`,
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
                `/payment-api/v1/payAgreements/${props.payAgreement.id}/orders`,
            );
            const response_json = await response.json();
            setAgreementOrderItems({ orderItems: response_json });
        }
    }, [props.loadOrderItems]);


    useEffect(() => {
        Promise.all([loadActivities(), loadAgreementOrderItems()]).then();
    }, [loadActivities, loadAgreementOrderItems]);

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
                                payActivity={activity} />
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
        return <div className="debit-note-list">
            <div className="debit-note-list-title">Order items</div>
            <table className="debit-note-list-table">
                <thead>
                <tr>
                    <th>Order id</th>
                    <th>Owner id</th>
                    <th>Payee address</th>
                    <th>Amount</th>
                    <th>Agreement id</th>
                    <th>Invoice id</th>
                    <th>Activity id</th>
                    <th>Debit note id</th>
                </tr>
                </thead>
                <tbody>
                {agreementOrderItems.orderItems.map((orderItem: any, i: number) => (
                    <tr key={i}>
                        <td>{orderItem.order_id}</td>
                        <td>{orderItem.owner_id}</td>
                        <td>{orderItem.payee_addr}</td>
                        <td>{orderItem.amount}</td>
                        <td>{orderItem.agreement_id}</td>
                        <td>{orderItem.invoice_id}</td>
                        <td>{orderItem.activity_id}</td>
                        <td>{orderItem.debit_note_id}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    }

    return (
        <div className={"pay-agreement-box"}>
            <div className={"pay-agreement-box-body"}>
                <div className={"pay-agreement-id"}>PayAgreement no {props.payAgreement.id}</div>
                <div className="pay-agreement-entry">Owner: {props.payAgreement.ownerId}</div>

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
                        <td>{props.payAgreement.totalAmountDue}</td>
                        <td>{props.payAgreement.totalAmountAccepted}</td>
                        <td>{props.payAgreement.totalAmountScheduled}</td>
                        <td>{props.payAgreement.totalAmountPaid}</td>
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
