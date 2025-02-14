import { describe, expect, it, vi } from 'vitest';
import { useSubmitArgHelper, useSubmitHelper, useSubmitHelperMultiple } from '../src';

type SubmitTestParam = {
	id: string;
};

describe('submit', () => {
	describe('useSubmitHelper', () => {
		it('should submit', async () => {
			const fn = vi.fn(() => ({}));
			const { submitAsync } = useSubmitHelper({ submitFn: fn });
			await submitAsync();
			expect(fn).toBeCalled();
		});

		it('should submit multiple times correctly', async () => {
			const TIMES = 10;
			const fn = vi.fn(() => ({}));
			const { submitAsync } = useSubmitHelper({ submitFn: fn });
			for (let i = 0; i < TIMES; ++i) {
				await submitAsync();
			}
			expect(fn).toHaveBeenCalledTimes(TIMES);
		});

		it('should throw on parallel submissions', async () => {
			const fn = vi.fn(() => ({}));
			const { submitAsync } = useSubmitHelper({ submitFn: fn });
			const p1 = submitAsync();
			const p2 = submitAsync();
			await p1;
			await expect(p2).rejects.toThrow();
		});

		it('should set submitting to true/false', async () => {
			const fn = vi.fn(() => ({}));
			const { submitAsync, submitting } = useSubmitHelper({ submitFn: fn });
			expect(submitting.value).toBe(false);
			const p1 = submitAsync();
			expect(submitting.value).toBe(true);
			await p1;
			expect(submitting.value).toBe(false);
		});

		it('should reject on submit error', async () => {
			const error = new Error();
			const fn = vi.fn(() => {
				throw error;
			});
			const { submitAsync, submitting } = useSubmitHelper({ submitFn: fn });
			expect(submitting.value).toBe(false);
			const p1 = submitAsync();
			expect(submitting.value).toBe(true);
			await expect(p1).rejects.toThrow(error);
			expect(submitting.value).toBe(false);
		});

		it('should call onSuccess callback', async () => {
			const SUCCESS_VALUE = 100;
			const fn = vi.fn().mockReturnValue(SUCCESS_VALUE);
			const onSuccess = vi.fn();
			const { submitAsync } = useSubmitArgHelper({ submitFn: fn, onSuccess });
			await submitAsync('p1');
			expect(onSuccess).toHaveBeenCalledWith(SUCCESS_VALUE, 'p1');
		});

		it('should call onError callback', async () => {
			const error = new Error();
			const fn = vi.fn().mockImplementation(() => {
				throw error;
			});
			const onError = vi.fn();
			const { submitAsync } = useSubmitArgHelper({ submitFn: fn, onError });
			await expect(submitAsync('p1')).rejects.toThrow(error);
			expect(onError).toHaveBeenCalledWith(error, 'p1');
		});
	});

	describe('useSubmitHelperMultiple', () => {
		it('should submit', async () => {
			const fn = vi.fn();
			const { submitAsync } = useSubmitHelperMultiple<SubmitTestParam>({
				submitFn: fn,
				keyFn: (item) => item.id,
			});
			await submitAsync({ id: '1' });
			expect(fn).toHaveBeenCalledWith({ id: '1' });
		});

		it('should submit multiple items', async () => {
			const fn = vi.fn();
			const { submitAsync } = useSubmitHelperMultiple<SubmitTestParam>({
				submitFn: fn,
				keyFn: (item) => item.id,
			});
			const values = ['1', '2', '3'];
			const promises: Array<Promise<unknown>> = [];
			for (const value of values) {
				promises.push(submitAsync({ id: value }));
			}
			await Promise.all(promises);
			for (const value of values) {
				expect(fn).toHaveBeenCalledWith({ id: value });
			}
		});

		it('should set submittingMap/submittingAny/isSubmitting', async () => {
			const fn = vi.fn();
			const { submitAsync, submittingAny, submittingMap, isSubmitting } =
				useSubmitHelperMultiple<SubmitTestParam>({
					submitFn: fn,
					keyFn: (item) => item.id,
				});
			expect(submittingAny.value).toBe(false);

			const values = ['1', '2', '3'];
			const promises: Array<Promise<unknown>> = [];
			for (const value of values) {
				promises.push(submitAsync({ id: value }));
			}
			expect(submittingAny.value).toBe(true);
			for (const value of values) {
				expect(submittingMap.value[value]).toBe(true);
				expect(isSubmitting({ id: value })).toBe(true);
			}
			await Promise.all(promises);
			expect(submittingAny.value).toBe(false);
			for (const value of values) {
				expect(submittingMap.value[value]).not.toBeTruthy();
				expect(isSubmitting({ id: value })).toBe(false);
			}
		});
	});
});
