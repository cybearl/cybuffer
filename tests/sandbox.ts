import CyBuffer from "@/index"

const buffer = new CyBuffer(32)

for (const [v, i] of buffer.entries()) {
	console.log(v, i)
}
