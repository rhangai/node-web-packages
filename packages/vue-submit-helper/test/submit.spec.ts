import { useSubmitHelper, useSubmitHelperMultiple } from '../src';

type SubmitTestParam = {
	id: string;
};

describe('submit', () => {
	describe('useSubmitHelper', () => {
		it('should submit', async () => {
			const fn = jest.fn(() => ({}));
			const { submit } = useSubmitHelper(fn);
			await submit();
			expect(fn).toBeCalled();
		});

		it('should submit multiple times correctly', async () => {
			const TIMES = 10;
			const fn = jest.fn(() => ({}));
			const { submit } = useSubmitHelper(fn);
			for (let i = 0; i < TIMES; ++i) {
				await submit();
			}
			expect(fn).toHaveBeenCalledTimes(TIMES);
		});

		it('should throw on parallel submissions', async () => {
			const fn = jest.fn(() => ({}));
			const { submit } = useSubmitHelper(fn);
			const p1 = submit();
			const p2 = submit();
			await p1;
			await expect(p2).rejects.toThrow();
		});

		it('should set submitting to true/false', async () => {
			const fn = jest.fn(() => ({}));
			const { submit, submitting } = useSubmitHelper(fn);
			expect(submitting.value).toBe(false);
			const p1 = submit();
			expect(submitting.value).toBe(true);
			await p1;
			expect(submitting.value).toBe(false);
		});

		it('should reject on submit error', async () => {
			const error = new Error();
			const fn = jest.fn(() => {
				throw error;
			});
			const { submit, submitting } = useSubmitHelper(fn);
			expect(submitting.value).toBe(false);
			const p1 = submit();
			expect(submitting.value).toBe(true);
			await expect(p1).rejects.toThrow(error);
			expect(submitting.value).toBe(false);
		});

		it('should call onSuccess callback', async () => {
			const SUCCESS_VALUE = 100;
			const fn = jest.fn().mockReturnValue(SUCCESS_VALUE);
			const onSuccess = jest.fn();
			const { submit } = useSubmitHelper(fn, { onSuccess });
			await submit('p1');
			expect(onSuccess).toHaveBeenCalledWith(SUCCESS_VALUE, 'p1');
		});

		it('should call onError callback', async () => {
			const error = new Error();
			const fn = jest.fn().mockImplementation(() => {
				throw error;
			});
			const onError = jest.fn();
			const { submit } = useSubmitHelper(fn, { onError });
			await expect(submit('p1')).rejects.toThrow(error);
			expect(onError).toHaveBeenCalledWith(error, 'p1');
		});
	});

	describe('useSubmitHelperMultiple', () => {
		it('should submit', async () => {
			const fn = jest.fn();
			const { submit } = useSubmitHelperMultiple<SubmitTestParam>(fn, (item) => item.id);
			await submit({ id: '1' });
			expect(fn).toHaveBeenCalledWith({ id: '1' });
		});

		it('should submit multiple items', async () => {
			const fn = jest.fn();
			const { submit } = useSubmitHelperMultiple<SubmitTestParam>(fn, (item) => item.id);
			const values = ['1', '2', '3'];
			const promises: Array<Promise<unknown>> = [];
			for (const value of values) {
				promises.push(submit({ id: value }));
			}
			await Promise.all(promises);
			for (const value of values) {
				expect(fn).toHaveBeenCalledWith({ id: value });
			}
		});

		it('should set submittingMap/submittingAny/isSubmitting', async () => {
			const fn = jest.fn();
			const { submit, submittingAny, submittingMap, isSubmitting } =
				useSubmitHelperMultiple<SubmitTestParam>(fn, (item) => item.id);
			expect(submittingAny.value).toBe(false);

			const values = ['1', '2', '3'];
			const promises: Array<Promise<unknown>> = [];
			for (const value of values) {
				promises.push(submit({ id: value }));
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
