#!/usr/bin/env node

import process from 'process';
process.removeAllListeners('warning');
import Download from './download.js';
import { Command } from 'commander';

const program = new Command()

program
.name('spod')
.description('A CLI spotify playlist downloader.')
.action(Download)
.argument("<id>", "spotify playlist ID")
.argument("<directory>", "folder to download the songs in")
.argument("<extension", "extension to download the songs in")
.action((id, directory, ext) => {
    Download(id, directory, ext);
})
.version('1.0.0');

program.parse();
