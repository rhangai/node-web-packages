import dayjs from 'dayjs';
import { DateType, DateTypeInput } from './date-type';

export type DateParseOptions = {
	inputFormat?: string;
};

export function dateTryParse(
	param: DateTypeInput,
	{ inputFormat = 'YYYY-MM-DD' }: DateParseOptions
): DateType | null {
	let date: DateType;
	if (typeof param === 'string') {
		date = dayjs(param, inputFormat);
	} else {
		date = dayjs(param);
	}
	if (!date.isValid()) return null;
	return date;
}

export function dateParse(param: DateTypeInput, options: DateParseOptions): DateType {
	const date = dateTryParse(param, options);
	if (!date) throw new Error(`Invalid date: ${param}`);
	return date;
}
