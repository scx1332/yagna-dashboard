import React, {useCallback, useContext, useEffect} from "react";
import "./PayAgreementBox.css";
import PayAgreement from "./model/PayAgreement";
import {parseEther} from "ethers/lib/utils";
import {backendFetch} from "./common/BackendCall";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import PayActivity from "./model/PayActivity";
import PayActivityBox from "./PayActivityBox";

interface PayAgreementBoxProps {
    payAgreement: PayAgreement;
    loadActivities: boolean;
}

interface GetActivitiesResponse {
    activities: any[];
}

const PayAgreementBox = (props: PayAgreementBoxProps) => {
    const {backendSettings} = useContext(BackendSettingsContext);
    //const [config] =
    //if (props.payAgreement == null) {
    //    return <div>Unknown payAgreement</div>;
    //}


    const [activities, setActivities] = React.useState<GetActivitiesResponse | null>(null);
    const loadActivities = useCallback(async () => {
        if (props.loadActivities) {
            const response = await backendFetch(backendSettings, `/payment-api/v1/payAgreement/${props.payAgreement.id}/activities`);
            const response_json = await response.json();
            setActivities({"activities": response_json});
        }
    }, [props.loadActivities]);

    useEffect(() => {
        loadActivities().then();
    }, [loadActivities]);

    const amount = parseEther(props.payAgreement.totalAmountAccepted);
    const listActivities = () => {
        if (activities == null) {
            return <div className="debit-note-list">Activities loaded</div>;
        }
        if (activities.activities.length === 0) {
            return <div className="debit-note-list">No activities</div>;
        }
        return <div className="debit-note-list">
            <div className="activity-list-title">Activities</div>
            <div className="activity-list-body">
                {(activities.activities.map((activity: PayActivity, i: number) => (
                    <div key={i}>
                        <PayActivityBox payActivity={activity} loadDebitNotes={true}/>
                    </div>
                )))}
            </div>
        </div>
    }

    return (
        <div className={"pay-agreement-box"}>
            <div className={"pay-agreement-box-body"}>
                <div className={"pay-agreement-id"}>PayAgreement no {props.payAgreement.id}</div>
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
                {listActivities()}
            </div>
        </div>
    );
};

export default PayAgreementBox;
