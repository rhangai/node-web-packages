import { ref, Ref } from 'vue-demi';

export const MASKS: Ref<Record<string, unknown>> = ref({
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

export function registerMask(key: string, mask: unknown): void {
	MASKS.value[key] = mask;
}
