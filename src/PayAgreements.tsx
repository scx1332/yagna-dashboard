import React, { useCallback, useContext, useEffect } from "react";
import PayAgreementBox from "./PayAgreementBox";
import PayAgreement from "./model/PayAgreement";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { backendFetchYagna } from "./common/BackendCall";
import AgreementIdBox from "./AgreementIdBox";
import DateBox from "./DateBox";

interface GetPayAgreementsResponse {
    payAgreements: PayAgreement[];
}

const PayAgreements = () => {
    const [payAgreements, setPayAgreements] = React.useState<GetPayAgreementsResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const loadPayAgreements = useCallback(async () => {
        let payAgreements: PayAgreement[] = [];
        for (const yagna_server of backendSettings.yagnaServers) {
            const response = await backendFetchYagna(yagna_server, "/payment-api/v1/payAgreements");
            const response_json = await response.json();
            const payAgreementsLoc = response_json;
            payAgreements = payAgreements.concat(payAgreementsLoc);
            // add server information
        }
        const payAgreementsSorted = payAgreements
            .sort((a: PayAgreement, b: PayAgreement) => {
                return a.createdTs.localeCompare(b.createdTs);
            })
            .reverse();
        setPayAgreements({ payAgreements: payAgreementsSorted });
    }, []);


    useEffect(() => {
        loadPayAgreements().then();
    }, [loadPayAgreements]);



    return (
        <div>
            <h1>PayAgreements</h1>


            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Role</th>
                    <th>Owner</th>
                    <th>Accepted amount</th>
                    <th>Scheduled amount</th>
                    <th>Paid amount</th>

                    <th>Created Timestamp</th>
                    <th>Created</th>
                </tr>
                </thead>
                <tbody>
                {payAgreements?.payAgreements.map((agreement: PayAgreement) => (
                    <tr key={agreement.id}>
                        <td><AgreementIdBox agreementId={agreement.id} ownerId={agreement.ownerId}/></td>
                        <td>{agreement.role}</td>
                        <td>{agreement.ownerId}</td>
                        <td>{agreement.totalAmountAccepted}</td>
                        <td>{agreement.totalAmountScheduled}</td>
                        <td>{agreement.totalAmountPaid}</td>
                        <td><DateBox date={agreement.updatedTs} title={""}/></td>
                    </tr>
                ))}
                </tbody>
            </table>

            {JSON.stringify(payAgreements)}
        </div>
    );
};

export default PayAgreements;
