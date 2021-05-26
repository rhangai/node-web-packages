import { BigNumber } from 'bignumber.js';

export type DecimalInput = string | BigNumber | number;
export type Decimal = BigNumber;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Decimal = BigNumber.clone();
