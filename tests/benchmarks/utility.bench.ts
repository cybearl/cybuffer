import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeUtilityBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test cyBuffer instances
	const cyBuffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => cyBuffer.copy(0, benchmarkInputSize), "copy")
	bench.benchmark(() => cyBuffer.subarray(0, benchmarkInputSize), "subarray")
	bench.benchmark(() => cyBuffer.swap(0, benchmarkInputSize), "swap")
	bench.benchmark(
		() => cyBuffer.partialReverse(0, benchmarkInputSize / 2),
		`partialReverse(${benchmarkInputSize / 2})`,
	)
	bench.benchmark(() => cyBuffer.reverse(), "reverse")
	bench.benchmark(() => cyBuffer.rotateLeft(), "rotateLeft")
	bench.benchmark(() => cyBuffer.rotateRight(), "rotateRight")
	bench.benchmark(() => cyBuffer.shiftLeft(), "shiftLeft")
	bench.benchmark(() => cyBuffer.shiftRight(), "shiftRight")
	bench.benchmark(() => cyBuffer.fill(0xff), "fill")
	bench.benchmark(() => cyBuffer.clear(), "clear")
	bench.print("utility")
}
