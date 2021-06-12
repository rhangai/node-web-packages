import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';

export function dateSetup(): void {
	dayjs.extend(CustomParseFormat);
}
