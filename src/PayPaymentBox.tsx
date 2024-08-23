import React, {useCallback, useContext} from "react";
import "./PayPaymentBox.css";
import DateBox from "./DateBox";
import { PayPayment } from "./model/PayPayments";
import {backendFetchYagna} from "./common/BackendCall";
import {getYagnaServerById, YagnaServer} from "./common/BackendSettings";
import {BackendSettingsContext} from "./BackendSettingsProvider";

interface PayPaymentBoxProps {
    payPayment: PayPayment | null;
}
interface PayPaymentBoxWrapperProps {
    payPaymentId: string;
    nodeId: string;
}

/*
export interface PayAgreementPayment {
    agreementId: string,
    amount: string,
    allocationId: string | null,
}

export interface PayActivityPayment {
    activityId: string,
    amount: string,
    allocationId: string | null,
}

export interface PayPayment {
    paymentId: string,
    payerId: string,
    payeeId: string,
    payerAddr: string,
    payeeAddr: string,
    paymentPlatform: string,
    amount: string,
    timestamp: string,
    agreementPayments: [PayAgreementPayment],
    activityPayments: [PayActivityPayment],
    details: string,
}

 */

export const PayPaymentBoxWrapper = (props: PayPaymentBoxWrapperProps) => {
    const { backendSettings } = useContext(BackendSettingsContext);
    const [payPayment, setPayPayment] = React.useState<PayPayment | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const loadPayPayment = useCallback(async () => {

        try {
            const yagnaServer = getYagnaServerById(backendSettings, props.nodeId);
            const response = await backendFetchYagna(yagnaServer, "/payment-api/v1/payments/" + props.payPaymentId);
            const response_json = await response.json();
            response_json.yagnaServer = yagnaServer;

            setPayPayment(response_json);
            setError(null);
        } catch (e) {
            setError(`Error encountered: ${e}`);
        }
    }, []);

    React.useEffect(() => {
        loadPayPayment().then();
    }, [loadPayPayment]);
    return (
        <div>
            <h3>PayPayment with {props.payPaymentId}</h3>
            {error && <div>{error}</div>}
            <PayPaymentBox payPayment={payPayment} />
        </div>
    );
}

export const PayPaymentBox = (props: PayPaymentBoxProps) => {
    //const [config] = useConfig();
    if (props.payPayment == null) {
        return <div>Unknown payPayment</div>;
    }

    //decode base 64 details
    const detailsDecoded = atob(props.payPayment.details);
    const hexString = "0x" + Array.from(detailsDecoded)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
    return (
        <div className={"pay-payment-box"}>

            <div className={"pay-payment-box-body"}>
                <h3>PayPayment - from node id: {props.payPayment.yagnaServer.identity} </h3>
                <h3>{props.payPayment.paymentPlatform}</h3>
                <div className={"pay-payment-box-entry"}>PayPayment no: {props.payPayment.paymentId}</div>
                <div className={"pay-payment-box-entry"}>Amount: <b>{props.payPayment.amount} GLM</b></div>
                <div className={"pay-payment-box-entry"}>Timestamp: <DateBox date={props.payPayment.timestamp}
                                                                             title={""}/></div>
                <div className={"pay-payment-box-entry"}>Payer ID: {props.payPayment.payerId}</div>
                <div className={"pay-payment-box-entry"}>Payee ID: {props.payPayment.payeeId}</div>
                <div className={"pay-payment-box-entry"}>Payer Addr: {props.payPayment.payerAddr}</div>
                <div className={"pay-payment-box-entry"}>Details interpreted as transaction id:
                    {props.payPayment.paymentPlatform == "erc20-holesky-tglm" &&
                        <a href={"https://holesky.etherscan.io/tx/" + hexString}>{hexString}</a>}
                    {props.payPayment.paymentPlatform == "erc20-polygon-glm" &&
                        <a href={"https://polygonscan.com/tx/" + hexString}>{hexString}</a>}
                </div>

                <h3>List of activity/agreement payments </h3>
                {props.payPayment.activityPayments.map((activityPayment, i) =>
                    <div key={i} className={"pay-payment-box-entry"}>
                        Activity payment: {activityPayment.activityId} amount: {activityPayment.amount}
                    </div>)}
                <h3>List of agreement (anonymous activity) payments </h3>
                {props.payPayment.agreementPayments.map((agreementPayment, i) =>
                    <div key={i} className={"pay-payment-box-entry"}>
                        Agreement payment: {agreementPayment.agreementId} amount: {agreementPayment.amount}
                    </div>
                )}

            </div>
        </div>
    );
};
