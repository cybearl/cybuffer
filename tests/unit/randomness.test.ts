import CyBuffer from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("randomness", () => {
	describe("randomFill", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(10)
		})

		test("It should fill the buffer with random values", ({ expect }) => {
			buffer.randomFill()

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBeGreaterThanOrEqual(0)
				expect(buffer.readUint8(i)).toBeLessThanOrEqual(0xff)
			}
		})

		test("It should fill the buffer with random values at the specified offset", ({ expect }) => {
			buffer.randomFill(5)

			for (let i = 0; i < buffer.length; i++) {
				if (i < 5) {
					expect(buffer.readUint8(i)).toBe(0x00)
				} else {
					expect(buffer.readUint8(i)).toBeGreaterThanOrEqual(0)
					expect(buffer.readUint8(i)).toBeLessThanOrEqual(0xff)
				}
			}
		})
	})

	describe("safeRandomFill", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(10)
		})

		test("It should fill the buffer with cryptographically secure random values", ({ expect }) => {
			buffer.safeRandomFill()

			for (let i = 0; i < buffer.length; i++) {
				expect(buffer.readUint8(i)).toBeGreaterThanOrEqual(0)
				expect(buffer.readUint8(i)).toBeLessThanOrEqual(0xff)
			}
		})

		test("It should fill the buffer with cryptographically secure random values at the specified offset", ({
			expect,
		}) => {
			buffer.safeRandomFill(5, 5)

			for (let i = 0; i < buffer.length; i++) {
				if (i < 5) {
					expect(buffer.readUint8(i)).toBe(0x00)
				} else {
					expect(buffer.readUint8(i)).toBeGreaterThanOrEqual(0)
					expect(buffer.readUint8(i)).toBeLessThanOrEqual(0xff)
				}
			}
		})
	})
})
