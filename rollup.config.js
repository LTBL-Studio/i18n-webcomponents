import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from "@rollup/plugin-node-resolve";

const NAME = "i18n-webcomponents"

export default {
	input: 'src/index.ts',
	output: [
        {
            file: `dist/${NAME}.esm.js`,
            format: 'es',
            sourcemap: true
        },
        {
            name: "i18nWebcomponents",
            file: `dist/${NAME}.js`,
            format: 'iife',
            sourcemap: true
        }
    ],
    plugins: [
        commonjs({ extensions: ['.js', '.ts'] }),
        resolve({ browser: true }),
        typescript({
            compilerOptions: {
                module: "esnext",
                lib: ["es5", "es6", "es2020", "dom"],
                target: "es6"
            }
        })
    ]
};