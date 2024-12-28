import copyfiles from "copyfiles"
import { defineConfig } from "tsup"

export default defineConfig(options => ({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	minify: !options.watch,
	splitting: false,
	treeshake: true,
	sourcemap: true,
	clean: true,
	dts: true,
	onSuccess: async () => {
		console.info("\nIncluding miscellaneous files to dist:")

		copyfiles(["./package.json", "./dist"], () => null)
		console.info("> Copied package.json to dist")

		copyfiles(["./README.md", "./dist"], () => null)
		console.info("> Copied README.md to dist")

		copyfiles(["./LICENSE", "./dist"], () => null)
		console.info("> Copied LICENSE to dist")

		copyfiles(["./tsconfig.json", "./dist"], () => null)
		console.info("> Copied tsconfig.json to dist")

		copyfiles(["./src/biome-config.json", "./dist"], { up: 1 }, () => null)
		console.info("> Copied biome-config.json to dist")

		console.info("")
	},
}))
