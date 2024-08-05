interface Invoice {
    invoiceId: string;
    issuerId: string;
    recipientId: string,
    payeeAddr: string,
    payerAddr: string,
    paymentPlatform: string,
    timestamp: string,
    agreementId: string,
    activityIds: string[],
    amount: string,
    paymentDueDate: string,
    status: string
}

export default Invoice;
