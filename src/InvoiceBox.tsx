import React from "react";
import "./InvoiceBox.css";
import DateBox from "./DateBox";
import ChainDetails from "./ChainDetails";
import ContractDetails from "./ContractDetails";
import { fromWei } from "./common/Web3Utils";
import Invoice from "./model/Invoice";
import {parseEther} from "ethers/lib/utils";

interface InvoiceBoxProps {
    invoice: Invoice | null;
}

const InvoiceBox = (props: InvoiceBoxProps) => {
    //const [config] = useConfig();
    if (props.invoice == null) {
        return <div>Unknown invoice</div>;
    }

    const amount = parseEther(props.invoice.amount);
    const bn = amount;

    return (
        <div className={"invoice-box"}>
            <div className={"invoice-box-body"}>
                <div className={"invoice-id"}>Invoice no {props.invoice.id}</div>
                <div className={"invoice-owner"}>
                    1
                </div>
                <div className={"invoice-owner-descr"}>
                    <span>Owner/Account</span>
                </div>

                <div className={"invoice-confirm-date"}>
                    <DateBox date={props.invoice.timestamp} title={"Confirmed Date"} />
                </div>
                <div className={"invoice-tx-id"}>Agreement id: {props.invoice.agreementId}</div>
                <div className={"invoice-spender"}>
                    1
                </div>

            </div>
        </div>
    );
};

export default InvoiceBox;
