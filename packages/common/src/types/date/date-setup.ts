import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';
import Utc from 'dayjs/plugin/utc';

export function dateSetup(): void {
	dayjs.extend(CustomParseFormat);
	dayjs.extend(Utc);
}
