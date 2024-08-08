import React from "react";
import "./AgreementIdBox.css";

interface AgreementIdBoxProps {
    agreementId: string;
}
function render(agreementId: string, shortAgreementId: string) {
    return (
        <span title={agreementId}>
            <a href={`payAgreements/${agreementId}`}>{shortAgreementId}</a>
        </span>
    );
}

const AgreementIdBox = (props: AgreementIdBoxProps) => {
    const shortAgreementId = props.agreementId.substring(0, 8);

    return render(props.agreementId, shortAgreementId);
};

export default AgreementIdBox;
