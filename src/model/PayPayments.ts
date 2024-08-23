import {YagnaServer} from "../common/BackendSettings";

export interface PayAgreementPayment {
    agreementId: string,
    amount: string,
    allocationId: string | null,
}

export interface PayActivityPayment {
    activityId: string,
    amount: string,
    allocationId: string | null,
}

export interface PayPayment {
    yagnaServer: YagnaServer,
    paymentId: string,
    payerId: string,
    payeeId: string,
    payerAddr: string,
    payeeAddr: string,
    paymentPlatform: string,
    amount: string,
    timestamp: string,
    agreementPayments: [PayAgreementPayment],
    activityPayments: [PayActivityPayment],
    details: string,
}
