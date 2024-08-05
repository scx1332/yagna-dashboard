import React, { useCallback, useContext, useEffect } from "react";
import "./PayActivityBox.css";
import PayActivity from "./model/PayActivity";
import { backendFetch } from "./common/BackendCall";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import DebitNote from "./model/DebitNote";
import Invoice from "./model/Invoice";

interface PayActivityBoxProps {
    payActivity: PayActivity;
    loadDebitNotes: boolean;
}

interface GetDebitNotesResponse {
    debitNotes: DebitNote[];
}

interface GetInvoiceResponse {
    invoice: Invoice | null;
}

const PayActivityBox = (props: PayActivityBoxProps) => {
    const { backendSettings } = useContext(BackendSettingsContext);

    const [debitNotes, setDebitNotes] = React.useState<GetDebitNotesResponse | null>(null);
    const loadDebitNotes = useCallback(async () => {
        if (props.loadDebitNotes) {
            const response = await backendFetch(
                backendSettings,
                `/payment-api/v1/payActivity/${props.payActivity.id}/debitNotes`,
            );
            const response_json = await response.json();
            setDebitNotes({ debitNotes: response_json });
        }
    }, [props.loadDebitNotes]);
    const [invoice, setInvoice] = React.useState<GetInvoiceResponse | null>(null);
    const loadInvoice = useCallback(async () => {
        if (props.loadDebitNotes) {
            const response = await backendFetch(
                backendSettings,
                `/payment-api/v1/payActivity/${props.payActivity.id}/invoice`,
            );
            const response_json = await response.json();
            setInvoice({ invoice: response_json });
        }
    }, [props.loadDebitNotes]);

    useEffect(() => {
        loadDebitNotes().then();
    }, [loadDebitNotes]);
    useEffect(() => {
        loadInvoice().then();
    }, [loadInvoice]);

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
                            <th>Debit note id</th>
                            <th>Due</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                            <th>Usage counter vector</th>
                            <th>Previous debit note id</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debitNotes.debitNotes.map((debitNote: DebitNote, i: number) => (
                            <tr key={i}>
                                <td>{debitNote.debitNoteId}</td>
                                <td>{debitNote.totalAmountDue}</td>
                                <td>{debitNote.status}</td>
                                <td>{debitNote.timestamp}</td>
                                <td>{`[${debitNote.usageCounterVector.join(";")}]`}</td>
                                <td>{debitNote.previousDebitNoteId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
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
    return (
        <div className={"pay-activity-box"}>
            <div className={"pay-activity-box-body"}>
                <div className={"pay-activity-id"}>
                    Amounts for activity with id <b>{props.payActivity.id}</b> (Role: {props.payActivity.role}):
                </div>
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
                            <td>{props.payActivity.totalAmountDue}</td>
                            <td>{props.payActivity.totalAmountAccepted}</td>
                            <td>{props.payActivity.totalAmountScheduled}</td>
                            <td>{props.payActivity.totalAmountPaid}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="pay-activity-entry">{`Agreement id: ${props.payActivity.agreementId}`}</div>
                {renderInvoice(invoice)}
                <div className="pay-activity-entry">{`Created at: ${props.payActivity.createdTs}`}</div>
                {listDebitNotes()}
            </div>
        </div>
    );
};

export default PayActivityBox;
