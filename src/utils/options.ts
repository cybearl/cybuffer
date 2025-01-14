/**
 * Fills in the missing options with the default values.
 * @param defaults The default options.
 * @param options The options to fill in.
 * @returns The options with the missing values filled in (= method parameters).
 */
export function convertOptionsToParams<T>(defaults: T, options?: Partial<T>): T {
	return { ...defaults, ...options }
}
