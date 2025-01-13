import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeCheckBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test values
	const randomHex = "A".repeat(benchmarkInputSize * 2)

	// Test buffer instances
	const buffer = CyBuffer.alloc(benchmarkInputSize)
	buffer.fill(0x01)

	const emptyCyBuffer = CyBuffer.alloc(1)
	const firstEqualCyBuffer = CyBuffer.alloc(benchmarkInputSize)
	const secondEqualCyBuffer = CyBuffer.alloc(benchmarkInputSize)
	const firstUnequalCyBuffer = CyBuffer.fromHexString(randomHex)
	const secondUnequalCyBuffer = CyBuffer.fromHexString(randomHex.split("").reverse().join(""))

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => firstEqualCyBuffer.equals(secondEqualCyBuffer), "equals(true)")
	bench.benchmark(() => firstUnequalCyBuffer.equals(secondUnequalCyBuffer), "equals(false)")
	bench.benchmark(() => emptyCyBuffer.isEmpty(), "isEmpty(1)")
	bench.benchmark(() => buffer.isEmpty(), `isEmpty(${benchmarkInputSize})`)
	bench.benchmark(() => emptyCyBuffer.isFull(), "isFull(1)")
	bench.benchmark(() => buffer.isFull(), `isFull(${benchmarkInputSize})`)
	bench.print("check")
}
