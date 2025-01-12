import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeConvertBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test values
	const randomHex = "A".repeat(benchmarkInputSize * 2)

	// Test buffer instances
	const buffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => buffer.toHexString(), `toHexString(${randomHex.length})`)
	bench.benchmark(() => buffer.toUtf8String(), `toUtf8String(${randomHex.length})`)
	bench.benchmark(() => buffer.toString("hex"), "toString(hex)")
	bench.benchmark(() => buffer.toString("utf8"), "toString(utf8)")
	bench.benchmark(() => buffer.toBits(), `toBits(${randomHex.length})`)
	bench.benchmark(() => buffer.toUint8Array(), `toUint8Array(${randomHex.length})`)
	bench.benchmark(() => buffer.toUint16Array(), `toUint16Array(${randomHex.length})`)
	bench.benchmark(() => buffer.toUint32Array(), `toUint32Array(${randomHex.length})`)
	bench.print("convert")
}
