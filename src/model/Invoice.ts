interface Invoice {
    id: string;
    ownerId: string;
    role: string;
    peerId: string;
    payeeAddr: string;
    payerAddr: string;
    paymentPlatform: string;
    timestamp: string;
    agreementId: string;
    activityIds: [string];
    amount: string;
    paymentDueDate: string;
    status: string;
}

export default Invoice;
