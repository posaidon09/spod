import ffmpeg from 'fluent-ffmpeg';
import getPlaylist from "./playlist.js";
import ytdl from "@distube/ytdl-core";
import yts from "yt-search";
import chalk from "chalk";
import path from "path";
import ffmetadata from "ffmetadata";
import fs from "fs";
import readline from "readline";

let songs = [];

export default async function Download(id, dir, ext) {
    if (id != null) {
        let tracks = await getPlaylist(id, dir, ext);
        await populateSongs(tracks, dir, ext);
    } else {
        console.log(chalk.greenBright("Done fetching playlist!\nDownloading songs.\n"));
        await downloadSongsSequentially(dir, ext);
        console.log(chalk.greenBright("Finished downloading playlist!"));
    }
}

async function DownloadSong(song, dir, ext) {
    const output = path.join(`${dir}`, `${song.name.replace(/\//g, " ")}.${ext}`);

    if (fs.existsSync(output)) {
        if (fs.statSync(output).size <= 1024 * 500) {
            fs.unlinkSync(output);
            return await DownloadSong(song, dir, ext);
        } else {
            console.log(chalk.yellow("Song already exists. Skipping to next song.\n"));
            return Promise.resolve();
        }
    } else {
        return new Promise(async (resolve, reject) => {
            console.log(`${chalk.green("Starting download for:")} ${song.name}\n`);
            const res = await yts(`${song.name} - ${song.artist}`);
            const url = res.videos[song.index].url;
            try {
                const video = ytdl(url, {
                    filter: "audioonly",
                });
                let starttime;

                video.pipe(fs.createWriteStream(output));
                video.once('response', () => {
                    starttime = Date.now();
                });
                video.on('progress', (chunkLength, downloaded, total) => {
                    const percent = downloaded / total;
                    const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                    const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write(`${chalk.yellow((percent * 100).toFixed(2) + "%")} ${chalk.green("downloaded")} `);
                    process.stdout.write(`(${chalk.yellow((downloaded / 1024 / 1024).toFixed(2) + "MB")} of ${chalk.green((total / 1024 / 1024).toFixed(2) + "MB")})\n`);
                    process.stdout.write(`running for: ${chalk.yellow(downloadedMinutes.toFixed(2))} minutes`);
                    process.stdout.write(`, ${chalk.yellow(`estimated time left: ${estimatedDownloadTime.toFixed(2)} minutes`)} `);
                    readline.moveCursor(process.stdout, 0, -1);
            });
                video.on('end', async () => {
                    process.stdout.write('\n\n');
                    const tempOutput = path.join(path.dirname(output), `${path.basename(output, path.extname(output))}-temp.${ext}`);
        
                    try {
                        console.log(chalk.green(`Converting file to ${ext}.`));
                        await convertToMp3(output, tempOutput, ext);
                        fs.renameSync(tempOutput, output);

                        const data = {
                            artist: song.artist,
                            album: song.album || 'Unknown Album',
                            title: song.name
                        };
                        ffmetadata.write(output, data, (err) => {
                            if (err) {
                                console.error(`Error writing metadata for ${song.name}: ${err}`);
                            }
                            console.log(chalk.green("Successfully wrote metadata to file!"));
                            console.log(`${chalk.greenBright("Finished download for:")} ${song.name}!\n`);
                            resolve();
                        });
                    } catch (err) {
                        console.error(`Error converting ${song.name} to ${ext}: ${err}`);
                        resolve();
                    }
                });
        } catch (e) {
                    console.error(`${chalk.red("Error downloading")} ${song.name}: ${e.message}\n`);
                    const obj = {
                        name: song.name,
                        artist: song.artist,
                        index: e.message.includes("Sign in") ? song.index + 1 : song.index
                    };
                    console.log(e.message.includes("Sign in") ? chalk.red("Song is age restricted. Downloading next result.\n") : chalk.red("Error downloading song. Redownloading"));
                    return await DownloadSong(obj, dir, ext).then(resolve).catch(reject);
   
                }
            });
        }
    }


async function populateSongs(playlist, dir, ext) {
    for (const track of playlist.items) {
        songs.push({ name: track.track.name, artist: track.track.artists[0].name, index: 0, album: track.track.album.name });
    }
    if (playlist.next) {
        let nextTracks = await getPlaylist(playlist.next);
        await populateSongs(nextTracks, dir, ext); 
    } else {
        await Download(null, dir, ext);
    }
}

async function downloadSongsSequentially(dir, ext) {
    for (let song of songs) {
        await DownloadSong(song, dir, ext);
    }
}

async function convertToMp3(input, output, ext) {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .toFormat(ext)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(output);
    });
}
