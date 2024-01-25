#!/usr/bin/env node
import fs from "fs";
import fetch from "node-fetch";
import HentaiRead from "hentairead-js";
import { program } from "commander";
import { Client } from "discord-rpc";
import progress from "cli-progress";
import chalk from "chalk";
import terminalImage from "terminal-image";
import open from "open";

program
	.name("hentai")
	.description("CLI tool to quickly interact with hentairead.com")
	.version("1.0.0");

program
	.command("config")
	.description("See and set your configuration")
	.option("-k, --key <string>", "Key to edit")
	.option("-v, --value <string>", "New value")
	.action((options) => {
		const data = fs.readFileSync(
			new URL("./settings.json", import.meta.url),
			"utf-8"
		);
		const settings = JSON.parse(data);

		if (options.key && options.value) {
			settings[options.key] = options.value;
			fs.writeFileSync(
				new URL("./settings.json", import.meta.url),
				JSON.stringify(settings, null, 2),
				"utf-8"
			);

			console.log(
				`Succesfully updated ${chalk.bold(options.key)} to value ${chalk.bold(
					options.value
				)}`
			);
		} else {
			console.log(settings);
		}
	});

program
	.command("download")
	.description("Download a doujin locally")
	.argument("<string>", "doujin to search for")
	.action(async (doujin) => {
		const data = await HentaiRead.getPages(doujin);

		console.log(`Now downloading: ${chalk.bold(doujin)}`);

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

		console.log(chalk.bold(data.name));
		console.log(data.alt);
		console.log(
			`Rating: ${data.rating}\nPages: ${data.pages}\nViews: ${data.views}`
		);
		console.log(`Tags: ${data.tags.join(", ")}`);
		console.log(`Language: ${data.language}\nGenre: ${data.genre}`);

		const settingsData = fs.readFileSync(
			new URL("./settings.json", import.meta.url),
			"utf-8"
		);
		const settings = JSON.parse(settingsData);
		if (settings.showImage === "true")
			console.log(await terminalImage.buffer(Object.values(data.images)[0]));
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

		const settingsData = fs.readFileSync(
			new URL("./settings.json", import.meta.url),
			"utf-8"
		);
		const settings = JSON.parse(settingsData);

		for (let i = 0; i < data.length; i++) {
			const doujin = data[i];

			console.log(
				`[${i}] ${chalk.bold(
					doujin.href.split("/hentai/")[1].replace("/", "")
				)} (${doujin.views} Views)`
			);

			if (settings.showImage === "true")
				console.log(
					await terminalImage.buffer(Object.values(doujin.images)[0])
				);
		}
	});

program
	.command("view")
	.description("View a doujin locally")
	.argument("<string>", "doujin to view")
	.action(async (doujin) => {
		const settingsData = fs.readFileSync(
			new URL("./settings.json", import.meta.url),
			"utf-8"
		);
		const settings = JSON.parse(settingsData);

		let rpc;

		if (settings.discordRpc === "true") {
			rpc = new Client({ transport: "ipc" });

			await rpc.login({ clientId: settings.discordRpcID });

			await rpc.setActivity({
				details: `Reading ${doujin.split("/").slice(-2, -1)[0]}`,
				startTimestamp: Date.now(),
				largeImageKey: "logo",
				instance: false,
			});
		}

		await open(doujin, { wait: true });

		if (settings.discordRpc === "true") rpc.destroy();
	});

program.parse();
