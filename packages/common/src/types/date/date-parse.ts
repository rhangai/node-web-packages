import dayjs from 'dayjs';
import { DateType, DateTypeInput } from './date-type';

export type DateParseOptions = {
	inputFormat?: string;
};

export function dateParse(
	param: DateTypeInput,
	{ inputFormat = 'YYYY-MM-DD' }: DateParseOptions
): DateType {
	let date: DateType;
	if (typeof param === 'string') {
		date = dayjs(param, inputFormat);
	} else {
		date = dayjs(param);
	}
	if (!date.isValid()) throw new Error(`Invalid date: ${param}`);
	return date;
}
