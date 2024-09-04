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
    amount: string;
    paymentId: string | null;
    paid: boolean;
}

export interface BatchOrderItemDocument {
    ts: string;
    order_id: string;
    owner_id: string;
    payee_addr: string;
    amount: string;
    agreement_id: string;
    invoice_id: string | null;
    activity_id: string | null;
    debit_note_id: string | null;
}
