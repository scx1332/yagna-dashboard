export interface PayCycle {
    "nodeId": string
    "platform": string
    "cron": string | null,
    "intervalSec": bigint | null,
    "lastProcess": string | null,
    "maxIntervalSec": bigint,
    "nextProcess": string,
}