import type { TransformableInfo } from "logform"
import { createLogger, format, transports } from "winston"

/**
 * A simple printf function for Winston.
 * @param info The log info.
 * @returns The formatted log message.
 */
function printf(info: TransformableInfo) {
	return info.message as string
}

/**
 * Logger format.
 */
const loggerFormat = format.combine(
	format.timestamp({ format: "HH:mm:ss" }),
	format.printf(printf),
	format.colorize({ all: true }),
)

/**
 * Main Winston logger instance.
 */
const logger = createLogger({
	format: loggerFormat,
	transports: [new transports.Console({ level: "silly" })],
})

export default logger
