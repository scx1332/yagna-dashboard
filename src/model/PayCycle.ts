export interface PayCycle {
    "nodeId": string
    "platform": string
    "cron": string | null,
    "intervalSec": number | null,
    "lastProcess": string | null,
    "maxIntervalSec": number,
    "nextProcess": string,
    "extraPayTimeSec": number,
}