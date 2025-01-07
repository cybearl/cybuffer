import CyBuffer, { type Bit } from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeWriteBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test values
	const oneBitArray: Bit[] = [0]
	const randomBitArray: Bit[] = new Array(benchmarkInputSize).fill(0)
	for (let i = 0; i < benchmarkInputSize; i++) randomBitArray[i] = Math.floor(Math.random() * 2) as Bit

	const oneUint8Array = new Uint8Array(1)
	oneUint8Array[0] = 0xff
	const randomUint8Array = new Uint8Array(benchmarkInputSize)
	for (let i = 0; i < benchmarkInputSize; i++) randomUint8Array[i] = Math.floor(Math.random() * 0xff)

	const oneUint16Array = new Uint16Array(1)
	oneUint16Array[0] = 0xffff
	const randomUint16Array: Uint16Array = new Uint16Array(benchmarkInputSize / 2)
	for (let i = 0; i < benchmarkInputSize / 2; i++) randomUint16Array[i] = Math.floor(Math.random() * 0xffff)

	const oneUint32Array = new Uint32Array(1)
	oneUint32Array[0] = 0xffffffff
	const randomUint32Array: Uint32Array = new Uint32Array(benchmarkInputSize / 4)
	for (let i = 0; i < benchmarkInputSize / 4; i++) randomUint32Array[i] = Math.floor(Math.random() * 0xffffffff)

	const oneHex = "A".repeat(2)
	const randomHex = "A".repeat(benchmarkInputSize * 2)

	const oneUtf8 = "A"
	const randomUtf8 = "A".repeat(benchmarkInputSize)

	const oneBigInt = BigInt(0x1)
	const randomBigInt = BigInt(`0x${randomHex.slice(0, benchmarkInputSize)}`)

	// Test cyBuffer instances
	const cyBuffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => cyBuffer.writeBit(1), "writeBit")
	bench.benchmark(() => cyBuffer.writeUint8(0xff), "writeUint8")
	bench.benchmark(() => cyBuffer.writeUint16LE(0xffff), "writeUint16LE")
	bench.benchmark(() => cyBuffer.writeUint16BE(0xffff), "writeUint16BE")
	bench.benchmark(() => cyBuffer.writeUint16(0xffff), "writeUint16")
	bench.benchmark(() => cyBuffer.writeUint32LE(0xffffffff), "writeUint32LE")
	bench.benchmark(() => cyBuffer.writeUint32BE(0xffffffff), "writeUint32BE")
	bench.benchmark(() => cyBuffer.writeUint32(0xffffffff), "writeUint32")
	bench.print("write (single-only)")

	bench.benchmark(() => cyBuffer.writeHexString(oneHex), "writeHexString(1)")
	bench.benchmark(() => cyBuffer.writeUtf8String(oneUtf8), "writeUtf8String(1)")
	bench.benchmark(() => cyBuffer.writeString(oneHex, "hex"), "writeString(1:hex)")
	bench.benchmark(() => cyBuffer.writeString(oneUtf8, "utf8"), "writeString(1:utf8)")
	bench.benchmark(() => cyBuffer.writeBits(oneBitArray), "writeBigIntLE(1)")
	bench.benchmark(() => cyBuffer.writeUint8Array(oneUint8Array), "writeUint8Array(1)")
	bench.benchmark(() => cyBuffer.writeUint16Array(oneUint16Array), "writeUint16Array(1)")
	bench.benchmark(() => cyBuffer.writeUint32Array(oneUint32Array), "writeUint32Array(1)")
	bench.benchmark(() => cyBuffer.writeBigIntLE(oneBigInt), "writeBigIntLE(1)")
	bench.benchmark(() => cyBuffer.writeBigIntBE(oneBigInt), "writeBigIntBE(1)")
	bench.benchmark(() => cyBuffer.writeBigInt(oneBigInt), "writeBigInt(1)")
	bench.print("write (single)")

	bench.benchmark(() => cyBuffer.writeHexString(randomHex), `writeHexString(${randomHex.length})`)
	bench.benchmark(() => cyBuffer.writeUtf8String(randomUtf8), `writeUtf8String(${randomUtf8.length})`)
	bench.benchmark(() => cyBuffer.writeString(randomHex, "hex"), `writeString(${randomHex.length}:hex)`)
	bench.benchmark(() => cyBuffer.writeString(randomUtf8, "utf8"), `writeString(${randomUtf8.length}:utf8)`)
	bench.benchmark(() => cyBuffer.writeBits(randomBitArray), `writeBits(${randomBitArray.length})`)
	bench.benchmark(() => cyBuffer.writeUint8Array(randomUint8Array), `writeUint8Array(${randomUint8Array.length})`)
	bench.benchmark(() => cyBuffer.writeUint16Array(randomUint16Array), `writeUint16Array(${randomUint16Array.length})`)
	bench.benchmark(() => cyBuffer.writeUint32Array(randomUint32Array), `writeUint32Array(${randomUint32Array.length})`)
	bench.benchmark(() => cyBuffer.writeBigIntLE(randomBigInt), `writeBigIntLE(${randomBigInt.toString().length})`)
	bench.benchmark(() => cyBuffer.writeBigIntBE(randomBigInt), `writeBigIntBE(${randomBigInt.toString().length})`)
	bench.benchmark(() => cyBuffer.writeBigInt(randomBigInt), `writeBigInt(${randomBigInt.toString().length})`)
	bench.print("write (multiple)")
}
