import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeGeneralBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test cyBuffer instances
	const cyBuffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => cyBuffer.check(0, 1), "check")
	bench.benchmark(() => cyBuffer.normalizeEndianness("BE"), "normalizeEndianness")
	bench.print("general")
}
