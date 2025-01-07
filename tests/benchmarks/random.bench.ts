import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeRandomBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test cyBuffer instances
	const cyBuffer = CyBuffer.alloc(benchmarkInputSize)
	const cyBufferX8 = CyBuffer.alloc(benchmarkInputSize * 8)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => cyBuffer.randomFill(), `randomFill(${benchmarkInputSize})`)
	bench.benchmark(() => cyBufferX8.randomFill(), `randomFill(${benchmarkInputSize * 8})`)
	bench.benchmark(() => cyBuffer.safeRandomFill(), `safeRandomFill(${benchmarkInputSize})`)
	bench.benchmark(() => cyBufferX8.safeRandomFill(), `safeRandomFill(${benchmarkInputSize * 8})`)
	bench.print("random")
}
