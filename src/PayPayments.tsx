import React, { useCallback, useContext, useEffect } from "react";
import { PayPaymentBoxWrapper} from "./PayPaymentBox";
import { PayPayment } from "./model/PayPayments";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import {backendFetchYagna} from "./common/BackendCall";

interface GetPayPaymentsResponse {
    payPayments: PayPayment[];
}

const PayPayments = () => {
    const [payPayments, setPayPayments] = React.useState<GetPayPaymentsResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const loadPayPayments = useCallback(async () => {
        let payPayments: PayPayment[] = [];
        for (const yagna_server of backendSettings.yagnaServers) {
            const response = await backendFetchYagna(yagna_server, "/payment-api/v1/payments?timeout=0");
            const response_json = await response.json();
            const payPaymentsLoc = response_json;
            for (const payPayment of payPaymentsLoc) {
                payPayment.yagnaServer = yagna_server;
            }
            payPayments = payPayments.concat(payPaymentsLoc);
        }
        //sort by timestamp
        const payPaymentsSorted = payPayments.sort((a: PayPayment, b: PayPayment) => {
            return a.timestamp.localeCompare(b.timestamp);
        }).reverse();
        setPayPayments({ payPayments: payPaymentsSorted });
    }, []);

    function row(payPayment: PayPayment, i: number) {
        return <PayPaymentBoxWrapper key={i} payPaymentId={payPayment.paymentId} nodeId={payPayment.yagnaServer.identity} />;
    }

    useEffect(() => {
        loadPayPayments().then();
    }, [loadPayPayments]);
    return (
        <div>
            <h1>PayPayments</h1>
            {payPayments?.payPayments.map(row)}
            {JSON.stringify(payPayments)}
        </div>
    );
};

export default PayPayments;
