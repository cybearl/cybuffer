import os from "node:os"
import CyBuffer, { type Bit } from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("static", () => {
	describe("alloc", () => {
		let buffer: CyBuffer
		const length = 10

		test("It should create a buffer with the specified length", ({ expect }) => {
			buffer = CyBuffer.alloc(length)
			expect(buffer.length).toBe(length)
		})

		test("It should create a buffer with the specified length and fill value", ({ expect }) => {
			buffer = CyBuffer.alloc(length, 0xff)
			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(0xff)
			}
		})
	})

	describe("fromHexString", () => {
		let buffer: CyBuffer

		const hexString = "FF00FF00"
		const hexStringByteValues = [0xff, 0x00, 0xff, 0x00]

		beforeEach(() => {
			buffer = CyBuffer.fromHexString(hexString)
		})

		test("It should create a buffer from a hex string", ({ expect }) => {
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			expect(buffer.length).toBe(Math.ceil(hexString.length / 2))
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(hexStringByteValues[i])
			}
		})

		test("It should support the '0x' prefix", ({ expect }) => {
			buffer = CyBuffer.fromHexString(`0x${hexString}`)
			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(hexStringByteValues[i])
			}
		})
	})

	describe("fromUtf8String", () => {
		const utf8String = "Hello, world!"
		const utf8StringByteValues = [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21]

		test("It should create a buffer from a UTF-8 string", ({ expect }) => {
			const buffer = CyBuffer.fromUtf8String(utf8String)
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			const buffer = CyBuffer.fromUtf8String(utf8String)
			expect(buffer.length).toBe(utf8String.length)
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			const buffer = CyBuffer.fromUtf8String(utf8String)

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(utf8StringByteValues[i])
			}
		})
	})

	describe("fromString", () => {
		let buffer: CyBuffer

		const string = "Hello, world!"
		const stringByteValues = [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21]

		beforeEach(() => {
			buffer = CyBuffer.fromString(string)
		})

		test("It should create a buffer from a string", ({ expect }) => {
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			expect(buffer.length).toBe(string.length)
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(stringByteValues[i])
			}
		})
	})

	describe("fromBits", () => {
		let buffer: CyBuffer

		const bits: Bit[] = [0, 1, 0, 1, 1, 0, 1, 0]
		const bitsByteValues = [0b01011010]

		beforeEach(() => {
			buffer = CyBuffer.fromBits(bits)
		})

		test("It should create a buffer from an array of bits", ({ expect }) => {
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			expect(buffer.length).toBe(Math.ceil(bits.length / 8))
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(bitsByteValues[i])
			}
		})
	})

	describe("fromUint8Array", () => {
		let buffer: CyBuffer

		const uint8Array = new Uint8Array([0xff, 0x11, 0xff, 0x11])

		beforeEach(() => {
			buffer = CyBuffer.fromUint8Array(uint8Array)
		})

		test("It should create a buffer from a Uint8Array", ({ expect }) => {
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			expect(buffer.length).toBe(uint8Array.length)
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint8Array[i])
			}
		})
	})

	describe("fromUint16Array", () => {
		let buffer: CyBuffer

		const uint16Array = new Uint16Array([0xff11, 0x11ff])
		const uint16ArrayByteValuesLE = [0x11, 0xff, 0xff, 0x11]
		const uint16ArrayByteValuesBE = [0xff, 0x11, 0x11, 0xff]

		beforeEach(() => {
			buffer = CyBuffer.fromUint16Array(uint16Array)
		})

		test("It should create a buffer from a Uint16Array", ({ expect }) => {
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			expect(buffer.length).toBe(uint16Array.length * 2)
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				if (os.endianness() === "LE") {
					expect(buffer.readUint8(i)).toBe(uint16ArrayByteValuesLE[i])
				} else {
					expect(buffer.readUint8(i)).toBe(uint16ArrayByteValuesBE[i])
				}
			}
		})
	})

	describe("fromUint32Array", () => {
		let buffer: CyBuffer

		const uint32Array = new Uint32Array([0xff11ff11, 0x11ff11ff])
		const uint32ArrayByteValuesLE = [0x11, 0xff, 0x11, 0xff, 0xff, 0x11, 0xff, 0x11]
		const uint32ArrayByteValuesBE = [0xff, 0x11, 0xff, 0x11, 0x11, 0xff, 0x11, 0xff]

		beforeEach(() => {
			buffer = CyBuffer.fromUint32Array(uint32Array)
		})

		test("It should create a buffer from a Uint32Array", ({ expect }) => {
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			expect(buffer.length).toBe(uint32Array.length * 4)
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				if (os.endianness() === "LE") {
					expect(buffer.readUint8(i)).toBe(uint32ArrayByteValuesLE[i])
				} else {
					expect(buffer.readUint8(i)).toBe(uint32ArrayByteValuesBE[i])
				}
			}
		})
	})

	describe("fromBigInt", () => {
		let buffer: CyBuffer

		const bigInt = BigInt(0xff11ff11ff11)
		const bigIntByteValues = [0x11, 0xff, 0x11, 0xff, 0x11, 0xff, 0x00, 0x00]

		beforeEach(() => {
			buffer = CyBuffer.fromBigInt(bigInt)
		})

		test("It should create a buffer from a BigInt", ({ expect }) => {
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			expect(buffer.length).toBe(Math.ceil(bigInt.toString(16).length / 2))
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(bigIntByteValues[i])
			}
		})
	})

	describe("fromRange", () => {
		let buffer: CyBuffer

		const start = 0
		const end = 10
		const rangeByteValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

		beforeEach(() => {
			buffer = CyBuffer.fromRange(start, end)
		})

		test("It should create a buffer from a range", ({ expect }) => {
			expect(buffer).toBeInstanceOf(CyBuffer)
		})

		test("It should create a buffer with the correct length", ({ expect }) => {
			expect(buffer.length).toBe(end - start)
		})

		test("It should create a buffer with the correct values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(rangeByteValues[i])
			}
		})
	})
})
