interface PayActivity {
    id: string,
    ownerId: string,
    role: string,
    agreementId: string,
    totalAmountDue: string,
    totalAmountAccepted: string,
    totalAmountScheduled: string,
    totalAmountPaid: string,
    appSessionId: string,
    createdTs: string,
    updatedTs: string,
}

export default PayActivity;
