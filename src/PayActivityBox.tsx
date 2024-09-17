import React, { useCallback, useContext, useEffect } from "react";
import "./PayActivityBox.css";
import PayActivity from "./model/PayActivity";
import { backendFetchYagna } from "./common/BackendCall";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import DebitNote from "./model/DebitNote";
import Invoice from "./model/Invoice";
import {BigNumber} from "bignumber.js";

interface PayActivityBoxProps {
    activityId: string;
    ownerId: string;
    loadDebitNotes: boolean;
    loadActivityState: boolean;
    loadOrderItems: boolean;
}

interface GetDebitNotesResponse {
    debitNotes: DebitNote[];
}

interface GetInvoiceResponse {
    invoice: Invoice | null;
}
interface GetActivityStateResponse {
    state: any;
}
interface GetOrderItemsResponse {
    orderItems: any;
}

const PayActivityBox = (props: PayActivityBoxProps) => {
    const { backendSettings } = useContext(BackendSettingsContext);

    const [activity, setActivity] = React.useState<PayActivity | null>(null);
    const loadActivity = useCallback(async () => {
        const yagnaServer = backendSettings.yagnaServers.find((ys) => ys.identity == props.ownerId);

        if (yagnaServer) {
            const response = await backendFetchYagna(
                yagnaServer,
                `/payment-api/v1/payActivities/${props.activityId}`,
            );
            const response_json = await response.json();
            setActivity(response_json);
        }
    }, [props.activityId, props.ownerId]);

    const [debitNotes, setDebitNotes] = React.useState<GetDebitNotesResponse | null>(null);
    const loadDebitNotes = useCallback(async () => {
        if (props.loadDebitNotes) {
            const yagnaServer = backendSettings.yagnaServers.find((ys) => ys.identity == props.ownerId);

            if (yagnaServer) {
                const response = await backendFetchYagna(
                    yagnaServer,
                    `/payment-api/v1/payActivities/${props.activityId}/debitNotes`,
                );
                const response_json = await response.json();
                setDebitNotes({ debitNotes: response_json });
            }
        }
    }, [props.loadDebitNotes]);
    const [invoice, setInvoice] = React.useState<GetInvoiceResponse | null>(null);
    const loadInvoice = useCallback(async () => {
        if (props.loadDebitNotes) {
            const yagnaServer = backendSettings.yagnaServers.find((ys) => ys.identity == props.ownerId);

            if (yagnaServer) {
                const response = await backendFetchYagna(
                    yagnaServer,
                    `/payment-api/v1/payActivities/${props.activityId}/invoice`,
                );
                const response_json = await response.json();
                setInvoice({ invoice: response_json });
            }
        }
    }, [props.loadDebitNotes]);

    const [activityState, setActivityState] = React.useState<GetActivityStateResponse | null>(null);
    const loadActivityState = useCallback(async () => {
        if (props.loadActivityState) {
            const yagnaServer = backendSettings.yagnaServers.find((ys) => ys.identity == props.ownerId);

            if (yagnaServer) {
                const response = await backendFetchYagna(
                    yagnaServer,
                    `/activity-api/v1/activity/${props.activityId}/state`,
                );
                const response_json = await response.json();
                setActivityState({ state: response_json });
            }
        }
    }, [props.loadActivityState]);

    const [activityOrderItems, setActivityOrderItems] = React.useState<GetOrderItemsResponse | null>(null);
    const loadActivityOrderItems = useCallback(async () => {
        if (props.loadOrderItems) {
            const yagnaServer = backendSettings.yagnaServers.find((ys) => ys.identity == props.ownerId);

            if (yagnaServer) {
                const response = await backendFetchYagna(
                    yagnaServer,
                    `/payment-api/v1/payActivities/${props.activityId}/orders`,
                );
                const response_json = await response.json();
                setActivityOrderItems({ orderItems: response_json });
            }
        }
    }, [props.loadOrderItems]);

    const [updateCounter, setUpdateCounter] = React.useState(0);
    useEffect(() => {
        setDebitNotes(null);
        setInvoice(null);
        setActivityState(null);
        setActivityOrderItems(null);
        Promise.all([loadActivity(), loadDebitNotes(), loadInvoice(), loadActivityState(), loadActivityOrderItems()]).then();
    }, [loadActivityState, loadActivity, loadInvoice, loadDebitNotes, loadActivityOrderItems, updateCounter]);

    const listDebitNotes = () => {
        if (debitNotes == null) {
            return <div className="debit-note-list">Debit notes not loaded</div>;
        }
        if (debitNotes.debitNotes.length === 0) {
            return <div className="debit-note-list">No debit notes</div>;
        }

        return (
            <div className="debit-note-list">
                <div className="debit-note-list-title">Debit notes</div>
                <table className="debit-note-list-table">
                    <thead>
                        <tr>
                            <th>Debit nonce</th>
                            <th>Debit note id</th>
                            <th>Due</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                            <th>Usage counter vector</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debitNotes.debitNotes.map((debitNote: DebitNote, i: number) => (
                            <tr key={i}>
                                <td>{debitNote.debitNonce}</td>
                                <td>
                                    <span title={debitNote.debitNoteId}>{debitNote.debitNoteId.substring(0, 8)}</span>
                                </td>
                                <td>{debitNote.totalAmountDue}</td>
                                <td>{debitNote.status}</td>
                                <td>{debitNote.timestamp}</td>
                                <td>{`[${debitNote.usageCounterVector.join(";")}]`}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const listOrderItems = () => {
        if (activityOrderItems == null) {
            return <div className="debit-note-list">Order items not loaded</div>;
        }
        if (activityOrderItems.orderItems.length === 0) {
            return <div className="debit-note-list">No order items</div>;
        }
        let orderItemSum = BigNumber(0);
        for (const orderItem of activityOrderItems.orderItems) {
            orderItemSum = orderItemSum.plus(BigNumber(orderItem.amount));
        }
        return (
            <div className="debit-note-list">
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
                        {activityOrderItems.orderItems.map((orderItem: any, i: number) => (
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
                    <tfoot>
                        <tr>
                            <td colSpan={3}>Total</td>
                            <td>{orderItemSum.toString()}</td>
                            <td colSpan={4}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    };

    const renderActivityState = (activityState: GetActivityStateResponse | null) => {
        if (activityState == null || !activityState.state) {
            return <div className="activity-state-info">Activity state not loaded</div>;
        }
        //check if array
        if (Array.isArray(activityState.state.state)) {
            const states = activityState.state.state;

            return (
                <div>
                    State pair: [{states[0]}, {states[1]}]
                </div>
            );
        }
    };

    const renderInvoice = (invoice: GetInvoiceResponse | null) => {
        if (invoice == null) {
            return <div className="invoice-info">Invoice not loaded</div>;
        }
        if (invoice.invoice == null) {
            return <div className="invoice-info">No invoice</div>;
        }
        const inv = invoice.invoice;
        return (
            <div className="debit-note-list">
                <div className="debit-note-list-title">Invoice</div>
                <table className="debit-note-list-table">
                    <thead>
                        <tr>
                            <th>Invoice id</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{inv.invoiceId}</td>
                            <td>{inv.status}</td>
                            <td>{inv.timestamp}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    const handleReloadButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setUpdateCounter(updateCounter + 1);
    };

    return (
        <div className={"pay-activity-box"}>
            <button onClick={handleReloadButtonClick}>Reload</button>
            <div className={"pay-activity-box-body"}>
                <div className={"pay-activity-id"}>
                    Amounts for activity with id <b>{props.activityId}</b> (Role: {activity?.role || "unknown"}):
                </div>
                <div className="pay-activity-entry">Owner: {props.ownerId}</div>

                <table className="pay-activity-amount-table">
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
                            <td>{activity?.totalAmountDue ?? "N/A"}</td>
                            <td>{activity?.totalAmountAccepted ?? "N/A"}</td>
                            <td>{activity?.totalAmountScheduled ?? "N/A"}</td>
                            <td>{activity?.totalAmountPaid ?? "N/A"}</td>
                        </tr>
                    </tbody>
                </table>
                {renderActivityState(activityState)}

                <div className="pay-activity-entry">{`Agreement id: ${activity?.agreementId ?? "N/A"}`}</div>
                {renderInvoice(invoice)}

                <div className="pay-activity-entry">{`Created at: ${activity?.createdTs ?? "N/A"}`}</div>

                {listOrderItems()}

                {listDebitNotes()}
            </div>
        </div>
    );
};

export default PayActivityBox;
