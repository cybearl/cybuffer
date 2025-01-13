/**
 * Format an error message with the name of the module.
 * @param name The name of the module.
 * @param message The error message.
 * @returns The formatted error message.
 */
export function fe(name: string, message: string): string {
	return `[CyBuffer - ${name}] ${message}`
}
