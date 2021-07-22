#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");
const escapeGlob = require("glob-escape");

const outDir = "./[lua]";
const rootDir = "./src";

function ensureDirExists(filePath) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyFiles() {
	fg.sync(escapeGlob(rootDir) + "/**", { ignore: "**/*.ts" }).forEach((resourceFile) => {
		const outputFile = resourceFile.replace(rootDir, outDir);
		ensureDirExists(outputFile);
		fs.copyFileSync(resourceFile, outputFile);
	});
}

function getResourcesPath() {
	const resourcesMetaPath = fg.sync(escapeGlob(outDir) + "/**/meta.xml");
	return resourcesMetaPath
		.map((resourceMetaPath) => {
			const resourceDirName = path.dirname(resourceMetaPath).split("/").pop();
			if (resourceDirName.startsWith("[") && resourceDirName.endsWith("]")) return undefined;
			return path.dirname(resourceMetaPath.replace(outDir + "/", ""));
		})
		.filter((item) => !!item);
}

function checkResource(resourcePath) {
	const metaString = fs.readFileSync(path.join(resourcePath, "meta.xml"));
	fg.sync(escapeGlob(resourcePath) + "/**", { ignore: "**/meta.xml" }).forEach((resourceFile) => {
		if (metaString.indexOf(path.parse(resourceFile).base) === -1)
			console.warn(`[WARN] File "${path.parse(resourceFile).base}" does not exists in meta.xml`);
	});
}

copyFiles();
getResourcesPath().forEach((resourcePath) => {
	checkResource(path.join(outDir, resourcePath));
	console.log(`[INFO] Resource compiled at "${path.join(outDir, resourcePath)}".`);
});
