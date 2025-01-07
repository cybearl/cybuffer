import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeConvertBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test values
	const randomHex = "A".repeat(benchmarkInputSize * 2)

	// Test cyBuffer instances
	const cyBuffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => cyBuffer.toHexString(), `toHexString(${randomHex.length})`)
	bench.benchmark(() => cyBuffer.toUtf8String(), `toUtf8String(${randomHex.length})`)
	bench.benchmark(() => cyBuffer.toString("hex"), "toString(hex)")
	bench.benchmark(() => cyBuffer.toString("utf8"), "toString(utf8)")
	bench.benchmark(() => cyBuffer.toBits(), `toBits(${randomHex.length})`)
	bench.benchmark(() => cyBuffer.toUint8Array(), `toUint8Array(${randomHex.length})`)
	bench.benchmark(() => cyBuffer.toUint16Array(), `toUint16Array(${randomHex.length})`)
	bench.benchmark(() => cyBuffer.toUint32Array(), `toUint32Array(${randomHex.length})`)
	bench.print("convert")
}
