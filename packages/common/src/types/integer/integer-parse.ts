import { Decimal } from '../decimal';

export type IntegerInput = number | string | Decimal | null;

export function integerTryParse(param: IntegerInput): number | null {
	let value: number;
	if (param == null) return null;
	if (typeof param === 'number') {
		value = Math.floor(param);
	} else if (typeof param === 'string') {
		if (!param) return null;
		value = parseInt(param, 10);
	} else if (Decimal.isBigNumber(param)) {
		value = parseInt(param.toFixed(0, Decimal.ROUND_FLOOR), 10);
	} else {
		return null;
	}
	if (!Number.isFinite(value)) return null;
	return value;
}

export function integerParse(param: IntegerInput): number {
	const intValue = integerTryParse(param);
	if (intValue == null) throw new Error(`Invalid int: ${param}`);
	return intValue;
}
