import React from "react";
import "./PayActivityBox.css";
import DateBox from "./DateBox";
import ChainDetails from "./ChainDetails";
import ContractDetails from "./ContractDetails";
import { fromWei } from "./common/Web3Utils";
import PayActivity from "./model/PayActivity";
import {parseEther} from "ethers/lib/utils";

interface PayActivityBoxProps {
    payActivity: PayActivity;
}

const PayActivityBox = (props: PayActivityBoxProps) => {
    //const [config] =
    //if (props.payActivity == null) {
    //    return <div>Unknown payActivity</div>;
    //}

    const amount = parseEther(props.payActivity.totalAmountAccepted);

    return (
        <div className={"pay-activity-box"}>
            <div className={"pay-activity-box-body"}>
                <div className={"pay-activity-id"}>PayActivity no {props.payActivity.id}</div>

            </div>
        </div>
    );
};

export default PayActivityBox;
