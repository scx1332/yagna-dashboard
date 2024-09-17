import React from "react";
import "./AgreementIdBox.css";

interface AgreementIdBoxProps {
    agreementId: string;
    ownerId: string;
}
function render(agreementId: string, ownerId: string, shortAgreementId: string) {
    return (
        <span title={agreementId}>
            <a href={`payAgreement?ownerId=${ownerId}&agreementId=${agreementId}`}>{shortAgreementId}</a>
        </span>
    );
}

const AgreementIdBox = (props: AgreementIdBoxProps) => {
    const shortAgreementId = props.agreementId.substring(0, 8);

    return render(props.agreementId, props.ownerId, shortAgreementId);
};

export default AgreementIdBox;
