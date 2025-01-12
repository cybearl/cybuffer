import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeReadBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test buffer instances
	const buffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => buffer.readBit(0), "readBit")
	bench.benchmark(() => buffer.readUint8(0), "readUint8")
	bench.benchmark(() => buffer.readUint16LE(0), "readUint16LE")
	bench.benchmark(() => buffer.readUint16BE(0), "readUint16BE")
	bench.benchmark(() => buffer.readUint16(0), "readUint16")
	bench.benchmark(() => buffer.readUint32LE(0), "readUint32LE")
	bench.benchmark(() => buffer.readUint32BE(0), "readUint32BE")
	bench.benchmark(() => buffer.readUint32(0), "readUint32")
	bench.print("read (single-only)")

	bench.benchmark(() => buffer.readHexString(0, 1), "readHexString(1)")
	bench.benchmark(() => buffer.readUtf8String(0, 1), "readUtf8String(1)")
	bench.benchmark(() => buffer.readString(0, 1, "hex"), "readString(1:hex)")
	bench.benchmark(() => buffer.readString(0, 1, "utf8"), "readString(1:utf8)")
	bench.benchmark(() => buffer.readBits(0, 1), "readBits(1)")
	bench.benchmark(() => buffer.readUint8Array(0, 1), "readUint8Array(1)")
	bench.benchmark(() => buffer.readUint16Array(0, 1), "readUint16Array(1)")
	bench.benchmark(() => buffer.readUint32Array(0, 1), "readUint32Array(1)")
	bench.benchmark(() => buffer.readBigIntLE(0, 1), "readBigIntLE(1)")
	bench.benchmark(() => buffer.readBigIntBE(0, 1), "readBigIntBE(1)")
	bench.benchmark(() => buffer.readBigInt(0, 1), "readBigInt(1)")
	bench.print("read (single)")

	bench.benchmark(() => buffer.readHexString(0, benchmarkInputSize), `readHexString(${benchmarkInputSize})`)
	bench.benchmark(() => buffer.readUtf8String(0, benchmarkInputSize), `readUtf8String(${benchmarkInputSize})`)
	bench.benchmark(() => buffer.readString(0, benchmarkInputSize, "hex"), `readString(${benchmarkInputSize}:hex)`)
	bench.benchmark(() => buffer.readString(0, benchmarkInputSize, "utf8"), `readString(${benchmarkInputSize}:utf8)`)
	bench.benchmark(() => buffer.readBits(0, benchmarkInputSize), `readBits(${benchmarkInputSize})`)
	bench.benchmark(() => buffer.readUint8Array(0, benchmarkInputSize), `readUint8Array(${benchmarkInputSize})`)
	bench.benchmark(() => buffer.readUint16Array(0, benchmarkInputSize), `readUint16Array(${benchmarkInputSize})`)
	bench.benchmark(() => buffer.readUint32Array(0, benchmarkInputSize), `readUint32Array(${benchmarkInputSize})`)
	bench.benchmark(() => buffer.readBigIntLE(0, benchmarkInputSize), `readBigIntLE(${benchmarkInputSize})`)
	bench.benchmark(() => buffer.readBigIntBE(0, benchmarkInputSize), `readBigIntBE(${benchmarkInputSize})`)
	bench.benchmark(() => buffer.readBigInt(0, benchmarkInputSize), `readBigInt(${benchmarkInputSize})`)
	bench.print("read (multiple)")
}
