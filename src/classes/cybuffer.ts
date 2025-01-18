import { randomFillSync } from "node:crypto"
import type { Bit, Endianness, StringEncoding } from "@/types/general"
import { fe } from "@/utils/formats"

/**
 * `CyBuffer` is a helper class that indirectly extends the Uint8Array class with additional methods
 * similar to the Buffer class in Node.js, while also providing multiple utility methods
 * linked to advanced cryptography and binary data manipulation.
 */
export default class CyBuffer {
	/**
	 * The platform's endianness which all related methods will use by default,
	 * in order to normalize the endianness parameter.
	 */
	readonly platformEndianness: Endianness

	/**
	 * The ArrayBuffer instance referenced by the buffer.
	 */
	readonly arrayBuffer: ArrayBuffer

	/**
	 * The Uint8Array instance that acts as a bridge between the buffer and the array buffer.
	 */
	readonly array: Uint8Array

	/**
	 * The offset in bytes of the buffer.
	 */
	readonly offset: number

	/**
	 * The length in bytes of the buffer.
	 */
	readonly length: number

	/**
	 * Creates a new `CyBuffer` instance based on a length or an input.
	 * @param length The length of the buffer to create.
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @param options The options to use (optional).
	 * - `arrayBuffer`: The array buffer to use.
	 * - `offset`: The offset in bytes to start reading from (optional, defaults to 0).
	 * - `length`: The length in bytes to read (optional, defaults to the input length).
	 */
	constructor(
		length: number,
		options?: {
			arrayBuffer: ArrayBuffer
			offset?: number
			length?: number
		},
	) {
		if (length < 0) throw new RangeError(fe("constructor", `Invalid buffer length: '${length}'.`))
		if (!Number.isInteger(length)) throw new TypeError(fe("constructor", `Invalid buffer length: '${length}'.`))

		this.platformEndianness = this.getPlatformEndianness()

		if (options) {
			this.arrayBuffer = options.arrayBuffer
			this.offset = options.offset ?? 0
			this.length = options.length ?? length
			this.array = new Uint8Array(this.arrayBuffer, this.offset, this.length)
		} else {
			this.arrayBuffer = new ArrayBuffer(length)
			this.offset = 0
			this.length = length
			this.array = new Uint8Array(this.arrayBuffer)
		}

		// Applying proxy
		return this._proxy
	}

	/**
	 * ============
	 *  SIGNATURES
	 * ============
	 */

	/**
	 * Signature for the `[]` operator.
	 */
	[index: number]: number

	/**
	 * ==================
	 *  INTERNAL METHODS
	 * ==================
	 */

	/**
	 * Get the platform endianness.
	 * @returns The platform endianness.
	 */
	getPlatformEndianness = (): Endianness => {
		const tmpUint8Array = new Uint8Array(4)
		const tmpUint16View = new Uint32Array(tmpUint8Array.buffer)

		tmpUint16View[0] = 0xff00
		return tmpUint8Array[0] === 0xff ? "BE" : "LE"
	}

	/**
	 * Normalizes the endianness parameter.
	 *
	 * By default, the extended Uint8Array is written for Little Endian, to keep it consistent,
	 * if the platform is big endian the endianness parameter is reversed.
	 *
	 * - Little endian platform:
	 *   - `LE` read from left to right.
	 *   - `BE` read from right to left.
	 * - Big endian platform:
	 *   - `LE` read from right to left.
	 *   - `BE` read from left to right.
	 */
	normalizeEndianness = (endianness: Endianness): Endianness => {
		if (this.platformEndianness === "BE") {
			if (endianness === "LE") return "BE"
			return "LE"
		}

		return endianness
	}

	/**
	 * Checks the offset and length for validity.
	 *
	 * **Note:** This method is used internally by the read/write methods.
	 * @param offset The offset to check.
	 * @param length The length to check.
	 * @throws If the offset or length are invalid.
	 * @returns The current buffer instance.
	 */
	check = (offset: number, length: number): this => {
		if (Number.isNaN(offset) || Number.isNaN(length)) {
			throw new TypeError(fe("check", `Invalid offset: '${offset}' or length: '${length}'.`))
		}

		if (offset < 0 || offset >= this.length) {
			throw new RangeError(fe("check", `Invalid offset: '${offset}', it must be >= 0 & < ${this.length}.`))
		}

		if (length < 1 || length > this.length) {
			throw new RangeError(fe("check", `Invalid length: '${length}', it must be > 0 & <= ${this.length}.`))
		}

		if (offset + length > this.length) {
			throw new RangeError(
				fe(
					"check",
					`Invalid offset (${offset}) + length (${length}): '${offset + length}', it must be <= ${this.length}.`,
				),
			)
		}

		if (offset % 1 !== 0) throw new RangeError(fe("check", `Invalid offset alignment: '${offset}'.`))
		if (length % 1 !== 0) throw new RangeError(fe("check", `Invalid length alignment: '${length}'.`))

		return this
	}

	/**
	 * ================
	 *  STATIC METHODS
	 * ================
	 */

