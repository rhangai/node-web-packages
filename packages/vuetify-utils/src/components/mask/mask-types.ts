import IMask from 'imask';

// Máscara de data
type MaskDateOptions = {
	format?: string;
};

export const maskDate = (options?: MaskDateOptions | null) => ({
	mask: options?.format ?? 'DD/MM/YYYY',
	blocks: {
		YYYY: {
			mask: IMask.MaskedRange,
			from: 1900,
			to: 2100,
		},
		MM: {
			mask: IMask.MaskedRange,
			from: 1,
			to: 12,
		},
		DD: {
			mask: IMask.MaskedRange,
			from: 1,
			to: 31,
		},
		HH: {
			mask: IMask.MaskedRange,
			from: 0,
			to: 23,
		},
		mm: {
			mask: IMask.MaskedRange,
			from: 0,
			to: 59,
		},
	},
});
