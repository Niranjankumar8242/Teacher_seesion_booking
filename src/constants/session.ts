export const SESSION_STATUSES = ['AVAILABLE', 'BOOKED', 'COMPLETED'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];
