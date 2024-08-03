interface PayAgreement {
    id: string,
    ownerId: string,
    role: string,
    peerId: string,
    payeeAddr: string,
    payerAddr: string,
    paymentPlatform: string,
    totalAmountDue: string,
    totalAmountAccepted: string,
    totalAmountScheduled: string,
    totalAmountPaid: string,
    appSessionId: string,
    createdTs: string,
    updatedTs: string,
}

export default PayAgreement;
