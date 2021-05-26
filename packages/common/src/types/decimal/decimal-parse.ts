import { Decimal, DecimalInput } from './decimal-type';

export function decimalParse(param: DecimalInput): Decimal {
	let decimal: Decimal;
	if (typeof param === 'number') {
		decimal = new Decimal(param);
	} else if (typeof param === 'string') {
		decimal = new Decimal(param, 10);
	} else if (Decimal.isBigNumber(param)) {
		decimal = param;
	} else {
		throw new Error(`Invalid decimal: ${param}`);
	}
	if (!decimal.isFinite()) throw new Error(`Invalid decimal: ${param}`);
	return decimal;
}
