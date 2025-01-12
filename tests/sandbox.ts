import CyBuffer from "@/index"

//
const buffer = new CyBuffer(10)

buffer.fill(0xff)

console.log(buffer[9])
buffer[9] = 0x00
console.log(buffer[9])
