<div align="center">
  <img src="https://hentairead.com/favicon.ico" />
  <h1>hentairead-cli</h1>
</div>

# About
hentairead-cli is a way to quickly download and read hentai, from your terminal.

# Usage
## Installation
In order to install hentairead-cli, you must have nodejs and npm installed.
```bash
$ npm i -g hentairead-cli
```

## Commands
```console
Usage: hentai [options] [command]

CLI tool to quickly interact with hentairead.com

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  config [options]           See and set your configuration
  download <string>          Download a doujin locally
  info <string>              Get the info for a doujin
  search [options] <string>  Search for a doujin
  view <string>              View a doujin locally
  help [command]             display help for command
```

## Example
```bash
$ hentai search neko
$ hentai info nekomimi-chan-wa-toroketai
$ hentai download nekomimi-chan-wa-toroketai
$ hentai view ./nekomimi-chan-wa-toroketai/0.jpg
```

## Configuration
hentairead-cli comes with a ``settings.json`` file used for customizing the output. Currently, there are a few valid options that will affect hentairead-cli.

### Options
| Option       | Description                                                                                                                                                                                   | Value                  |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| showImage    | Whether or not to show a low resolution image in the terminal. Triggers after running the info or search command. Note that if you use iTerm, the image will be displayed in full resolution. | true / false           |
| discordRpc   | Whether or not to enable Discord rich presence after running the ``view`` command.                                                                                                            | true / false           |
| discordRpcID | ID of the Discord application used for rich presence.                                                                                                                                         | Discord application ID |

### Example ``settings.json`` file
```json
{
  "showImage": "true",
  "discordRpc": "true",
  "discordRpcID": "1197355953650143322"
}
```

# License
[MIT](https://github.com/FireStreaker2/hentairead-cli/blob/main/README.md)
