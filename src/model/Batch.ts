export interface BatchOrder {
    id: string;
    ts: string;
    ownerId: string;
    payerAddr: string;
    driver: string;
    platform: string;
    totalAmount: string;
    paidAmount: string;
    paid: boolean;
}

export interface BatchOrderItem {
    orderId: string;
    ownerId: string;
    payeeAddr: string;
    allocationId: string;
    amount: string;
    paymentId: string | null;
    paid: boolean;
}

export interface BatchOrderItemDocument {
    ts: string;
    orderId: string;
    ownerId: string;
    payeeAddr: string;
    allocationId: string;
    amount: string;
    agreementId: string;
    invoiceId: string | null;
    activityId: string | null;
    debitNoteId: string | null;
}
