import { cyGeneral } from "@cybearl/cypack"
import dedent from "dedent-js"
import minimist from "minimist"

/**
 * The help message.
 */
const helpMessage = dedent`
    Usage: yarn bench [options]

    Options:
        -b, --benchmark <name>          Run a specific benchmark.
        -c, --cacheBenchmarkInputSize   The input size for the cache benchmark.
        -d, --benchmarkDuration         The duration of the benchmark in milliseconds.
        -h, --help                      Display this help message.
`

/**
 * The type definition for a benchmark function.
 */
type BenchmarkFunction = (cacheBenchmarkInputSize: number, benchmarkDuration: number) => void

/**
 * Benchmark routing.
 */
const benchmarks: { [key: string]: BenchmarkFunction } = {
	//
}

/**
 * Main function to route the benchmarks depending on the command line arguments.
 * @param args Arguments from the command line.
 */
function main(args: string[]) {
	const argv = minimist(args.slice(2))

	if (argv.help || argv.h) {
		cyGeneral.logger.info(helpMessage)
		process.exit(0)
	}

	cyGeneral.logger.info("Starting benchmark.")

	const argBenchmarkName = argv.benchmark || argv.b
	let argCacheBenchmarkInputSize = argv.cacheBenchmarkInputSize || argv.c
	let argBenchmarkDuration = argv.benchmarkDuration || argv.d

	if (!argCacheBenchmarkInputSize) {
		cyGeneral.logger.info(">> No cache benchmark input size provided, using default value of 128 bytes.")
		argCacheBenchmarkInputSize = 128
	}

	if (!argBenchmarkDuration) {
		cyGeneral.logger.info(">> No benchmark duration provided, using default value of 256 milliseconds.")
		argBenchmarkDuration = 256
	}

	console.info("")
	cyGeneral.logger.warn("This might take a while depending on the benchmark duration you chose.")
	cyGeneral.logger.warn("Please be patient and wait for the results to appear.")

	if (argBenchmarkName) {
		if (benchmarks[argBenchmarkName]) {
			console.info("")
			benchmarks[argBenchmarkName](argCacheBenchmarkInputSize, argBenchmarkDuration)
		} else {
			cyGeneral.logger.error(`Benchmark ${argBenchmarkName} not found.`)
			process.exit(1)
		}
	} else {
		cyGeneral.logger.info(">> No benchmark name provided, running all benchmarks..")

		for (const benchmarkName in benchmarks) {
			console.info("")
			benchmarks[benchmarkName](argCacheBenchmarkInputSize, argBenchmarkDuration)
		}
	}
}

main(process.argv)
