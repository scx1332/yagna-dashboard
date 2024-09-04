import { YagnaServer } from "../common/BackendSettings";

export interface ValidateDepositCall {
    arguments: { [key: string]: string };
}

export interface AllocationDeposit {
    id: string;
    contract: string;
    validate: ValidateDepositCall | null;
}

export interface PayAllocation {
    yagnaServer: YagnaServer;
    allocationId: string;
    address: string;
    paymentPlatform: string;
    totalAmount: string;
    spentAmount: string;
    remainingAmount: string;
    timestamp: string;
    timeout: string | null;
    deposit: AllocationDeposit | null;
    makeDeposit: boolean;
    extendTimeout: string | null;
}

export interface PayAllocationExpenditure {
    allocationId: string;
    agreementId: string;
    activityId: string | null;
    acceptedAmount: string;
    scheduledAmount: string;
}

export interface AllocationDepositUpdate {
    validate: ValidateDepositCall | null;
}

export interface UpdateAllocation {
    totalAmount: string | null;
    timeout: string | null;
    deposit: AllocationDepositUpdate | null;
}

export interface NewAllocation {
    address: string;
    paymentPlatform: string;
    totalAmount: string;
    timeout: string | null;
    deposit: AllocationDeposit | null;
    makeDeposit: boolean;
    extendTimeout: number | null;
}
