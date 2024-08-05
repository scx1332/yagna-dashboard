import React from "react";
import "./InvoiceBox.css";
import DateBox from "./DateBox";
import Invoice from "./model/Invoice";

interface InvoiceBoxProps {
    invoice: Invoice | null;
}

const InvoiceBox = (props: InvoiceBoxProps) => {
    //const [config] = useConfig();
    if (props.invoice == null) {
        return <div>Unknown invoice</div>;
    }

    return (
        <div className={"invoice-box"}>
            <div className={"invoice-box-body"}>
                <div className={"invoice-id"}>Invoice no {props.invoice.invoiceId}</div>
                <div className={"invoice-owner"}>1</div>
                <div className={"invoice-owner-descr"}>
                    <span>Owner/Account</span>
                </div>

                <div className={"invoice-confirm-date"}>
                    <DateBox date={props.invoice.timestamp} title={"Confirmed Date"} />
                </div>
                <div className={"invoice-tx-id"}>Agreement id: {props.invoice.agreementId}</div>
                <div className={"invoice-spender"}>1</div>
            </div>
        </div>
    );
};

export default InvoiceBox;
