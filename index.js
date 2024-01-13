#! /usr/bin/env node
import HentaiRead from "hentairead-js";
import chalk from "chalk";
import { program } from "commander";
import fs from "fs";
import fetch from "node-fetch";

program
	.name("hentai")
	.description("CLI tool to quickly interact with hentairead.com")
	.version("1.0.0");

program
	.command("download")
	.description("Download a doujin locally")
	.argument("<string>", "doujin to search for")
	.action(async (doujin) => {
		const data = await HentaiRead.getPages(doujin);

		for (let i = 0; i < data.length; i++) {
			const image = data[i];
			const response = await fetch(image);

			if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

			await fs.promises.mkdir(`./${doujin}`, { recursive: true });

			const buffer = await response.arrayBuffer();
			await fs.promises.writeFile(
				`./${doujin}/${i}.${image.substring(
					image.lastIndexOf(".") + 1,
					image.lastIndexOf("?")
				)}`,
				new Uint8Array(buffer)
			);

			console.log(`Downloaded image ${chalk.red(i + 1)} of ${data.length}`);
		}
	});

program
	.command("info")
	.description("Get the info for a doujin")
	.argument("<string>", "doujin to search for")
	.action(async (doujin) => {
		const data = await HentaiRead.getInfo(doujin);
		console.log(data);
	});

program.parse();
