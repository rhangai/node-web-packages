import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';

export function dateSetup() {
	dayjs.extend(CustomParseFormat);
}
