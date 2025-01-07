import CyBuffer from "@/index"
import { Bench } from "@cybearl/cypack"

export default function executeReadBenchmark(benchmarkInputSize: number, benchmarkDuration: number) {
	// Test cyBuffer instances
	const cyBuffer = CyBuffer.alloc(benchmarkInputSize)

	// Benchmark
	const bench = new Bench(benchmarkDuration)

	bench.benchmark(() => cyBuffer.readBit(0), "readBit")
	bench.benchmark(() => cyBuffer.readUint8(0), "readUint8")
	bench.benchmark(() => cyBuffer.readUint16LE(0), "readUint16LE")
	bench.benchmark(() => cyBuffer.readUint16BE(0), "readUint16BE")
	bench.benchmark(() => cyBuffer.readUint16(0), "readUint16")
	bench.benchmark(() => cyBuffer.readUint32LE(0), "readUint32LE")
	bench.benchmark(() => cyBuffer.readUint32BE(0), "readUint32BE")
	bench.benchmark(() => cyBuffer.readUint32(0), "readUint32")
	bench.print("read (single-only)")

	bench.benchmark(() => cyBuffer.readHexString(0, 1), "readHexString(1)")
	bench.benchmark(() => cyBuffer.readUtf8String(0, 1), "readUtf8String(1)")
	bench.benchmark(() => cyBuffer.readString(0, 1, "hex"), "readString(1:hex)")
	bench.benchmark(() => cyBuffer.readString(0, 1, "utf8"), "readString(1:utf8)")
	bench.benchmark(() => cyBuffer.readBits(0, 1), "readBits(1)")
	bench.benchmark(() => cyBuffer.readUint8Array(0, 1), "readUint8Array(1)")
	bench.benchmark(() => cyBuffer.readUint16Array(0, 1), "readUint16Array(1)")
	bench.benchmark(() => cyBuffer.readUint32Array(0, 1), "readUint32Array(1)")
	bench.benchmark(() => cyBuffer.readBigIntLE(0, 1), "readBigIntLE(1)")
	bench.benchmark(() => cyBuffer.readBigIntBE(0, 1), "readBigIntBE(1)")
	bench.benchmark(() => cyBuffer.readBigInt(0, 1), "readBigInt(1)")
	bench.print("read (single)")

	bench.benchmark(() => cyBuffer.readHexString(0, benchmarkInputSize), `readHexString(${benchmarkInputSize})`)
	bench.benchmark(() => cyBuffer.readUtf8String(0, benchmarkInputSize), `readUtf8String(${benchmarkInputSize})`)
	bench.benchmark(() => cyBuffer.readString(0, benchmarkInputSize, "hex"), `readString(${benchmarkInputSize}:hex)`)
	bench.benchmark(() => cyBuffer.readString(0, benchmarkInputSize, "utf8"), `readString(${benchmarkInputSize}:utf8)`)
	bench.benchmark(() => cyBuffer.readBits(0, benchmarkInputSize), `readBits(${benchmarkInputSize})`)
	bench.benchmark(() => cyBuffer.readUint8Array(0, benchmarkInputSize), `readUint8Array(${benchmarkInputSize})`)
	bench.benchmark(() => cyBuffer.readUint16Array(0, benchmarkInputSize), `readUint16Array(${benchmarkInputSize})`)
	bench.benchmark(() => cyBuffer.readUint32Array(0, benchmarkInputSize), `readUint32Array(${benchmarkInputSize})`)
	bench.benchmark(() => cyBuffer.readBigIntLE(0, benchmarkInputSize), `readBigIntLE(${benchmarkInputSize})`)
	bench.benchmark(() => cyBuffer.readBigIntBE(0, benchmarkInputSize), `readBigIntBE(${benchmarkInputSize})`)
	bench.benchmark(() => cyBuffer.readBigInt(0, benchmarkInputSize), `readBigInt(${benchmarkInputSize})`)
	bench.print("read (multiple)")
}
