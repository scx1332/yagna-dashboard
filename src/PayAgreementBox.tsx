import React from "react";
import "./PayAgreementBox.css";
import DateBox from "./DateBox";
import ChainDetails from "./ChainDetails";
import ContractDetails from "./ContractDetails";
import { fromWei } from "./common/Web3Utils";
import PayAgreement from "./model/PayAgreement";
import {parseEther} from "ethers/lib/utils";

interface PayAgreementBoxProps {
    payAgreement: PayAgreement;
}

const PayAgreementBox = (props: PayAgreementBoxProps) => {
    //const [config] =
    //if (props.payAgreement == null) {
    //    return <div>Unknown payAgreement</div>;
    //}

    const amount = parseEther(props.payAgreement.totalAmountAccepted);

    return (
        <div className={"pay-agreement-box"}>
            <div className={"pay-agreement-box-body"}>
                <div className={"pay-agreement-id"}>PayAgreement no {props.payAgreement.id}</div>

            </div>
        </div>
    );
};

export default PayAgreementBox;
