import CyBuffer from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("utility", () => {
	describe("copy", () => {
		let buffer: CyBuffer
		let copy: CyBuffer
		let partialCopy: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF11")
			copy = buffer.copy()
		})

		test("It should create a copy of the buffer", ({ expect }) => {
			expect(copy).toBeInstanceOf(CyBuffer)
		})

		test("It should create a copy of the buffer with the same length", ({ expect }) => {
			expect(copy.length).toBe(buffer.length)
		})

		test("It should create a copy of the buffer with the same values", ({ expect }) => {
			for (let i = 0; i < buffer.length; i++) {
				expect(copy.readUint8(i)).toBe(buffer.readUint8(i))
			}
		})

		test("It should create a partial copy of the buffer", ({ expect }) => {
			partialCopy = buffer.copy(2, 2)
			expect(partialCopy.length).toBe(2)
			expect(partialCopy.readHexString()).toBe("FF11")
		})
	})

	describe("subarray", () => {
		let buffer: CyBuffer
		let subarray: CyBuffer
		let partialSubarray: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF11")
			subarray = buffer.subarray(2, 2)
		})

		test("It should create a subarray of the buffer", ({ expect }) => {
			expect(subarray).toBeInstanceOf(CyBuffer)
		})

		test("It should create a subarray that points to the same memory as the original buffer", ({ expect }) => {
			expect(subarray.arrayBuffer).toBe(buffer.arrayBuffer)
		})

		test("It should create a subarray of the buffer with the correct length", ({ expect }) => {
			expect(subarray.length).toBe(2)
		})

		test("It should create a subarray of the buffer with the correct values", ({ expect }) => {
			expect(subarray.readHexString()).toBe("FF11")
		})

		test("It should create a partial subarray of the buffer", ({ expect }) => {
			partialSubarray = buffer.subarray(0, 2)
			expect(partialSubarray.length).toBe(2)
			expect(partialSubarray.readHexString()).toBe("FF11")
		})
	})

	describe("swap", () => {
		let buffer: CyBuffer
		let swapped: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF11")
			swapped = buffer.swap()
		})

		test("It should create a buffer with the swapped endianness", ({ expect }) => {
			expect(swapped.readHexString()).toBe("11FF11FF")
		})
	})

	describe("partialReverse", () => {
		let buffer: CyBuffer
		let partialReversed: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF11")
			partialReversed = buffer.partialReverse(2, 2)
		})

		test("It should create a buffer with the partially reversed values", ({ expect }) => {
			expect(partialReversed.readHexString()).toBe("FF1111FF")
		})
	})

	describe("reverse", () => {
		let buffer: CyBuffer
		let reversed: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF11")
			reversed = buffer.reverse()
		})

		test("It should create a buffer with the reversed values", ({ expect }) => {
			expect(reversed.readHexString()).toBe("11FF11FF")
		})
	})

	describe("rotateLeft", () => {
		let buffer: CyBuffer
		let rotated: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("2211FF11")
			rotated = buffer.rotateLeft()
		})

		test("It should create a buffer with the rotated values", ({ expect }) => {
			expect(rotated.readHexString()).toBe("11FF1122")
		})
	})

	describe("rotateRight", () => {
		let buffer: CyBuffer
		let rotated: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF22")
			rotated = buffer.rotateRight()
		})

		test("It should create a buffer with the rotated values", ({ expect }) => {
			expect(rotated.readHexString()).toBe("22FF11FF")
		})
	})

	describe("shiftLeft", () => {
		let buffer: CyBuffer
		let shifted: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF11")
			shifted = buffer.shiftLeft()
		})

		test("It should create a buffer with the shifted values", ({ expect }) => {
			expect(shifted.readHexString()).toBe("11FF1100")
		})
	})

	describe("shiftRight", () => {
		let buffer: CyBuffer
		let shifted: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF11")
			shifted = buffer.shiftRight()
		})

		test("It should create a buffer with the shifted values", ({ expect }) => {
			expect(shifted.readHexString()).toBe("00FF11FF")
		})
	})

	describe("fill", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.alloc(10)
		})

		test("It should fill the buffer with a value", ({ expect }) => {
			buffer.fill(0xff)

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(0xff)
			}
		})

		test("It should fill the buffer with a value at the specified offset", ({ expect }) => {
			buffer.fill(0xff, 5, 5)

			for (let i = 0; i < buffer.length; i++) {
				if (i < 5) {
					expect(buffer.readUint8(i)).toBe(0x00)
				} else {
					expect(buffer.readUint8(i)).toBe(0xff)
				}
			}
		})

		test("It should throw if the value is not a valid uint8", ({ expect }) => {
			expect(() => buffer.fill(-1)).toThrow()
			expect(() => buffer.fill(0x100)).toThrow()
		})
	})

	describe("clear", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.fromHexString("FF11FF11")
		})

		test("It should clear the buffer", ({ expect }) => {
			buffer.clear()

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBe(0x00)
			}
		})
	})
})
