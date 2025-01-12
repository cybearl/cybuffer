import CyBuffer, { type Bit } from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeStaticBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test values
	const randomHex = "A".repeat(benchmarkInputSize * 2)
	const randomUtf8 = "A".repeat(benchmarkInputSize)

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

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => CyBuffer.alloc(1), "alloc")
	bench.benchmark(() => CyBuffer.fromHexString("aa"), "fromHexString")
	bench.benchmark(() => CyBuffer.fromUtf8String("a"), "fromUtf8String")
	bench.benchmark(() => CyBuffer.fromBits(oneBitArray), "fromBits")
	bench.benchmark(() => CyBuffer.fromUint8Array(oneUint8Array), "fromUint8Array")
	bench.benchmark(() => CyBuffer.fromUint16Array(oneUint16Array), "fromUint16Array")
	bench.benchmark(() => CyBuffer.fromUint32Array(oneUint32Array), "fromUint32Array")
	bench.benchmark(() => CyBuffer.fromBigInt(1n), "fromBigInt")
	bench.benchmark(() => CyBuffer.fromRange(0, 1), "fromRange")
	bench.print("static")

	bench.benchmark(() => CyBuffer.alloc(benchmarkInputSize), `alloc(${benchmarkInputSize})`)
	bench.benchmark(() => CyBuffer.fromHexString(randomHex), `fromHexString(${randomHex.length})`)
	bench.benchmark(() => CyBuffer.fromUtf8String(randomUtf8), `fromUtf8String(${randomUtf8.length})`)
	bench.benchmark(() => CyBuffer.fromBits(randomBitArray), `fromBits(${randomBitArray.length})`)
	bench.benchmark(() => CyBuffer.fromUint8Array(randomUint8Array), `fromUint8Array(${randomUint8Array.length})`)
	bench.benchmark(() => CyBuffer.fromUint16Array(randomUint16Array), `fromUint16Array(${randomUint16Array.length})`)
	bench.benchmark(() => CyBuffer.fromUint32Array(randomUint32Array), `fromUint32Array(${randomUint32Array.length})`)
	bench.benchmark(() => CyBuffer.fromBigInt(BigInt(benchmarkInputSize)), "fromBigInt")
	bench.benchmark(() => CyBuffer.fromRange(0, benchmarkInputSize), `fromRange(0, ${benchmarkInputSize})`)
	bench.print("static (multiple)")
}
