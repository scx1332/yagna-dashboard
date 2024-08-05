interface DebitNote {
    debitNoteId: string;
    issuerId: string;
    recipientId: string;
    payeeAddr: string;
    payerAddr: string;
    paymentPlatform: string;
    previousDebitNoteId: string;
    timestamp: string;
    agreementId: string;
    activityId: string;
    totalAmountDue: string;
    usageCounterVector: [number];
    paymentDueDate: string;
    status: string;
}

export default DebitNote;
