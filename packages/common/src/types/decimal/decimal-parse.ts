import { Decimal, DecimalInput } from './decimal-type';

export function decimalTryParse(param: DecimalInput): Decimal | null {
	let decimal: Decimal;
	if (typeof param === 'number') {
		decimal = new Decimal(param);
	} else if (typeof param === 'string') {
		decimal = new Decimal(param, 10);
	} else if (Decimal.isBigNumber(param)) {
		decimal = param;
	} else {
		return null;
	}
	if (!decimal.isFinite()) return null;
	return decimal;
}

export function decimalParse(param: DecimalInput): Decimal {
	const decimal = decimalTryParse(param);
	if (!decimal) throw new Error(`Invalid decimal: ${param}`);
	return decimal;
}
