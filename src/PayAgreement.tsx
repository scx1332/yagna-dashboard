import React from "react";
import PayAgreementBox from "./PayAgreementBox";

const PayAgreementSingle = () => {
    const params = new URLSearchParams(window.location.search);
    const agreementId = params.get("agreementId");
    const ownerId = params.get("ownerId");

    if (!agreementId || !ownerId) {
        return <div>Invalid URL</div>;
    }
    return (
        <div>
            <PayAgreementBox agreementId={agreementId} ownerId={ownerId} loadActivities={true} loadOrderItems={true}/>
        </div>
    );
};

export default PayAgreementSingle;
