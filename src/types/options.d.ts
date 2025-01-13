import type { Endianness } from "@/types/general"

type OffsetAndLength = {
	offset?: number
	length?: number
}

type EndiannessAndVerifyAlignment = {
	endianness?: Endianness
	verifyAlignment?: boolean
}

type WriteUintArrayOptions = OffsetAndLength & {
	arrayOffset?: number
}

type WriteUint1632ArrayOptions = WriteUintArrayOptions & EndiannessAndVerifyAlignment
