export type AppTableHeaderColumn = {
	text: string;
	value: string;
	width?: number | string;
	sortable?: boolean;
	align?: 'left' | 'center' | 'right';
};

export type AppTableHeaders = AppTableHeaderColumn[];
