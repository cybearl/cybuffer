import os from "node:os"
import CyBuffer from "@/index"
import { beforeEach, describe, test } from "vitest"

describe("values", () => {
	let buffer: CyBuffer

	beforeEach(() => {
		buffer = new CyBuffer(10)
	})

	test("It should have the proper platform endianness", ({ expect }) => {
		const platformEndianness = os.endianness()
		expect(buffer.platformEndianness).toBe(platformEndianness)
	})

	test("It should return the ArrayBuffer instance of the buffer", ({ expect }) => {
		expect(buffer.arrayBuffer).toBeInstanceOf(ArrayBuffer)
	})

	test("It should return the proper initial offset of the buffer", ({ expect }) => {
		expect(buffer.offset).toBe(0)
	})

	test("It should return the proper buffer length", ({ expect }) => {
		expect(buffer.length).toBe(10)
	})
})
