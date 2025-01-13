import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeAccessorsBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test buffer instances
	const buffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => buffer[0], "proxy => [] operator (get)")

	bench.benchmark(() => {
		buffer[0] = 0x01
	}, "proxy => [] operator (set)")

	bench.benchmark(() => {
		for (const value of buffer) {
			// access the value to avoid the loop being optimized out
			value + 1
		}
	}, "symbol iterator")

	bench.benchmark(() => {
		for (const [index, value] of buffer.entries()) {
			// access the index and value to avoid the loop being optimized out
			index + value
			value + 1
		}
	}, "entries")

	bench.print("accessors")
}
