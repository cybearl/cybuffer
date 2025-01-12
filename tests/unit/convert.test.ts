import CyBuffer from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("convert", () => {
	let buffer: CyBuffer

	describe("toHexString", () => {
		const hexString = "FF00FF00"

		beforeEach(() => {
			buffer = CyBuffer.fromHexString(hexString)
		})

		test("It should convert the buffer to a hex string", ({ expect }) => {
			expect(buffer.toHexString()).toBe(hexString)
		})

		test("It should convert the buffer to a hex string with the '0x' prefix", ({ expect }) => {
			expect(buffer.toHexString(true)).toBe(`0x${hexString}`)
		})
	})

	describe("toUtf8String", () => {
		const utf8String = "Hello, world!"

		beforeEach(() => {
			buffer = CyBuffer.fromUtf8String(utf8String)
		})

		test("It should convert the buffer to a UTF-8 string", ({ expect }) => {
			expect(buffer.toUtf8String()).toBe(utf8String)
		})
	})

	describe("toString", () => {
		const hexString = "FF00FF00"
		const utf8String = "Hello, world!"

		beforeEach(() => {
			buffer = CyBuffer.fromHexString(hexString)
		})

		test("It should convert the buffer to an hexadecimal string", ({ expect }) => {
			expect(buffer.toString()).toBe(hexString)
		})

		test("It should convert the buffer to a an hexadecimal string with the '0x' prefix", ({ expect }) => {
			expect(buffer.toString("hex", true)).toBe(`0x${hexString}`)
		})

		test("It should convert the buffer to a UTF-8 string", ({ expect }) => {
			buffer = CyBuffer.fromUtf8String(utf8String)
			expect(buffer.toString("utf8")).toBe(utf8String)
		})
	})

	describe("toBits", () => {
		const hexString = "FF00"

		beforeEach(() => {
			buffer = CyBuffer.fromHexString(hexString)
		})

		const bits = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]

		test("It should convert the buffer to an array of bits", ({ expect }) => {
			expect(buffer.toBits()).toEqual(bits)
		})
	})

	describe("toUint8Array", () => {
		const hexString = "FF11FF11"

		beforeEach(() => {
			buffer = CyBuffer.fromHexString(hexString)
		})

		test("It should convert the buffer to a Uint8Array", ({ expect }) => {
			expect(buffer.toUint8Array()).toEqual(new Uint8Array([0xff, 0x11, 0xff, 0x11]))
		})
	})

	describe("toUint16Array", () => {
		const hexString = "1F1F1F1F"

		beforeEach(() => {
			buffer = CyBuffer.fromHexString(hexString)
		})

		const uint16Array = new Uint16Array([0x1f1f, 0x1f1f])

		test("It should convert the cache to a Uint16Array", ({ expect }) => {
			expect(buffer.toUint16Array()).toEqual(uint16Array)
		})
	})

	describe("toUint32Array", () => {
		const hexString = "1F1F1F1F1F1F1F1F"

		beforeEach(() => {
			buffer = CyBuffer.fromHexString(hexString)
		})

		const uint32Array = new Uint32Array([0x1f1f1f1f, 0x1f1f1f1f])

		test("It should convert the cache to a Uint32Array", ({ expect }) => {
			expect(buffer.toUint32Array()).toEqual(uint32Array)
		})
	})
})
