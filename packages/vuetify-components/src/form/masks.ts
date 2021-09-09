import { ref, Ref, computed } from 'vue-demi';
import IMask, { AnyMaskedOptions } from 'imask';
import { mapObjIndexed } from 'ramda';

export const MASKS: Ref<Record<string, AnyMaskedOptions>> = ref({
	cep: { mask: '00000-000' },
	cpf: { mask: '000.000.000-00' },
	cnpj: { mask: '00.000.000/0000-00' },
	date: { mask: '00/00/0000' },
	horario: { mask: '00:00' },
	cpfcnpj: {
		mask: [{ mask: '000.000.000-00' }, { mask: '00.000.000/0000-00' }],
		prepare: (v: string) => v.replace(/\D/g, ''),
	},
	telefone: {
		mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }],
		prepare: (v: string) => v.replace(/\D/g, ''),
	},
});

export const MASKS_PIPE = computed<Record<string, (v: string) => string>>(() => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return mapObjIndexed((v) => IMask.createPipe(v as any), MASKS.value);
});

export function maskRegister(key: string, mask: unknown): void {
	MASKS.value[key] = mask;
}

export function maskValue(key: string, value: string): string {
	const pipe = MASKS_PIPE.value[key];
	if (!pipe) return value;
	return pipe(value);
}
