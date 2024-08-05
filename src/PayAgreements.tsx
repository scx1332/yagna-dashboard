import React, { useCallback, useContext, useEffect } from "react";
import PayAgreementBox from "./PayAgreementBox";
import PayAgreement from "./model/PayAgreement";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { backendFetch } from "./common/BackendCall";

interface GetPayAgreementsResponse {
    payAgreements: PayAgreement[];
}

const PayAgreements = () => {
    const [payAgreements, setPayAgreements] = React.useState<GetPayAgreementsResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const loadPayAgreements = useCallback(async () => {
        const response = await backendFetch(backendSettings, "/payment-api/v1/payAgreements");
        const response_json = await response.json();
        setPayAgreements({ payAgreements: response_json });
    }, []);

    function row(payAgreement: PayAgreement, i: number) {
        return <PayAgreementBox loadActivities={true} key={i} payAgreement={payAgreement} />;
    }

    useEffect(() => {
        loadPayAgreements().then();
    }, [loadPayAgreements]);
    return (
        <div>
            <h1>PayAgreements</h1>
            {payAgreements?.payAgreements.map(row)}
            {JSON.stringify(payAgreements)}
        </div>
    );
};

export default PayAgreements;
