import type { Bit } from "@/index"
import CyBuffer from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("read", () => {
	describe("readHexString", () => {
		let buffer: CyBuffer

		const hexString = "FF21FF11"

		beforeEach(() => {
			buffer = CyBuffer.fromHexString(hexString)
		})

		test("It should read a hex string from the buffer", ({ expect }) => {
			expect(buffer.readHexString()).toBe(hexString)
		})

		test("It should read a hex string from the buffer at the specified offset", ({ expect }) => {
			expect(buffer.readHexString(1, 3)).toBe("21FF11")
			expect(buffer.readHexString(2, 2)).toBe("FF11")
			expect(buffer.readHexString(3, 1)).toBe("11")
		})
	})

	describe("readUtf8String", () => {
		let buffer: CyBuffer

		const utf8String = "Hello, world!"

		beforeEach(() => {
			buffer = CyBuffer.fromUtf8String(utf8String)
		})

		test("It should read a UTF-8 string from the buffer", ({ expect }) => {
			expect(buffer.readUtf8String()).toBe(utf8String)
		})

		test("It should read a UTF-8 string from the buffer at the specified offset", ({ expect }) => {
			expect(buffer.readUtf8String(1)).toBe("ello, world!")
			expect(buffer.readUtf8String(2)).toBe("llo, world!")
			expect(buffer.readUtf8String(3)).toBe("lo, world!")
		})
	})

	describe("readBit", () => {
		let buffer: CyBuffer

		const bits: Bit[] = [1, 0]

		beforeEach(() => {
			buffer = CyBuffer.alloc(1)
			for (let i = 0; i < buffer.length; i++) {
				buffer.writeBit(bits[i], i)
			}
		})

		test("It should read a bit from the buffer", ({ expect }) => {
			expect(buffer.readBit(0)).toBe(bits[0])
		})

		test("It should read a bit from the buffer at the specified offset", ({ expect }) => {
			expect(buffer.readBit(1)).toBe(bits[1])
		})
	})

	describe("readUint8", () => {
		let buffer: CyBuffer

		const uint8s = [0xff, 0x1f]

		beforeEach(() => {
			buffer = CyBuffer.alloc(2)
			for (let i = 0; i < buffer.length; i++) {
				buffer.writeUint8(uint8s[i], i)
			}
		})

		test("It should read a uint8 from the buffer", ({ expect }) => {
			expect(buffer.readUint8()).toBe(uint8s[0])
		})

		test("It should read a uint8 from the buffer at the specified offset", ({ expect }) => {
			expect(buffer.readUint8(1)).toBe(uint8s[1])
		})
	})

	describe("readUint16", () => {
		let buffer: CyBuffer

		const uint16sByteValues = [0xff, 0x11, 0x1f, 0x1f]

		const uint16sLE = [0x11ff, 0x1f1f]
		const uint16sBE = [0xff11, 0x1f1f]

		beforeEach(() => {
			buffer = CyBuffer.alloc(4)
			for (let i = 0; i < buffer.length; i++) {
				buffer.writeUint8(uint16sByteValues[i], i)
			}
		})

		test("It should read a uint16 from the buffer (little endian)", ({ expect }) => {
			expect(buffer.readUint16(0, "LE")).toBe(uint16sLE[0])
		})

		test("It should read a uint16 from the buffer (big endian)", ({ expect }) => {
			expect(buffer.readUint16(0, "BE")).toBe(uint16sBE[0])
		})

		test("It should read a uint16 from the buffer at the specified byte offset (little endian)", ({ expect }) => {
			expect(buffer.readUint16(2, "LE")).toBe(uint16sLE[1])
		})

		test("It should read a uint16 from the buffer at the specified byte offset (big endian)", ({ expect }) => {
			expect(buffer.readUint16(2, "BE")).toBe(uint16sBE[1])
		})

		test("It should throw if the byte offset is not aligned to 2 bytes", ({ expect }) => {
			expect(() => buffer.readUint16(1)).toThrow()
		})
	})

	describe("readUint32", () => {
		let buffer: CyBuffer

		const uint32sByteValues = [0xff, 0x22, 0xff, 0x11, 0x1f, 0x1f, 0x1f, 0x1f]
		const uint32sLE = [0x11ff22ff, 0x1f1f1f1f]
		const uint32sBE = [0xff22ff11, 0x1f1f1f1f]

		beforeEach(() => {
			buffer = CyBuffer.alloc(8)
			for (let i = 0; i < buffer.length; i++) {
				buffer.writeUint8(uint32sByteValues[i], i)
			}
		})

		test("It should read a uint32 from the buffer (little endian)", ({ expect }) => {
			expect(buffer.readUint32(0, "LE")).toBe(uint32sLE[0])
		})

		test("It should read a uint32 from the buffer (big endian)", ({ expect }) => {
			expect(buffer.readUint32(0, "BE")).toBe(uint32sBE[0])
		})

		test("It should read a uint32 from the buffer at the specified byte offset (little endian)", ({ expect }) => {
			expect(buffer.readUint32(4, "LE")).toBe(uint32sLE[1])
		})

		test("It should read a uint32 from the buffer at the specified byte offset (big endian)", ({ expect }) => {
			expect(buffer.readUint32(4, "BE")).toBe(uint32sBE[1])
		})

		test("It should throw if the byte offset is not aligned to 4 bytes", ({ expect }) => {
			expect(() => buffer.readUint32(2)).toThrow()
		})
	})

	describe("readBits", () => {
		let buffer: CyBuffer

		const bits: Bit[] = [1, 0, 1, 1, 1, 0, 0, 1]

		beforeEach(() => {
			buffer = CyBuffer.fromBits(bits)
		})

		test("It should read bits from the buffer", ({ expect }) => {
			expect(buffer.readBits()).toStrictEqual(bits)
		})
	})

	describe("readUint8Array", () => {
		let buffer: CyBuffer

		const uint8Array = new Uint8Array([0xff, 0x11, 0x1f, 0x1f])

		beforeEach(() => {
			buffer = CyBuffer.fromUint8Array(uint8Array)
		})

		test("It should read a Uint8Array from the buffer", ({ expect }) => {
			expect(buffer.readUint8Array()).toStrictEqual(uint8Array)
		})
	})

	describe("readUint16Array", () => {
		let buffer: CyBuffer

		const uint16sByteValues = [0xff, 0x11, 0x1f, 0x1f]

		const uint16sLE = [0x11ff, 0x1f1f]

		beforeEach(() => {
			buffer = CyBuffer.alloc(4)
			for (let i = 0; i < buffer.length; i++) {
				buffer.writeUint8(uint16sByteValues[i], i)
			}
		})

		test("It should read a Uint16Array from the buffer", ({ expect }) => {
			expect(buffer.readUint16Array(0)).toStrictEqual(new Uint16Array(uint16sLE))
		})

		test("It should read a Uint16Array from the buffer at the specified byte offset", ({ expect }) => {
			expect(buffer.readUint16Array(2)).toStrictEqual(new Uint16Array(uint16sLE.slice(1)))
		})

		test("It should throw if the byte offset is not aligned to 2 bytes", ({ expect }) => {
			expect(() => buffer.readUint16Array(1)).toThrow()
		})
	})

	describe("readUint32Array", () => {
		let buffer: CyBuffer

		const uint32sByteValues = [0xff, 0x22, 0xff, 0x11, 0x1f, 0x1f, 0x1f, 0x1f]
		const uint32sLE = [0x11ff22ff, 0x1f1f1f1f]

		beforeEach(() => {
			buffer = CyBuffer.alloc(8)
			for (let i = 0; i < buffer.length; i++) {
				buffer.writeUint8(uint32sByteValues[i], i)
			}
		})

		test("It should read a Uint32Array from the buffer", ({ expect }) => {
			expect(buffer.readUint32Array()).toStrictEqual(new Uint32Array(uint32sLE))
		})

		test("It should read a Uint32Array from the buffer at the specified byte offset (little endian)", ({
			expect,
		}) => {
			expect(buffer.readUint32Array(4)).toStrictEqual(new Uint32Array(uint32sLE.slice(1)))
		})

		test("It should throw if the byte offset is not aligned to 4 bytes", ({ expect }) => {
			expect(() => buffer.readUint32Array(2)).toThrow()
		})
	})

	describe("readBigInt", () => {
		let buffer: CyBuffer

		const bigIntByteValues = [0xff, 0x01, 0xff, 0x01, 0xff, 0x11, 0xff, 0x11]
		const bigIntsLE = [BigInt(0x01ff01ff), BigInt(0x11ff11ff)]
		const bigIntsBE = [BigInt(0xff01ff01), BigInt(0xff11ff11)]

		beforeEach(() => {
			buffer = CyBuffer.alloc(8)
			for (let i = 0; i < buffer.length; i++) {
				buffer.writeUint8(bigIntByteValues[i], i)
			}
		})

		test("It should read a BigInt from the buffer (little endian)", ({ expect }) => {
			expect(buffer.readBigInt(0, 4, "LE")).toBe(bigIntsLE[0])
		})

		test("It should read a BigInt from the buffer (big endian)", ({ expect }) => {
			expect(buffer.readBigInt(0, 4, "BE")).toBe(bigIntsBE[0])
		})

		test("It should read a BigInt from the buffer at the specified byte offset (little endian)", ({ expect }) => {
			expect(buffer.readBigInt(4, 4, "LE")).toBe(bigIntsLE[1])
		})

		test("It should read a BigInt from the buffer at the specified byte offset (big endian)", ({ expect }) => {
			expect(buffer.readBigInt(4, 4, "BE")).toBe(bigIntsBE[1])
		})
	})
})
