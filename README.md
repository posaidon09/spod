# Spod
 A poorly written Spotify playlist downloader

## usage
```bash
spod <playlist id> <download directory> <file extension>
```
for example:
```bash
spod 0Ao9ZoGttBb7TUrieOKg1L ~/Music mp3
```

## installation
 after cloning the repo go to the Spod directory and run `npm install` and after that's done run `npm i -g` (note: you might have to use sudo if you're on linux)
 once the installation is done you'll need to create a [spotify app](https://developer.spotify.com/dashboard) and copy the client id and secret from it. after that create a file called `.env` in the Spod directory and copy the contents of `.env.template` into it then paste the id and secret you got the from app into the 2 fields in `.env`
