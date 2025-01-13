import os from "node:os"
import CyBuffer from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("internal", () => {
	describe("getPlatformEndianness", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		const platformEndianness = os.endianness()

		test("It should return the platform endianness", ({ expect }) => {
			expect(buffer.getPlatformEndianness()).toBe(platformEndianness)
		})
	})

	describe("normalizeEndianness", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(4)
		})

		const platformEndianness = os.endianness()

		test("It should return the normalized platform endianness", ({ expect }) => {
			if (platformEndianness === "LE") {
				expect(buffer.normalizeEndianness("LE")).toBe("LE")
				expect(buffer.normalizeEndianness("BE")).toBe("BE")
			} else {
				expect(buffer.normalizeEndianness("BE")).toBe("LE")
				expect(buffer.normalizeEndianness("LE")).toBe("BE")
			}
		})
	})

	describe("check", () => {
		let buffer: CyBuffer

		beforeEach(() => {
			buffer = new CyBuffer(10)
		})

		test("It should throw if the offset is an invalid number", ({ expect }) => {
			expect(() => buffer.check(Number.NaN, 0)).toThrow()
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			expect(() => buffer.check("Z", 0)).toThrow()
		})

		test("It should throw if the length is an invalid number", ({ expect }) => {
			expect(() => buffer.check(0, Number.NaN)).toThrow()
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			expect(() => buffer.check(0, "Z")).toThrow()
		})

		test("It should throw if the offset is negative", ({ expect }) => {
			expect(() => buffer.check(-1, 0)).toThrow()
		})

		test("It should throw if the length is negative", ({ expect }) => {
			expect(() => buffer.check(0, -1)).toThrow()
		})

		test("It should throw if the offset is out of bounds", ({ expect }) => {
			expect(() => buffer.check(10, 0)).toThrow()
		})

		test("It should throw if the length is out of bounds", ({ expect }) => {
			expect(() => buffer.check(0, 11)).toThrow()
		})

		test("It should throw if the offset + length is out of bounds", ({ expect }) => {
			expect(() => buffer.check(9, 2)).toThrow()
		})

		test("It should throw if the offset modulo 1 is not 0", ({ expect }) => {
			expect(() => buffer.check(0.5, 0)).toThrow()
		})

		test("It should throw if the length modulo 1 is not 0", ({ expect }) => {
			expect(() => buffer.check(0, 0.5)).toThrow()
		})

		test("It should not throw if the offset is valid", ({ expect }) => {
			expect(() => buffer.check(0, 10)).not.toThrow()
		})

		// Testing the value
		test("It should throw if the optional checked value is not a number", ({ expect }) => {
			expect(() => buffer.check(0, 10, "Z")).toThrow()
		})

		test("It should throw if the optional checked value is smaller than 0", ({ expect }) => {
			expect(() => buffer.check(0, 10, -1)).toThrow()
		})

		test("It should throw if the optional checked value is bigger than 255", ({ expect }) => {
			expect(() => buffer.check(0, 10, 256)).toThrow()
		})
	})
})
