import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeInternalBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test buffer instances
	const buffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => buffer.getPlatformEndianness(), "getPlatformEndianness")
	bench.benchmark(() => buffer.normalizeEndianness("BE"), "normalizeEndianness(BE)")
	bench.benchmark(() => buffer.normalizeEndianness("LE"), "normalizeEndianness(LE)")
	bench.benchmark(() => buffer.check(0, 1), "check")
	bench.print("internal")
}
