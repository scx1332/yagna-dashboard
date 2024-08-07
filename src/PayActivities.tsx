import React, {useCallback, useContext, useEffect} from "react";
import PayActivityBox from "./PayActivityBox";
import PayActivity from "./model/PayActivity";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {backendFetch} from "./common/BackendCall";

interface GetPayActivitiesResponse {
    payActivities: PayActivity[];
}

const PayActivities = () => {
    const [payActivities, setPayActivities] = React.useState<GetPayActivitiesResponse | null>(null);
    const {backendSettings} = useContext(BackendSettingsContext);

    const loadPayActivities = useCallback(async () => {
        const limitDate = new Date();
        limitDate.setHours(limitDate.getHours() - 24);
        const encodedTimestamp = encodeURIComponent(limitDate.toISOString());
        const response = await backendFetch(
            backendSettings,
            `/payment-api/v1/payActivities?afterTimestamp=${encodedTimestamp}`,
        );
        const response_json = await response.json();
        let activities = response_json;
        activities = activities.sort((a: PayActivity, b: PayActivity) => {
            return b.createdTs.localeCompare(a.createdTs);
        });
        setPayActivities({payActivities: activities});
    }, []);

    function row(payActivity: PayActivity, i: number) {
        return <PayActivityBox loadActivityState={true} loadOrderItems={true} loadDebitNotes={true} key={i}
                               payActivity={payActivity}/>;
    }

    useEffect(() => {
        loadPayActivities().then();
    }, [loadPayActivities]);
    return (
        <div>
            <h1>PayActivities</h1>
            {payActivities?.payActivities.map(row)}
            {JSON.stringify(payActivities)}
        </div>
    );
};

export default PayActivities;
