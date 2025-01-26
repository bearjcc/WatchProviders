export type ISOYear = `${number}${number}${number}${number}`;
export type ISOMonth = `${number}${number}`;
export type ISODay = `${number}${number}`;
export type ISOHours = `${number}${number}`;
export type ISOMinutes = `${number}${number}`;
export type ISOSeconds = `${number}${number}`;
export type ISOMilliseconds = `${number}${number}${number}`;

export type ISODateString = `${ISOYear}-${ISOMonth}-${ISODay}`;
export type ISOTimeString = `${ISOHours}:${ISOMinutes}:${ISOSeconds}.${ISOMilliseconds}`;
export type ISODateTimeString = `${ISODateString}T${ISOTimeString}`;