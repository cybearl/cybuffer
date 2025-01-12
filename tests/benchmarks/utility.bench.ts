import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeUtilityBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test buffer instances
	const buffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => buffer.copy(0, benchmarkInputSize), "copy")
	bench.benchmark(() => buffer.subarray(0, benchmarkInputSize), "subarray")
	bench.benchmark(() => buffer.swap(0, benchmarkInputSize), "swap")
	bench.benchmark(() => buffer.partialReverse(0, benchmarkInputSize / 2), `partialReverse(${benchmarkInputSize / 2})`)
	bench.benchmark(() => buffer.reverse(), "reverse")
	bench.benchmark(() => buffer.rotateLeft(), "rotateLeft")
	bench.benchmark(() => buffer.rotateRight(), "rotateRight")
	bench.benchmark(() => buffer.shiftLeft(), "shiftLeft")
	bench.benchmark(() => buffer.shiftRight(), "shiftRight")
	bench.benchmark(() => buffer.fill(0xff), "fill")
	bench.benchmark(() => buffer.clear(), "clear")
	bench.print("utility")
}
