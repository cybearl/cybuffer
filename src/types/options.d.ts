import type { Endianness } from "@/types/general"

export type OffsetAndLength = {
	offset: number
	length: number
}

export type EndiannessAndVerifyAlignment = {
	endianness: Endianness
	verifyAlignment: boolean
}

export type WriteUintArrayOptions = OffsetAndLength & {
	arrayOffset: number
}

export type WriteUint1632ArrayOptions = WriteUintArrayOptions & EndiannessAndVerifyAlignment
