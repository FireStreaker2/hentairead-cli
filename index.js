#!/usr/bin/env node
import fs from "fs";
import fetch from "node-fetch";
import { program } from "commander";
import HentaiRead from "hentairead-js";
import progress from "cli-progress";
import chalk from "chalk";

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

		const bar = new progress.SingleBar({}, progress.Presets.shades_classic);
		bar.start(data.length, 0);

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

			bar.increment();
		}

		bar.stop();
		console.log(
			`Succesfully downloaded ${chalk.red(
				data.length
			)} pages. Now available at ${chalk.bold(`./${doujin}`)}`
		);
	});

program
	.command("info")
	.description("Get the info for a doujin")
	.argument("<string>", "doujin to search for")
	.action(async (doujin) => {
		const data = await HentaiRead.getInfo(doujin);

		console.log(data);
	});

program
	.command("search")
	.description("Search for a doujin")
	.argument("<string>", "doujin to search for")
	.option("--page <number>")
	.action(async (doujin, options) => {
		const data = await HentaiRead.search({
			s: doujin,
			page: options.page ?? 1,
		});

		console.log(
			`Results for ${chalk.bold(doujin)}: page ${chalk.bold(options.page ?? 1)}`
		);

		for (let i = 0; i < data.length; i++) {
			const doujin = data[i];

			console.log(
				`[${i}] ${chalk.bold(
					doujin.href.split("/hentai/")[1].replace("/", "")
				)} (${doujin.views} Views)`
			);
		}
	});

program.parse();
