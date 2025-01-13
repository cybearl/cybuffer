import CyBuffer from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("accessors", () => {
	describe("proxy", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		test("It should allow to set and get values using the proxy [] operator", ({ expect }) => {
			buffer[0] = 0x01
			buffer[1] = 0x02
			buffer[2] = 0x03
			buffer[3] = 0x04

			expect(buffer[0]).toBe(0x01)
			expect(buffer[1]).toBe(0x02)
			expect(buffer[2]).toBe(0x03)
			expect(buffer[3]).toBe(0x04)
		})

		test("It should throw if the value is an invalid number", ({ expect }) => {
			expect(() => {
				buffer[0] = Number.NaN
			}).toThrow()
		})
	})

	describe("symbol iterator", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		test("It should add support for the 'for ... of' loop syntax", ({ expect }) => {
			buffer[0] = 0x01
			buffer[1] = 0x02
			buffer[2] = 0x03
			buffer[3] = 0x04

			let i = 1
			for (const value of buffer) {
				expect(value).toBe(i++)
			}
		})
	})

	describe("entries", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		test("It should yield both the index and the value", ({ expect }) => {
			buffer[0] = 0x01
			buffer[1] = 0x02
			buffer[2] = 0x03
			buffer[3] = 0x04

			let i = 0
			for (const [index, value] of buffer.entries()) {
				expect(index).toBe(i)
				expect(value).toBe(i + 1)
				i++
			}
		})
	})
})
