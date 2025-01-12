import { logger } from "@cybearl/cypack"
import executeCheckBenchmark from "@tests/benchmarks/check.bench"
import executeConvertBenchmark from "@tests/benchmarks/convert.bench"
import executeGeneralBenchmark from "@tests/benchmarks/general.bench"
import executeRandomBenchmark from "@tests/benchmarks/random.bench"
import executeReadBenchmark from "@tests/benchmarks/read.bench"
import executeStaticBenchmark from "@tests/benchmarks/static.bench"
import executeUtilityBenchmark from "@tests/benchmarks/utility.bench"
import executeWriteBenchmark from "@tests/benchmarks/write.bench"
import dedent from "dedent-js"
import minimist from "minimist"

/**
 * The help message.
 */
const helpMessage = dedent`
    Usage: yarn bench [options]

    Options:
        -b, --benchmark <name>          Run a specific benchmark.
        -i, --benchmarkInputSize   The input size for the CyBuffer benchmark.
        -d, --benchmarkDuration         The duration of the benchmark in milliseconds.
        -l, --list                      List all available benchmarks.
        -h, --help                      Display this help message.
`

/**
 * The type definition for a benchmark function.
 */
type BenchmarkFunction = (benchmarkInputSize: number, benchmarkDuration: number) => void

/**
 * Benchmark routing.
 */
const benchmarks: { [key: string]: BenchmarkFunction } = {
	general: executeGeneralBenchmark,
	static: executeStaticBenchmark,
	write: executeWriteBenchmark,
	read: executeReadBenchmark,
	convert: executeConvertBenchmark,
	check: executeCheckBenchmark,
	random: executeRandomBenchmark,
	utility: executeUtilityBenchmark,
}

/**
 * Main function to route the benchmarks depending on the command line arguments.
 * @param args Arguments from the command line.
 */
function main(args: string[]) {
	const argv = minimist(args.slice(2))

	if (argv.help || argv.h) {
		logger.info(helpMessage)
		process.exit(0)
	}

	if (argv.list || argv.l) {
		logger.info("Available benchmarks:")
		for (const benchmarkName in benchmarks) logger.info(`- ${benchmarkName}`)
		process.exit(0)
	}

	logger.info("Starting the CyBuffer benchmarking..")

	const argBenchmarkName = argv.benchmark || argv.b
	let argBenchmarkInputSize = argv.BenchmarkInputSize || argv.c
	let argBenchmarkDuration = argv.benchmarkDuration || argv.d

	if (argBenchmarkInputSize) {
		logger.info(`>> Using benchmark input size of ${argBenchmarkInputSize} bytes.`)
	} else {
		logger.info(">> No benchmark input size provided, using default value of 128 bytes.")
		argBenchmarkInputSize = 128
	}

	if (argBenchmarkDuration) {
		logger.info(`>> Using benchmark duration of ${argBenchmarkDuration} milliseconds.`)
	} else {
		logger.info(">> No benchmark duration provided, using default value of 256 milliseconds.")
		argBenchmarkDuration = 256
	}

	if (!argBenchmarkName) logger.info(">> No benchmark name provided, running all benchmarks..")

	console.info("")
	logger.warn("This might take a while depending on the benchmark duration you chose.")
	logger.warn("Please be patient and wait for the results to appear.")

	if (argBenchmarkName) {
		if (benchmarks[argBenchmarkName]) {
			benchmarks[argBenchmarkName](argBenchmarkInputSize, argBenchmarkDuration)
		} else {
			logger.error(`Benchmark ${argBenchmarkName} not found.`)
			process.exit(1)
		}
	} else {
		for (const benchmarkName in benchmarks) {
			benchmarks[benchmarkName](argBenchmarkInputSize, argBenchmarkDuration)
		}
	}
}

main(process.argv)
