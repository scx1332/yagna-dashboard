import React, {useCallback, useContext, useEffect} from "react";
import "./PayActivityBox.css";
import PayActivity from "./model/PayActivity";
import {parseEther} from "ethers/lib/utils";
import {backendFetch} from "./common/BackendCall";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import DebitNote from "./model/DebitNote";

interface PayActivityBoxProps {
    payActivity: PayActivity;
    loadDebitNotes: boolean;
}

interface GetDebitNotesResponse {
    debitNotes: DebitNote[];
}

const PayActivityBox = (props: PayActivityBoxProps) => {
    const { backendSettings } = useContext(BackendSettingsContext);

    const [debitNotes, setDebitNotes] = React.useState<GetDebitNotesResponse | null>(null);
    const loadDebitNotes = useCallback(async () => {
        if (props.loadDebitNotes) {
            const response = await backendFetch(backendSettings, `/payment-api/v1/payActivity/${props.payActivity.id}/debitNotes`);
            const response_json = await response.json();
            setDebitNotes({"debitNotes":response_json});
        }
    }, [props.loadDebitNotes]);

    useEffect(() => {
        loadDebitNotes().then();
    }, [loadDebitNotes]);

    const amount = parseEther(props.payActivity.totalAmountAccepted);

    const listDebitNotes = () => {
        if (debitNotes == null) {
            return <div>Debit notes not loaded</div>;
        }
        if (debitNotes.debitNotes.length === 0) {
            return <div>No debit notes</div>;
        }
        return <div>
            <h2>Debit notes</h2>
            {debitNotes.debitNotes.map((debitNote: DebitNote, i: number) => (
                <div key={i}>
                    <div>
                        <div>Debit note no {debitNote.debitNoteId}</div>
                    </div>
                </div>
            ))}
        </div>
    }
    return (
        <div className={"pay-activity-box"}>
            <div className={"pay-activity-box-body"}>
                <div className={"pay-activity-id"}>PayActivity no {props.payActivity.id}</div>

                {listDebitNotes()}
            </div>
        </div>
    );
};

export default PayActivityBox;
