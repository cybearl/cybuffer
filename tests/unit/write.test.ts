import CyBuffer, { type Bit } from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("write", () => {
	describe("writeHexString", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		const hexString = "FF11FF11"
		const hexStringByteValues = [0xff, 0x11, 0xff, 0x11]

		test("It should write a hex string to the buffer", ({ expect }) => {
			buffer.writeHexString(hexString)

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(hexStringByteValues[i])
			}
		})

		test("It should write a hex string starting with 0x to the buffer", ({ expect }) => {
			buffer.writeHexString(`0x${hexString}`)

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(hexStringByteValues[i])
			}
		})

		test("It should write a hex string to the buffer at the specified offset", ({ expect }) => {
			buffer.writeHexString("1F1F", 2)
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x1f)
			expect(buffer.readUint8(3)).toBe(0x1f)
		})

		test("It should throw if the string is empty", ({ expect }) => {
			expect(() => buffer.writeHexString("")).toThrow()
		})

		test("It should throw if the string length is not even", ({ expect }) => {
			expect(() => buffer.writeHexString("FF1")).toThrow()
		})
	})

	describe("writeUtf8String", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(13)
		})

		const utf8String = "Hello, world!"
		const utf8StringByteValues = [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21]

		test("It should write a UTF-8 string to the buffer", ({ expect }) => {
			buffer.writeUtf8String(utf8String)

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(utf8StringByteValues[i])
			}
		})

		test("It should write a UTF-8 string to the buffer at the specified offset", ({ expect }) => {
			buffer.writeUtf8String("ABCD", 2)
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x41)
			expect(buffer.readUint8(3)).toBe(0x42)
			expect(buffer.readUint8(4)).toBe(0x43)
			expect(buffer.readUint8(5)).toBe(0x44)
		})

		test("It should throw if the string is empty", ({ expect }) => {
			expect(() => buffer.writeUtf8String("")).toThrow()
		})
	})

	describe("writeBit", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(1)
		})

		const bits: Bit[] = [0, 1, 0, 1, 0, 0, 1, 0]

		test("It should write a bit to the buffer", ({ expect }) => {
			for (const [i, bit] of bits.entries()) {
				buffer.writeBit(bit, i)
			}

			for (let i = 0; i < buffer.length * 8; i++) {
				expect(buffer.readBit(i)).toBe(bits[i])
			}
		})

		test("It should write a bit to the buffer at the specified offset", ({ expect }) => {
			buffer.writeBit(1, 1)
			expect(buffer.readBit(0)).toBe(0)
			expect(buffer.readBit(1)).toBe(1)
		})

		test("It should throw if the value is not a valid bit", ({ expect }) => {
			// @ts-ignore
			expect(() => buffer.writeBit(-1)).toThrow()
			// @ts-ignore
			expect(() => buffer.writeBit(2)).toThrow()
		})
	})

	describe("writeUint8", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(2)
		})

		const uint8 = 0xff
		const uint8ByteValues = [0xff, 0x00]

		test("It should write a uint8 to the buffer", ({ expect }) => {
			buffer.writeUint8(uint8)

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint8ByteValues[i])
			}
		})

		test("It should write a uint8 to the buffer at the specified offset", ({ expect }) => {
			buffer.writeUint8(0xff, 1)
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0xff)
		})

		test("It should throw if the value is not a valid uint8", ({ expect }) => {
			expect(() => buffer.writeUint8(-1)).toThrow()
			expect(() => buffer.writeUint8(0x100)).toThrow()
		})
	})

	describe("writeUint16", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		const uint16 = 0xff11
		const uint16ByteValuesLE = [0x11, 0xff, 0x00, 0x00]
		const uint16ByteValuesBE = [0xff, 0x11, 0x00, 0x00]

		test("It should write a uint16 to the buffer (little endian)", ({ expect }) => {
			buffer.writeUint16(uint16, 0, "LE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint16ByteValuesLE[i])
			}
		})

		test("It should write a uint16 to the buffer (big endian)", ({ expect }) => {
			buffer.writeUint16(uint16, 0, "BE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint16ByteValuesBE[i])
			}
		})

		test("It should write a uint16 to the buffer at the specified byte offset (little endian)", ({ expect }) => {
			buffer.writeUint16(0xf11f, 2, "LE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x1f)
			expect(buffer.readUint8(3)).toBe(0xf1)
		})

		test("It should write a uint16 to the buffer at the specified byte offset (big endian)", ({ expect }) => {
			buffer.writeUint16(0xf11f, 2, "BE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0xf1)
			expect(buffer.readUint8(3)).toBe(0x1f)
		})

		test("It should throw if the value is not a valid uint16", ({ expect }) => {
			expect(() => buffer.writeUint16(-1)).toThrow()
			expect(() => buffer.writeUint16(0x10000)).toThrow()
		})

		test("It should throw if the byte offset is not aligned to 2 bytes", ({ expect }) => {
			expect(() => buffer.writeUint16(0xff00, 1)).toThrow()
		})
	})

	describe("writeUint32", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(8)
		})

		const uint32 = 0xff11ff11
		const uint32ByteValuesLE = [0x11, 0xff, 0x11, 0xff, 0x00, 0x00, 0x00, 0x00]
		const uint32ByteValuesBE = [0xff, 0x11, 0xff, 0x11, 0x00, 0x00, 0x00, 0x00]

		test("It should write a uint32 to the buffer (little endian)", ({ expect }) => {
			buffer.writeUint32(uint32, 0, "LE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint32ByteValuesLE[i])
			}
		})

		test("It should write a uint32 to the buffer (big endian)", ({ expect }) => {
			buffer.writeUint32(uint32, 0, "BE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint32ByteValuesBE[i])
			}
		})

		test("It should write a uint32 to the buffer at the specified byte offset (little endian)", ({ expect }) => {
			buffer.writeUint32(0xff1fff1f, 4, "LE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x00)
			expect(buffer.readUint8(3)).toBe(0x00)
			expect(buffer.readUint8(4)).toBe(0x1f)
			expect(buffer.readUint8(5)).toBe(0xff)
			expect(buffer.readUint8(6)).toBe(0x1f)
			expect(buffer.readUint8(7)).toBe(0xff)
		})

		test("It should write a uint32 to the buffer at the specified byte offset (big endian)", ({ expect }) => {
			buffer.writeUint32(0xff1fff1f, 4, "BE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x00)
			expect(buffer.readUint8(3)).toBe(0x00)
			expect(buffer.readUint8(4)).toBe(0xff)
			expect(buffer.readUint8(5)).toBe(0x1f)
			expect(buffer.readUint8(6)).toBe(0xff)
			expect(buffer.readUint8(7)).toBe(0x1f)
		})

		test("It should throw if the value is not a valid uint32", ({ expect }) => {
			expect(() => buffer.writeUint32(-1)).toThrow()
			expect(() => buffer.writeUint32(0x100000000)).toThrow()
		})

		test("It should throw if the byte offset is not aligned to 4 bytes", ({ expect }) => {
			expect(() => buffer.writeUint32(0xff00ff00, 2)).toThrow()
		})
	})

	describe("writeBits", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(1)
		})

		const bits: Bit[] = [0, 1, 0, 1, 0, 0, 1, 0]

		test("It should write bits to the buffer", ({ expect }) => {
			buffer.writeBits(bits)

			for (let i = 0; i < buffer.length * 8; i++) {
				expect(buffer.readBit(i)).toBe(bits[i])
			}
		})

		test("It should write bits to the buffer at the specified offset", ({ expect }) => {
			buffer.writeBits([1, 0, 1, 0], 2)
			expect(buffer.readBit(0)).toBe(0)
			expect(buffer.readBit(1)).toBe(0)
			expect(buffer.readBit(2)).toBe(1)
			expect(buffer.readBit(3)).toBe(0)
		})

		test("It should throw if the value is not a valid bit", ({ expect }) => {
			// @ts-ignore
			expect(() => buffer.writeBits([0, -1])).toThrow()
			// @ts-ignore
			expect(() => buffer.writeBits([0, 2])).toThrow()
		})
	})

	describe("writeUint8Array", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		const uint8Array = new Uint8Array([0xff, 0x11, 0xff, 0x11])

		test("It should write a Uint8Array to the buffer", ({ expect }) => {
			buffer.writeUint8Array(uint8Array)

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint8Array[i])
			}
		})

		test("It should write a Uint8Array to the buffer at the specified offset", ({ expect }) => {
			buffer.writeUint8Array(new Uint8Array([0x1f, 0x1f]), 2)
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x1f)
			expect(buffer.readUint8(3)).toBe(0x1f)
		})
	})

	describe("writeUint16Array", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		const uint16Array = new Uint16Array([0xff11, 0x11ff])
		const uint16ArrayByteValuesLE = [0x11, 0xff, 0xff, 0x11]
		const uint16ArrayByteValuesBE = [0xff, 0x11, 0x11, 0xff]

		test("It should write a Uint16Array to the buffer (little endian)", ({ expect }) => {
			buffer.writeUint16Array(uint16Array, 0, 4, 0, "LE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint16ArrayByteValuesLE[i])
			}
		})

		test("It should write a Uint16Array to the buffer (big endian)", ({ expect }) => {
			buffer.writeUint16Array(uint16Array, 0, 4, 0, "BE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint16ArrayByteValuesBE[i])
			}
		})

		test("It should write a Uint16Array to the buffer at the specified byte offset (little endian)", ({
			expect,
		}) => {
			buffer.writeUint16Array(new Uint16Array([0x11ff]), 2, 1, 0, "LE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0xff)
			expect(buffer.readUint8(3)).toBe(0x11)
		})

		test("It should write a Uint16Array to the buffer at the specified byte offset (big endian)", ({ expect }) => {
			buffer.writeUint16Array(new Uint16Array([0x11ff]), 2, 1, 0, "BE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x11)
			expect(buffer.readUint8(3)).toBe(0xff)
		})
	})

	describe("writeUint32Array", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(8)
		})

		const uint32Array = new Uint32Array([0xff11ff11, 0x11ff11ff])
		const uint32ArrayByteValuesLE = [0x11, 0xff, 0x11, 0xff, 0xff, 0x11, 0xff, 0x11]
		const uint32ArrayByteValuesBE = [0xff, 0x11, 0xff, 0x11, 0x11, 0xff, 0x11, 0xff]

		test("It should write a Uint32Array to the buffer (little endian)", ({ expect }) => {
			buffer.writeUint32Array(uint32Array, 0, 8, 0, "LE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint32ArrayByteValuesLE[i])
			}
		})

		test("It should write a Uint32Array to the buffer (big endian)", ({ expect }) => {
			buffer.writeUint32Array(uint32Array, 0, 8, 0, "BE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(uint32ArrayByteValuesBE[i])
			}
		})

		test("It should write a Uint32Array to the buffer at the specified byte offset (little endian)", ({
			expect,
		}) => {
			buffer.writeUint32Array(new Uint32Array([0xf1ff1fff]), 4, 1, 0, "LE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x00)
			expect(buffer.readUint8(3)).toBe(0x00)
			expect(buffer.readUint8(4)).toBe(0xff)
			expect(buffer.readUint8(5)).toBe(0x1f)
			expect(buffer.readUint8(6)).toBe(0xff)
			expect(buffer.readUint8(7)).toBe(0xf1)
		})

		test("It should write a Uint32Array to the buffer at the specified byte offset (big endian)", ({ expect }) => {
			buffer.writeUint32Array(new Uint32Array([0xf1ff1fff]), 4, 1, 0, "BE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x00)
			expect(buffer.readUint8(3)).toBe(0x00)
			expect(buffer.readUint8(4)).toBe(0xf1)
			expect(buffer.readUint8(5)).toBe(0xff)
			expect(buffer.readUint8(6)).toBe(0x1f)
			expect(buffer.readUint8(7)).toBe(0xff)
		})
	})

	describe("writeBigInt", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(8)
		})

		const bigInt = BigInt(0xff11ff11ff11)
		const bigIntByteValuesLE = [0x11, 0xff, 0x11, 0xff, 0x11, 0xff, 0x00, 0x00]
		const bigIntByteValuesBE = [0xff, 0x11, 0xff, 0x11, 0xff, 0x11, 0x00, 0x00]

		test("It should write a BigInt to the buffer (little endian)", ({ expect }) => {
			buffer.writeBigInt(bigInt, 0, undefined, "LE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(bigIntByteValuesLE[i])
			}
		})

		test("It should write a BigInt to the buffer (big endian)", ({ expect }) => {
			buffer.writeBigInt(bigInt, 0, undefined, "BE")

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(bigIntByteValuesBE[i])
			}
		})

		test("It should write a BigInt to the buffer at the specified offset (little endian)", ({ expect }) => {
			buffer.writeBigInt(BigInt(0x1f2f3f4f), 4, undefined, "LE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x00)
			expect(buffer.readUint8(3)).toBe(0x00)
			expect(buffer.readUint8(4)).toBe(0x4f)
			expect(buffer.readUint8(5)).toBe(0x3f)
			expect(buffer.readUint8(6)).toBe(0x2f)
			expect(buffer.readUint8(7)).toBe(0x1f)
		})

		test("It should write a BigInt to the buffer at the specified offset (big endian)", ({ expect }) => {
			buffer.writeBigInt(BigInt(0x1f2f3f4f), 4, undefined, "BE")
			expect(buffer.readUint8(0)).toBe(0x00)
			expect(buffer.readUint8(1)).toBe(0x00)
			expect(buffer.readUint8(2)).toBe(0x00)
			expect(buffer.readUint8(3)).toBe(0x00)
			expect(buffer.readUint8(4)).toBe(0x1f)
			expect(buffer.readUint8(5)).toBe(0x2f)
			expect(buffer.readUint8(6)).toBe(0x3f)
			expect(buffer.readUint8(7)).toBe(0x4f)
		})

		test("It should throw if the value is not a valid BigInt", ({ expect }) => {
			expect(() => buffer.writeBigInt(BigInt(-1))).toThrow()
		})
	})
})