	/**
	 * Creates a new `CyBuffer` instance of the specified length, initially filled with zeros.
	 * @param length The length of the buffer.
	 * @param fillWith The value to initially fill the buffer with (optional).
	 * @returns A new `CyBuffer` instance.
	 */
	static alloc = (length: number, fillWith?: number): CyBuffer => {
		const buffer = new CyBuffer(length)
		if (fillWith !== undefined) buffer.fill(fillWith)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from an hexadecimal string (supports `0x` prefix).
	 *
	 * **Note:** There is no `endianness` parameter here as there is no concept of word size,
	 * the order will simply follow the string.
	 * @param value The hexadecimal string to create the buffer from.
	 * @returns A new `CyBuffer` instance.
	 */
	static fromHexString = (value: string): CyBuffer => {
		// Remove any `0x` prefix before writing
		if (value.startsWith("0x")) value = value.slice(2)

		const byteLength = Math.ceil(value.length / 2)
		const buffer = new CyBuffer(byteLength)
		buffer.writeHexString(value, 0, byteLength)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from an UTF-8 string.
	 * @param value The UTF-8 string to create the buffer from.
	 * @returns A new `CyBuffer` instance.
	 */
	static fromUtf8String = (value: string): CyBuffer => {
		const buffer = new CyBuffer(value.length)
		buffer.writeUtf8String(value, 0, value.length)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from a string using a specific encoding.
	 * @param value The string to create the buffer from.
	 * @param encoding The encoding to use (optional, defaults to "utf8").
	 * @returns A new `CyBuffer` instance.
	 */
	static fromString = (value: string, encoding: StringEncoding = "utf8"): CyBuffer => {
		const buffer = new CyBuffer(value.length)
		buffer.writeString(value, encoding, 0, value.length)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from an array of bits.
	 * @param array The array of bits to create the buffer from.
	 * @param msbFirst Whether to write the bits from the most significant bit (optional, defaults to `true`).
	 * @returns A new `CyBuffer` instance.
	 */
	static fromBits = (array: Bit[], msbFirst = true): CyBuffer => {
		const buffer = new CyBuffer(Math.ceil(array.length / 8))
		buffer.writeBits(array, 0, array.length, msbFirst)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from a Uint8Array.
	 * @param array The Uint8Array to create the buffer from.
	 * @returns A new `CyBuffer` instance.
	 */
	static fromUint8Array = (array: Uint8Array): CyBuffer => {
		const buffer = new CyBuffer(array.byteLength)
		buffer.writeUint8Array(array, 0, array.byteLength)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from a Uint16Array.
	 * @param array The Uint16Array to create the buffer from.
	 * @returns A new `CyBuffer` instance.
	 */
	static fromUint16Array = (array: Uint16Array): CyBuffer => {
		const buffer = new CyBuffer(array.byteLength)
		buffer.writeUint16Array(array, 0, array.byteLength)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from a Uint32Array.
	 * @param array The Uint32Array to create the buffer from.
	 * @returns A new `CyBuffer` instance.
	 */
	static fromUint32Array = (array: Uint32Array): CyBuffer => {
		const buffer = new CyBuffer(array.byteLength)
		buffer.writeUint32Array(array, 0, array.byteLength)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from a big integer.
	 * @param value The big integer to create the buffer from.
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @returns A new `CyBuffer` instance.
	 */
	static fromBigInt = (value: bigint, endianness?: Endianness): CyBuffer => {
		if (value < 0n) throw new RangeError(fe("fromBigInt", `Invalid big integer: '${value}'.`))

		const byteLength = Math.ceil(value.toString(16).length / 2)
		const buffer = new CyBuffer(byteLength)
		buffer.writeBigInt(value, 0, byteLength, endianness)
		return buffer
	}

	/**
	 * Creates a new `CyBuffer` instance from a range of numbers between 0 and 255.
	 * @param start The start of the range, inclusive.
	 * @param end The end of the range, exclusive.
	 * @returns A new `CyBuffer` instance.
	 */
	static fromRange = (start: number, end: number): CyBuffer => {
		const buffer = new CyBuffer(end - start)
		buffer.writeRange(start, end)
		return buffer
	}

	/**
	 * ===========
	 *  ACCESSORS
	 * ===========
	 */

	/**
	 * The proxy that allows to access/assign values via the [] operator.
	 * Note that both the getter and setter are safe and never throw.
	 * @returns The proxy returned by the constructor.
	 */
	private get _proxy(): CyBuffer {
		return new Proxy(this, {
			get: (target, prop) => {
				if (typeof prop === "string" && !Number.isNaN(Number(prop))) {
					this.check(Number(prop), 1)

					return target.array[Number(prop)] ?? undefined
				}

				return target[prop as keyof this]
			},
			set: (target, prop, value) => {
				if (typeof prop === "string" && !Number.isNaN(Number(prop))) {
					const parsedValue = Number(value)

					if (Number.isNaN(parsedValue)) {
						throw new TypeError(fe("proxy", `Invalid value: '${value}'.`))
					}

					if (parsedValue < 0 || parsedValue > 255) {
						throw new RangeError(fe("proxy", `Value is out of bounds: '${value}'.`))
					}

					this.check(Number(prop), 1)

					target.array[Number(prop)] = value
					return true
				}

				target[prop as keyof this] = value
				return true
			},
		})
	}

	/**
	 * The symbol iterator of the buffer, allowing to iterate over the buffer
	 * using `for..of` loops and returning bytes.
	 * @returns A new generator yielding the bytes of the buffer.
	 */
	*[Symbol.iterator](): Generator<number> {
		let i = 0
		while (i < this.length) yield this.array[i++]
	}

	/**
	 * Iterates over the buffer and yields the index and value of each byte as an array.
	 * @returns The generator yielding the index and value of each byte.
	 */
	*entries(): Generator<[number, number]> {
		for (let i = 0; i < this.length; i++) {
			yield [i, this.array[i]]
		}
	}

	/**
	 * ===============
	 *  WRITE METHODS
	 * ===============
	 */

	/**
	 * Writes an hexadecimal string to the buffer (supports `0x` prefix).
	 *
	 * **Note:** There is no `endianness` parameter here as there is no concept of word size,
	 * the order will simply follow the string.
	 * @param value The hexadecimal string to write to the buffer.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the value length).
	 * @returns The current buffer instance.
	 */
	writeHexString = (value: string, offset = 0, length = value.length / 2): this => {
		if (length === 0) {
			throw new RangeError(fe("writeHexString", `Invalid hexadecimal string length: '${length}'.`))
		}

		if (length % 1 !== 0) {
			throw new RangeError(fe("writeHexString", `Invalid hexadecimal string length: '${length}'.`))
		}

		if (value.length % 2 !== 0) {
			throw new RangeError(fe("writeHexString", `Invalid hexadecimal string length: '${value.length}'.`))
		}

		// Remove any `0x` prefix before writing
		if (value.startsWith("0x")) {
			// Detects if the length is equal to the default value,
			// if it is, edit the length by removing the prefix
			if (length === value.length / 2) length = (value.length - 2) / 2
			value = value.slice(2)
		}

		this.check(offset, length)

		for (let i = 0; i < length; i++) {
			const highNibble = value.charCodeAt(i * 2) | 0x20 // Convert to lowercase for A-F
			const lowNibble = value.charCodeAt(i * 2 + 1) | 0x20 // Convert to lowercase for A-F

			// Converts the pair of hexadecimal characters to a byte
			this.array[offset + i] =
				((highNibble - (highNibble > 57 ? 87 : 48)) << 4) | (lowNibble - (lowNibble > 57 ? 87 : 48))
		}

		return this
	}

	/**
	 * Writes an UTF-8 string to the buffer.
	 * @param value The UTF-8 string to write to the buffer.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the value length).
	 * @returns The current buffer instance.
	 */
	writeUtf8String = (value: string, offset = 0, length = value.length): this => {
		if (length === 0) {
			throw new RangeError(fe("writeUtf8String", `Invalid UTF-8 string length: '${length}'.`))
		}

		this.check(offset, length)

		for (let i = 0; i < length; i++) this.array[offset + i] = value.charCodeAt(i)
		return this
	}

	/**
	 * Writes a string to the buffer using a specific encoding.
	 *
	 * **Notes:**
	 * - The `hex` encoding supports `0x` prefix but there's no `endianness` parameter here,
	 *   it follows the order of the string.
	 * @param value The string to write to the buffer.
	 * @param encoding The encoding to use (optional, defaults to "utf8").
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the value length).
	 * @returns The current buffer instance.
	 */
	writeString = (value: string, encoding: StringEncoding = "utf8", offset = 0, length = value.length): this => {
		if (encoding === "utf8") {
			this.writeUtf8String(value, offset, length)
			return this
		}

		if (encoding === "hex") {
			this.writeHexString(value, offset, Math.ceil(length / 2))
			return this
		}

		throw new TypeError(fe("writeString", `Invalid encoding: '${encoding}'.`))
	}

	/**
	 * Writes a single bit to the buffer.
	 * @param value The value to write (`0` or `1`).
	 * @param bitOffset The offset to read from **as a number of bits** (optional, defaults to 0).
	 * @param msbFirst Whether to write the bit to the most significant bit (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeBit = (value: Bit, bitOffset = 0, msbFirst = true, check = true): this => {
		if (value < 0 || value > 1) throw new RangeError(fe("writeBit", `Value is out of bounds: '${value}'.`))

		const offset = Math.floor(bitOffset / 8)
		if (check) this.check(offset, 1)

		const orientedOffset = msbFirst ? 7 - (bitOffset % 8) : bitOffset % 8
		if (value === 1) this.array[offset] |= 1 << orientedOffset
		else this.array[offset] &= ~(1 << orientedOffset)

		return this
	}

	/**
	 * Writes a single byte to the buffer.
	 * @param value The value to write.
	 * @param offset The offset to write to (optional, defaults to 0).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint8 = (value: number, offset = 0, check = true): this => {
		if (value < 0 || value > 255) {
			throw new RangeError(fe("writeUint8", `Value is out of bounds: '${value}'.`))
		}

		if (check) this.check(offset, 1)

		value >>>= 0
		this.array[offset] = value

		return this
	}

	/**
	 * **[LITTLE ENDIAN]** Writes a single 16-bit value to the buffer.
	 * @param value The value to write.
	 * @param offset The offset to write to (optional, defaults to 0).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 2 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint16LE = (value: number, offset = 0, verifyAlignment = true, check = true): this => {
		if (value < 0 || value > 0xffff) {
			throw new RangeError(fe("writeUint16LE", `Value is out of bounds: '${value}'.`))
		}

		if (verifyAlignment && offset % 2 !== 0) {
			throw new RangeError(fe("writeUint16LE", `Invalid offset alignment: '${offset}' (%2).`))
		}

		if (check) this.check(offset, 2)

		value >>>= 0
		this.array[offset] = value & 0xff
		this.array[offset + 1] = (value >> 8) & 0xff

		return this
	}

	/**
	 * **[BIG ENDIAN]** Writes a single 16-bit value to the buffer.
	 * @param value The value to write.
	 * @param offset The offset to write to (optional, defaults to 0).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 2 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint16BE = (value: number, offset = 0, verifyAlignment = true, check = true): this => {
		if (value < 0 || value > 0xffff) {
			throw new RangeError(fe("writeUint16BE", `Value is out of bounds: '${value}'.`))
		}

		if (verifyAlignment && offset % 2 !== 0) {
			throw new RangeError(fe("writeUint16BE", `Invalid offset alignment: '${offset}' (%2).`))
		}

		if (check) this.check(offset, 2)

		value >>>= 0
		this.array[offset] = (value >> 8) & 0xff
		this.array[offset + 1] = value & 0xff

		return this
	}

	/**
	 * Writes a single 16-bit value to the buffer.
	 * @param value The value to write.
	 * @param offset The offset to write to (optional, defaults to 0).
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 2 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint16 = (
		value: number,
		offset = 0,
		endianness = this.platformEndianness,
		verifyAlignment = true,
		check = true,
	): this => {
		if (this.normalizeEndianness(endianness) === "LE") {
			this.writeUint16LE(value, offset, verifyAlignment, check)
			return this
		}

		this.writeUint16BE(value, offset, verifyAlignment, check)
		return this
	}

	/**
	 * **[LITTLE ENDIAN]** Writes a single 32-bit word to the buffer.
	 * @param value The value to write.
	 * @param offset The offset to write to (optional, defaults to 0).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 4 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint32LE = (value: number, offset = 0, verifyAlignment = true, check = true): this => {
		if (value < 0 || value > 0xffffffff) {
			throw new RangeError(fe("writeUint32LE", `Value is out of bounds: '${value}'.`))
		}

		if (verifyAlignment && offset % 4 !== 0) {
			throw new RangeError(fe("writeUint32LE", `Invalid offset alignment: '${offset}' (%4).`))
		}

		if (check) this.check(offset, 4)

		value >>>= 0
		this.array[offset] = value & 0xff
		this.array[offset + 1] = (value >> 8) & 0xff
		this.array[offset + 2] = (value >> 16) & 0xff
		this.array[offset + 3] = (value >> 24) & 0xff

		return this
	}

	/**
	 * **[BIG ENDIAN]** Writes a single 32-bit word to the buffer.
	 * @param value The value to write.
	 * @param offset The offset to write to (optional, defaults to 0).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 4 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint32BE = (value: number, offset = 0, verifyAlignment = true, check = true): this => {
		if (value < 0 || value > 0xffffffff) {
			throw new RangeError(fe("writeUint32BE", `Value is out of bounds: '${value}'.`))
		}

		if (verifyAlignment && offset % 4 !== 0) {
			throw new RangeError(fe("writeUint32BE", `Invalid offset alignment: '${offset}' (%4).`))
		}

		if (check) this.check(offset, 4)

		value >>>= 0
		this.array[offset] = (value >> 24) & 0xff
		this.array[offset + 1] = (value >> 16) & 0xff
		this.array[offset + 2] = (value >> 8) & 0xff
		this.array[offset + 3] = value & 0xff

		return this
	}

	/**
	 * Writes a single 32-bit word to the buffer.
	 * @param value The value to write.
	 * @param offset The offset to write to (optional, defaults to 0).
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 4 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint32 = (
		value: number,
		offset = 0,
		endianness = this.platformEndianness,
		verifyAlignment = true,
		check = true,
	): this => {
		if (this.normalizeEndianness(endianness) === "LE") {
			this.writeUint32LE(value, offset, verifyAlignment, check)
			return this
		}

		this.writeUint32BE(value, offset, verifyAlignment, check)
		return this
	}

	/**
	 * Writes an array of bits to the buffer.
	 * @param array The array of bits to write to the buffer.
	 * @param bitOffset The offset to start writing at **as a number of bits** (optional, defaults to 0).
	 * @param bitLength The length to write **as a number of bits** (optional, defaults to the array length).
	 * @param msbFirst Whether to write the bits from the most significant bit (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeBits = (array: Bit[], bitOffset = 0, bitLength = array.length, msbFirst = true): this => {
		if (!array || !Array.isArray(array)) {
			throw new TypeError(fe("writeBits", `Invalid array of bits: '${array}'.`))
		}

		const offset = Math.floor(bitOffset / 8)
		const length = Math.ceil(bitLength / 8)
		this.check(offset, length)

		for (let i = 0; i < bitLength; i++) this.writeBit(array[i], bitOffset + i, msbFirst, false)

		return this
	}

	/**
	 * Writes a Uint8Array to the buffer.
	 * @param array The Uint8Array to write to the buffer.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the array length).
	 * @param arrayOffset The offset to start reading from in the array (optional, defaults to 0).
	 * @returns The current buffer instance.
	 */
	writeUint8Array = (array: Uint8Array, offset = 0, length = array.byteLength, arrayOffset = 0): this => {
		if (!array || !(array instanceof Uint8Array)) {
			throw new TypeError(fe("writeUint8Array", `Invalid Uint8Array: '${array}'.`))
		}

		this.check(offset, length)

		for (let i = arrayOffset; i < length; i++) this.array[offset - arrayOffset + i] = array[i]

		return this
	}

	/**
	 * Writes a Uint16Array to the buffer.
	 * @param array The Uint16Array to write to the buffer.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the array length).
	 * @param arrayOffset The offset to start reading from in the array (optional, defaults to 0).
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 2 bytes (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint16Array = (
		array: Uint16Array,
		offset = 0,
		length = array.byteLength,
		arrayOffset = 0,
		endianness = this.platformEndianness,
		verifyAlignment = true,
	): this => {
		if (!array || !(array instanceof Uint16Array)) {
			throw new TypeError(fe("writeUint16Array", `Invalid Uint16Array: '${array}'.`))
		}

		if (verifyAlignment && offset % 2 !== 0) {
			throw new RangeError(fe("writeUint16Array", `Invalid offset alignment: '${offset}' (%2).`))
		}

		this.check(offset, length)

		if (this.normalizeEndianness(endianness) === "LE") {
			for (let i = arrayOffset; i < length; i += 2) {
				this.writeUint16LE(array[i / 2], offset - arrayOffset + i, verifyAlignment, false)
			}

			return this
		}

		for (let i = arrayOffset; i < length; i += 2) {
			this.writeUint16BE(array[i / 2], offset - arrayOffset + i, verifyAlignment, false)
		}

		return this
	}

	/**
	 * Writes a Uint32Array to the buffer.
	 * @param array The Uint16Array to write to the buffer.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the array length).
	 * @param arrayOffset The offset to start reading from in the array (optional, defaults to 0).
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 2 bytes (optional, defaults to `true`).
	 * @returns The current buffer instance.
	 */
	writeUint32Array = (
		array: Uint32Array,
		offset = 0,
		length = array.byteLength,
		arrayOffset = 0,
		endianness = this.platformEndianness,
		verifyAlignment = true,
	): this => {
		if (!array || !(array instanceof Uint32Array)) {
			throw new TypeError(fe("writeUint32Array", `Invalid Uint32Array: '${array}'.`))
		}

		if (verifyAlignment && offset % 4 !== 0) {
			throw new RangeError(fe("writeUint32Array", `Invalid offset alignment: '${offset}' (%4).`))
		}

		this.check(offset, length)

		if (this.normalizeEndianness(endianness) === "LE") {
			for (let i = arrayOffset; i < length; i += 4) {
				this.writeUint32LE(array[i / 4], offset - arrayOffset + i, verifyAlignment, false)
			}

			return this
		}

		for (let i = arrayOffset; i < length; i += 4) {
			this.writeUint32BE(array[i / 4], offset - arrayOffset + i, verifyAlignment, false)
		}

		return this
	}

	/**
	 * **[LITTLE ENDIAN]** Writes a big integer of any size to the buffer.
	 *
	 * **No alignment is required, the length is automatically calculated.**
	 * @param value The big integer to write to the buffer.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the array length).
	 * @returns The current buffer instance.
	 */
	writeBigIntLE = (value: bigint, offset = 0, length = Math.ceil(Number(value).toString(16).length / 2)): this => {
		if (value < 0n) throw new RangeError(fe("writeBigIntLE", `Invalid big integer value: '${value}'.`))

		this.check(offset, length)

		for (let i = 0; i < length; i++) {
			this.array[offset + i] = Number(value & BigInt(0xff))
			value >>= BigInt(8)
		}

		return this
	}

	/**
	 * **[BIG ENDIAN]** Writes a big integer of any size to the buffer.
	 *
	 * **No alignment is required, the length is automatically calculated.**
	 * @param value The big integer to write to the buffer.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the array length).
	 * @returns The current buffer instance.
	 */
	writeBigIntBE = (value: bigint, offset = 0, length = Math.ceil(Number(value).toString(16).length / 2)): this => {
		if (value < 0n) throw new RangeError(fe("writeBigIntBE", `Invalid big integer value: '${value}'.`))

		this.check(offset, length)

		for (let i = length - 1; i >= 0; i--) {
			this.array[offset + i] = Number(value & BigInt(0xff))
			value >>= BigInt(8)
		}

		return this
	}

	/**
	 * Writes a big integer of any size to the buffer.
	 *
	 * **No alignment is required, the length is automatically calculated.**
	 * @param value The big integer to write to the buffer.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @param length The length to write (optional, defaults to the array length).
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @returns The current buffer instance.
	 */
	writeBigInt = (
		value: bigint,
		offset = 0,
		length = Math.ceil(Number(value).toString(16).length / 2),
		endianness = this.platformEndianness,
	): this => {
		if (this.normalizeEndianness(endianness) === "LE") {
			this.writeBigIntLE(value, offset, length)
			return this
		}

		this.writeBigIntBE(value, offset, length)
		return this
	}

	/**
	 * Writes a range of numbers between 0 and 255 to the buffer.
	 * @param start The start of the range, inclusive.
	 * @param end The end of the range, exclusive.
	 * @param offset The offset to start writing at (optional, defaults to 0).
	 * @returns The current buffer instance.
	 */
	writeRange = (start: number, end: number, offset = 0): this => {
		if (start < 0 || start > 255) {
			throw new RangeError(fe("writeRange", `Invalid start value: '${start}'.`))
		}

		if (end < 0 || end > 255) {
			throw new RangeError(fe("writeRange", `Invalid end value: '${end}'.`))
		}

		const length = end - start
		this.check(offset, length)

		for (let i = 0; i < length; i++) {
			this.array[offset + i] = start + i
		}

		return this
	}

	/**
	 * ==============
	 *  READ METHODS
	 * ==============
	 *
	 * Notes:
	 * - All read methods have the capability to disable the overall check.
	 * - All of the "endianness sensitive" methods are wrapped within a single
	 *   method with an optional endianness parameter.
	 */

	/**
	 * **[LITTLE ENDIAN]** Reads a part of the buffer and returns it as an hexadecimal string (always uppercase).
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The hexadecimal string.
	 */
	readHexStringLE = (offset = 0, length = this.length - offset, check = true): string => {
		if (check) this.check(offset, length)
		return Buffer.from(this.arrayBuffer, offset, length).toString("hex").toUpperCase()
	}

	/**
	 * **[BIG ENDIAN]** Reads a part of the buffer and returns it as an hexadecimal string (always uppercase).
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The hexadecimal string.
	 */
	readHexStringBE = (offset = 0, length = this.length - offset, check = true): string => {
		if (check) this.check(offset, length)
		const hexString = Buffer.from(this.arrayBuffer, offset, length).toString("hex").toUpperCase()

		// biome-ignore lint/style/noNonNullAssertion: Will always match
		return hexString.match(/.{2}/g)!.reverse().join("")
	}

	/**
	 * Reads a part of the buffer and returns it as an hexadecimal string (always uppercase).
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).'
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The hexadecimal string.
	 */
	readHexString = (
		offset = 0,
		length = this.length - offset,
		endianness = this.platformEndianness,
		check = true,
	): string => {
		if (check) this.check(offset, length)

		if (this.normalizeEndianness(endianness) === "LE") return this.readHexStringLE(offset, length, false)
		return this.readHexStringBE(offset, length, false)
	}

	/**
	 * Reads a part of the buffer and returns it as an UTF-8 string.
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The UTF-8 string.
	 */
	readUtf8String = (offset = 0, length = this.length - offset, check = true): string => {
		if (check) this.check(offset, length)
		return Buffer.from(this.arrayBuffer, offset, length).toString("utf8")
	}

	/**
	 * Read a single bit from the buffer.
	 *
	 * **Note:** The offset is in bits, not bytes in contrast to the other methods.
	 * @param bitOffset The offset to read from **as a number of bits** (optional, defaults to 0).
	 * @param msbFirst Whether to read the bit from the most significant bit (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The bit as 0 or 1.
	 */
	readBit = (bitOffset = 0, msbFirst = true, check = true): Bit => {
		const offset = Math.floor(bitOffset / 8)
		if (check) this.check(offset, 1)

		const orderedBitOffset = msbFirst ? 7 - (bitOffset % 8) : bitOffset % 8
		return (this.array[offset] & (1 << orderedBitOffset)) !== 0 ? 1 : 0
	}

	/**
	 * Reads a single byte from the buffer.
	 *
	 * Equivalent to using the index signature (square bracket notation).
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The byte as number.
	 */
	readUint8 = (offset = 0, check = true): number => {
		if (check) this.check(offset, 1)
		return this.array[offset]
	}

	/**
	 * **[LITTLE ENDIAN]** Reads a single 16-bit value from the buffer.
	 * @param offset The offset to read from (optional, defaults to 0).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 2 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The 16-bit value.
	 */
	readUint16LE = (offset = 0, verifyAlignment = true, check = true): number => {
		if (verifyAlignment && offset % 2 !== 0) {
			throw new RangeError(fe("readUint16LE", `Invalid offset alignment: '${offset}' (%2).`))
		}

		if (check) this.check(offset, 2)

		return (this.array[offset] | (this.array[offset + 1] << 8)) >>> 0
	}

	/**
	 * **[BIG ENDIAN]** Reads a single 16-bit value from the buffer.
	 * @param offset The offset to read from (optional, defaults to 0).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 2 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The 16-bit value.
	 */
	readUint16BE = (offset = 0, verifyAlignment = true, check = true): number => {
		if (verifyAlignment && offset % 2 !== 0) {
			throw new RangeError(fe("readUint16BE", `Invalid offset alignment: '${offset}' (%2).`))
		}

		if (check) this.check(offset, 2)

		return ((this.array[offset] << 8) | this.array[offset + 1]) >>> 0
	}

	/**
	 * Reads a single 16-bit value from the buffer.
	 * @param offset The offset to read from (optional, defaults to 0).
	 * @param endianness Whether to read the value in Little Endian (optional, defaults to `false`).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 2 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The 16-bit value.
	 */
	readUint16 = (offset = 0, endianness = this.platformEndianness, verifyAlignment = true, check = true): number => {
		if (this.normalizeEndianness(endianness) === "LE") return this.readUint16LE(offset, verifyAlignment, check)
		return this.readUint16BE(offset, verifyAlignment, check)
	}

	/**
	 * **[LITTLE ENDIAN]** Reads a single 32-bit word from the buffer.
	 * @param offset The offset to read from (optional, defaults to 0).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 4 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 */
	readUint32LE = (offset = 0, verifyAlignment = true, check = true): number => {
		if (verifyAlignment && offset % 4 !== 0) {
			throw new RangeError(fe("readUint32LE", `Invalid offset alignment: '${offset}' (%4).`))
		}

		if (check) this.check(offset, 4)

		return (
			(this.array[offset] |
				(this.array[offset + 1] << 8) |
				(this.array[offset + 2] << 16) |
				(this.array[offset + 3] << 24)) >>>
			0
		)
	}

	/**
	 * **[BIG ENDIAN]** Reads a single 32-bit word from the buffer.
	 * @param offset The offset to read from (optional, defaults to 0).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 4 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 */
	readUint32BE = (offset = 0, verifyAlignment = true, check = true): number => {
		if (verifyAlignment && offset % 4 !== 0) {
			throw new RangeError(fe("readUint32BE", `Invalid offset alignment: '${offset}' (%4).`))
		}

		if (check) this.check(offset, 4)

		return (
			((this.array[offset] << 24) |
				(this.array[offset + 1] << 16) |
				(this.array[offset + 2] << 8) |
				this.array[offset + 3]) >>>
			0
		)
	}

	/**
	 * Reads a single 32-bit word from the buffer.
	 * @param offset The offset to read from (optional, defaults to 0).
	 * @param endianness Whether to read the value in Little Endian (optional, defaults to `false`).
	 * @param verifyAlignment Whether to verify that the offset is aligned to 4 bytes (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 */
	readUint32 = (offset = 0, endianness = this.platformEndianness, verifyAlignment = true, check = true): number => {
		if (this.normalizeEndianness(endianness) === "LE") return this.readUint32LE(offset, verifyAlignment, check)
		return this.readUint32BE(offset, verifyAlignment, check)
	}

	/**
	 * Reads a part of the buffer and return it as a bit array.
	 *
	 * **Note:** The offset is in bits, not bytes in contrast to the other methods.
	 * @param bitOffset The offset to read from **as a number of bits** (optional, defaults to 0).
	 * @param bitLength The length to read **as a number of bits** (optional, defaults to the buffer length - offset).
	 * @param msbFirst Whether to read the bits from the most significant bit (optional, defaults to `true`).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The bit array.
	 */
	readBits = (offset = 0, length = this.length * 8 - offset * 8, msbFirst = true, check = true): Bit[] => {
		const bits: Bit[] = []

		for (let i = 0; i < length; i++) bits.push(this.readBit(offset + i, msbFirst, check))

		return bits
	}

	/**
	 * Reads a part of the buffer and return it as a Uint8Array.
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @param check Whether to enable the overall check (optional, defaults to `true`).
	 * @returns The Uint8Array.
	 */
	readUint8Array = (offset = 0, length = this.length - offset, check = true): Uint8Array => {
		if (check) this.check(offset, length)
		return new Uint8Array(this.arrayBuffer, offset ?? this.offset, length ?? this.length)
	}

	/**
	 * Reads a part of the buffer and return it as a Uint16Array.
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @returns The Uint16Array.
	 */
	readUint16Array = (offset = 0, length = this.length - offset, check = true): Uint16Array => {
		if (check) this.check(offset, length)
		return new Uint16Array(this.arrayBuffer, offset ?? this.offset, length ? length / 2 : this.length / 2)
	}

	/**
	 * Reads a part of the buffer and return it as a Uint32Array.
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @returns The Uint32Array.
	 */
	readUint32Array = (offset = 0, length = this.length - offset, check = true): Uint32Array => {
		if (check) this.check(offset, length)
		return new Uint32Array(this.arrayBuffer, offset ?? this.offset, length ? length / 4 : this.length / 4)
	}

	/**
	 * **[LITTLE ENDIAN]** Reads a certain amount of bytes from the buffer and converts it into a big integer.
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @returns The big integer.
	 */
	readBigIntLE = (offset = 0, length = this.length - offset, check = true): bigint => {
		if (check) this.check(offset, length)

		let result = 0n

		for (let i = length - 1; i >= 0; i--) {
			result = (result << 8n) | BigInt(this.array[offset + i])
		}

		return result
	}

	/**
	 * **[BIG ENDIAN]** Reads a certain amount of bytes from the buffer and converts it into a big integer.
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @returns The big integer.
	 */
	readBigIntBE = (offset = 0, length = this.length - offset, check = true): bigint => {
		if (check) this.check(offset, length)

		let result = 0n

		for (let i = 0; i < length; i++) {
			result = (result << 8n) | BigInt(this.array[offset + i])
		}

		return result
	}

	/**
	 * Reads a certain amount of bytes from the buffer and converts it into a big integer.
	 * @param offset The offset to start reading from (optional, defaults to 0).
	 * @param length The length to read (optional, defaults to the buffer length - offset).
	 * @param endianness Whether to read the value in Little Endian (optional, defaults to `false`).
	 * @returns The big integer.
	 */
	readBigInt = (
		offset = 0,
		length = this.length - offset,
		endianness = this.platformEndianness,
		check = true,
	): bigint => {
		if (this.normalizeEndianness(endianness) === "LE") return this.readBigIntLE(offset, length, check)
		return this.readBigIntBE(offset, length, check)
	}

	/**
	 * ====================
	 *  CONVERSION METHODS
	 * ====================
	 */

	/**
	 * Converts the buffer into an hexadecimal string (always uppercase).
	 * @param prefix Whether to prefix the hexadecimal string with `0x` (optional, defaults to `false`).
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @returns The hexadecimal string.
	 */
	toHexString = (prefix = false, endianness = this.platformEndianness): string => {
		let hexString = Buffer.from(this.arrayBuffer).toString("hex").toUpperCase()

		if (this.normalizeEndianness(endianness) === "BE") {
			hexString = hexString.match(/.{2}/g)?.reverse().join("") ?? ""
		}

		if (prefix) return `0x${hexString}`
		return hexString
	}

	/**
	 * Converts the buffer into an UTF-8 string.
	 * @returns The UTF-8 string.
	 */
	toUtf8String = (): string => Buffer.from(this.arrayBuffer).toString("utf8")

	/**
	 * Converts the buffer into a string representation (hex string is always uppercase).
	 * @param encoding The encoding to use (optional, defaults to "hex").
	 * @param hexPrefix Whether to prefix the hexadecimal string with `0x` (optional, defaults to `false`).
	 * @returns The string representation of the buffer.
	 */
	toString = (encoding: "utf8" | "hex" = "hex", hexPrefix = false): string => {
		if (encoding === "utf8") return this.toUtf8String()
		return this.toHexString(hexPrefix)
	}

	/**
	 * Converts the buffer into a bit array.
	 * @param msbFirst Whether to read the bits from the most significant bit (optional, defaults to `true`).
	 * @returns The bit array.
	 */
	toBits = (msbFirst = true): Bit[] => {
		const length = this.length * 8
		const bits: Bit[] = new Array(length)
		for (let i = 0; i < length; i++) bits[i] = this.readBit(i, msbFirst)
		return bits
	}

	/**
	 * Converts the buffer into a Uint8Array.
	 * @returns The Uint8Array.
	 */
	toUint8Array = (): Uint8Array => new Uint8Array(this.arrayBuffer, this.offset, this.length)

	/**
	 * Converts the buffer into a Uint16Array.
	 * @returns The Uint16Array.
	 */
	toUint16Array = (): Uint16Array => new Uint16Array(this.arrayBuffer, this.offset, this.length / 2)

	/**
	 * Converts the buffer into a Uint32Array.
	 * @returns The Uint32Array.
	 */
	toUint32Array = (): Uint32Array => new Uint32Array(this.arrayBuffer, this.offset, this.length / 4)

	/**
	 * Converts the buffer into a big integer.
	 * @param endianness The endianness to use (optional, defaults to the platform's endianness).
	 * @returns The big integer.
	 */
	toBigInt = (endianness = this.platformEndianness): bigint => {
		if (this.normalizeEndianness(endianness) === "LE") return this.readBigIntLE()
		return this.readBigIntBE()
	}

	/**
	 * ===============
	 *  CHECK METHODS
	 * ===============
	 */

	/**
	 * Checks if the current buffer is equal to the specified buffer.
	 * @param buffer The buffer to compare to.
	 * @returns Whether the buffers are equal.
	 */
	equals = (buffer: CyBuffer): boolean => {
		if (this.length !== buffer.length) {
			return false
		}

		for (let i = 0; i < this.length; i++) {
			if (this.array[i] !== buffer[i]) {
				return false
			}
		}

		return true
	}

	/**
	 * Check if the buffer is empty.
	 * @returns Whether the buffer is empty.
	 */
	isEmpty = (): boolean => {
		for (let i = 0; i < this.length; i++) {
			if (this.array[i] !== 0) return false
		}

		return true
	}

	/**
	 * Check if the buffer is full.
	 * @returns Whether the buffer is full.
	 */
	isFull = (): boolean => {
		for (let i = 0; i < this.length; i++) {
			if (this.array[i] !== 255) return false
		}

		return true
	}

	/**
	 * ====================
	 *  RANDOMNESS METHODS
	 * ====================
	 */

	/**
	 * Randomly fills the buffer with bytes.
	 *
	 * **WARNING:** This method is not safe for cryptographic contexts, use the `safeRandomFill` method
	 * when security is a concern.
	 * @param offset The offset to start filling at (optional, defaults to 0).
	 * @param length The length to fill (optional, defaults to the buffer length - offset).
	 */
	randomFill = (offset = 0, length = this.length - offset) => {
		this.check(offset, length)

		for (let i = 0; i < length; i++) {
			this.array[offset + i] = Math.floor(Math.random() * 256)
		}
	}

	/**
	 * Randomly fills the buffer with bytes.
	 *
	 * **WARNING:** This method is safe for cryptographic contexts, but is far slower than the `randomFill` method,
	 * use this method when security is a concern. Uses the Node.js `crypto.randomFillSync` method.
	 * @param offset The offset to start filling at (optional, defaults to 0).
	 * @param length The length to fill (optional, defaults to the buffer length - offset).
	 */
	safeRandomFill = (offset = 0, length = this.length) => randomFillSync(this.array, offset, length)

	/**
	 * =================
	 *  UTILITY METHODS
	 * =================
	 */

	/**
	 * Copies the buffer into a new buffer.
	 * @param offset The offset to start copying at (optional, defaults to 0).
	 * @param length The length to copy (optional, defaults to the buffer length).
	 * @returns A new buffer containing the copied data.
	 */
	copy = (offset = 0, length = this.length): CyBuffer => {
		this.check(offset, length)
		const buffer = new CyBuffer(length)
		for (let i = 0; i < length; i++) buffer[i] = this.array[i + offset]
		return buffer
	}

	/**
	 * Returns a new buffer that references the same memory as the original buffer,
	 * A lot more efficient than copying it (~ 4 times faster than the `copy` method).
	 * @param offset The start offset (optional, defaults to 0).
	 * @param end The end offset (optional, defaults to the buffer length).
	 * @returns The subarray pointing to the same memory.
	 */
	subarray = (offset = 0, length = this.length): CyBuffer => {
		this.check(offset, length)

		return new CyBuffer(length, {
			arrayBuffer: this.arrayBuffer,
			offset: offset,
			length: length,
		})
	}

	/**
	 * Swaps the order of the buffer.
	 * @param offset The offset to start swapping at (optional, defaults to 0).
	 * @param length The length to swap (optional, defaults to the buffer length).
	 * @param wordLength The length per word (optional, defaults to 4).
	 * @returns The current buffer instance.
	 */
	swap = (offset = 0, length = this.length, wordLength = 4): this => {
		if (wordLength < 2) throw new RangeError(fe("swap", `Invalid word length: '${wordLength}'.`))

		if (wordLength % 2 !== 0) {
			throw new RangeError(fe("swap", `Invalid word length alignment: '${wordLength}'.`))
		}

		this.check(offset, length)

		const calculatedLength = offset + length
		for (let i = 0; i < calculatedLength; i += wordLength) {
			const offsetIndex = i + offset

			for (let j = 0; j < wordLength / 2; j++) {
				const temp = this.array[offsetIndex + j]
				this.array[offsetIndex + j] = this.array[offsetIndex + wordLength - j - 1]
				this.array[offsetIndex + wordLength - j - 1] = temp
			}
		}

		return this
	}

	/**
	 * Reverses a part of the buffer.
	 * @param offset The offset to start reversing at (optional, defaults to 0).
	 * @param length The length to reverse (optional, defaults to the buffer length).
	 * @returns The current buffer instance.
	 */
	partialReverse = (offset = 0, length = this.length): this => {
		this.check(offset, length)

		const dividedLength = Math.floor(length / 2)
		const calculatedLength = offset + length

		for (let i = 0; i < dividedLength; i++) {
			const offsetIndex = i + offset
			const endOffsetIndex = calculatedLength - i - 1
			const temp = this.array[offsetIndex]
			this.array[offsetIndex] = this.array[endOffsetIndex]
			this.array[endOffsetIndex] = temp
		}

		return this
	}

	/**
	 * Reverses the entire buffer.
	 * @returns The current buffer instance.
	 */
	reverse = (): this => {
		this.array.reverse()
		return this
	}

	/**
	 * Rotates the buffer to the left.
	 * @returns The current buffer instance.
	 */
	rotateLeft = (): this => {
		const first = this.array[0]

		for (let i = 0; i < this.length - 1; i++) this.array[i] = this.array[i + 1]
		this.array[this.length - 1] = first

		return this
	}

	/**
	 * Rotates the buffer to the right.
	 * @returns The current buffer instance.
	 */
	rotateRight = (): this => {
		const last = this.array[this.length - 1]

		for (let i = this.length - 1; i > 0; i--) this.array[i] = this.array[i - 1]
		this.array[0] = last

		return this
	}

	/**
	 * Shifts the buffer to the left, filling the empty space with zeros.
	 * @param offset The offset to start shifting at (optional, defaults to 0).
	 * @param length The length to shift (optional, defaults to the buffer length).
	 * @param shift The number of bytes to shift (optional, defaults to 1).
	 * @returns The current buffer instance.
	 */
	shiftLeft = (offset = 0, length = this.length, shift = 1): this => {
		this.check(offset, length)

		for (let i = 0; i < this.length - 1; i++) this.array[i] = this.array[i + shift]
		for (let i = 0; i < shift; i++) this.array[this.length - i - 1] = 0

		return this
	}

	/**
	 * Shifts the buffer to the right, filling the empty spaces with zeros.
	 * @param offset The offset to start shifting at (optional, defaults to 0).
	 * @param length The length to shift (optional, defaults to the buffer length).
	 * @param shift The number of bytes to shift (optional, defaults to 1).
	 * @returns The current buffer instance.
	 */
	shiftRight = (offset = 0, length = this.length, shift = 1): this => {
		this.check(offset, length)

		for (let i = this.length - 1; i > 0; i--) this.array[i] = this.array[i - shift]
		for (let i = 0; i < shift; i++) this.array[i] = 0

		return this
	}

	/**
	 * Fills the buffer with a specified value.
	 * @param value The value to fill the buffer with.
	 * @param offset The offset to start filling at (optional, defaults to 0).
	 * @param length The length to fill (optional, defaults to the buffer length).
	 * @returns The current buffer instance.
	 */
	fill = (value: number, offset = 0, length = this.length): this => {
		if (value < 0 || value > 255) throw new RangeError(fe("fill", `Invalid value: '${value}'.`))

		this.check(offset, length)
		this.array.fill(value, offset, offset + length)
		return this
	}

	/**
	 * Clears the buffer by filling it with zeros.
	 * @param offset The offset to start clearing at (optional, defaults to 0).
	 * @param length The length to clear (optional, defaults to the buffer length).
	 * @returns The current buffer instance.
	 */
	clear = (offset = 0, length = this.length): this => {
		this.check(offset, length)
		this.array.fill(0, offset, offset + length)
		return this
	}
}
