import React from "react";
import "./PayPaymentBox.css";
import DateBox from "./DateBox";
import { PayPayment } from "./model/PayPayments";

interface PayPaymentBoxProps {
    payPayment: PayPayment | null;
}

const PayPaymentBox = (props: PayPaymentBoxProps) => {
    //const [config] = useConfig();
    if (props.payPayment == null) {
        return <div>Unknown payPayment</div>;
    }

    return (
        <div className={"pay-payment-box"}>
            <div className={"pay-payment-box-body"}>
                <div className={"pay-payment-id"}>PayPayment no {props.payPayment.paymentId}</div>
                <div className={"pay-payment-owner"}>1</div>
                <div className={"pay-payment-owner-descr"}>
                    <span>Owner/Account</span>
                </div>

                <div className={"pay-payment-confirm-date"}>
                    <DateBox date={props.payPayment.timestamp} title={"Confirmed Date"} />
                </div>
                <div className={"pay-payment-tx-id"}>Agreement id: {props.payPayment.paymentId}</div>
                <div className={"pay-payment-spender"}>1</div>
            </div>
        </div>
    );
};

export default PayPaymentBox;
