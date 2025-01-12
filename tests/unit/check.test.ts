import CyBuffer from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("check", () => {
	describe("equals", () => {
		let buffer1: CyBuffer
		let buffer2: CyBuffer
		let buffer3: CyBuffer

		beforeEach(() => {
			buffer1 = CyBuffer.fromHexString("FF11FF11")
			buffer2 = CyBuffer.fromHexString("FF11FF11")
			buffer3 = CyBuffer.fromHexString("FF11FF")
		})

		test.only("It should return true if the buffers are equal", ({ expect }) => {
			expect(buffer1.equals(buffer2)).toBe(true)
		})

		test("It should return false if the buffers are not equal", ({ expect }) => {
			buffer2.writeUint8(0, 0x00)
			expect(buffer1.equals(buffer2)).toBe(false)
		})

		test("It should return false if the buffers have different lengths", ({ expect }) => {
			expect(buffer1.equals(buffer3)).toBe(false)
		})
	})

	describe("isEmpty", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = CyBuffer.alloc(4)
		})

		test("It should return true if the buffer is empty", ({ expect }) => {
			expect(buffer.isEmpty()).toBe(true)
		})

		test("It should return false if the buffer is not empty", ({ expect }) => {
			buffer.writeUint8(0xff)
			expect(buffer.isEmpty()).toBe(false)
		})
	})
})
