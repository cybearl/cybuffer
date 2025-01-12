import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeRandomBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test buffer instances
	const buffer = CyBuffer.alloc(benchmarkInputSize)
	const bufferX8 = CyBuffer.alloc(benchmarkInputSize * 8)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => buffer.randomFill(), `randomFill(${benchmarkInputSize})`)
	bench.benchmark(() => bufferX8.randomFill(), `randomFill(${benchmarkInputSize * 8})`)
	bench.benchmark(() => buffer.safeRandomFill(), `safeRandomFill(${benchmarkInputSize})`)
	bench.benchmark(() => bufferX8.safeRandomFill(), `safeRandomFill(${benchmarkInputSize * 8})`)
	bench.print("random")
}
