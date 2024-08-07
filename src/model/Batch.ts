interface BatchOrderItemDocument {
    "ts": string,
    "order_id": string,
    "owner_id": string,
    "payee_addr": string,
    "amount": string,
    "agreement_id": string,
    "invoice_id": string | null,
    "activity_id": string | null,
    "debit_note_id": string | null
}

export default BatchOrderItemDocument;
