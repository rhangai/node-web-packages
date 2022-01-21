import dayjs from 'dayjs';
import 'dayjs/plugin/utc';

export type DateTypeInput = string | Date | dayjs.Dayjs | DateType;
export type DateType = dayjs.Dayjs;
