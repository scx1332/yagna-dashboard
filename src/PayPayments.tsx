import React, { useCallback, useContext, useEffect } from "react";
import PayPaymentBox from "./PayPaymentBox";
import { PayPayment } from "./model/PayPayments";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { backendFetch } from "./common/BackendCall";

interface GetPayPaymentsResponse {
    payPayments: PayPayment[];
}

const PayPayments = () => {
    const [payPayments, setPayPayments] = React.useState<GetPayPaymentsResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const loadPayPayments = useCallback(async () => {
        const response = await backendFetch(backendSettings, "/payment-api/v1/payments");
        const response_json = await response.json();
        setPayPayments({ payPayments: response_json });
    }, []);

    function row(payPayment: PayPayment, i: number) {
        return <PayPaymentBox key={i} payPayment={payPayment} />;
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
