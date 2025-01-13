import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeConversionBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test values
	const randomHex = "A".repeat(benchmarkInputSize * 2)

	// Test buffer instances
	const buffer = CyBuffer.fromHexString(randomHex)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => buffer.toHexString(), `toHexString(${randomHex.length / 2} bytes)`)
	bench.benchmark(() => buffer.toUtf8String(), `toUtf8String(${randomHex.length})`)
	bench.benchmark(() => buffer.toBits(), `toBits(${randomHex.length})`)
	bench.benchmark(() => buffer.toUint8Array(), `toUint8Array(${randomHex.length})`)
	bench.benchmark(() => buffer.toUint16Array(), `toUint16Array(${randomHex.length})`)
	bench.benchmark(() => buffer.toUint32Array(), `toUint32Array(${randomHex.length})`)
	bench.benchmark(() => buffer.toBigInt(), `toBigInt(${randomHex.length})`)
	bench.print("convert")
}
