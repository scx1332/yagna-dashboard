import React, { useCallback, useContext, useEffect } from "react";
import PayActivityBox from "./PayActivityBox";
import PayActivity from "./model/PayActivity";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { backendFetch } from "./common/BackendCall";

interface GetPayActivitiesResponse {
    payActivities: PayActivity[];
}

const PayActivities = () => {
    const [payActivities, setPayActivities] = React.useState<GetPayActivitiesResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const loadPayActivities = useCallback(async () => {
        const response = await backendFetch(backendSettings, "/payment-api/v1/payActivities");
        const response_json = await response.json();
        setPayActivities({"payActivities":response_json});
    }, []);

    function row(payActivity: PayActivity, i: number) {
        return <PayActivityBox key={i} payActivity={payActivity} />;
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
