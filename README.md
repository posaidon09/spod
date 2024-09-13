# Spod
 A poorly written Spotify playlist downloader

## Usage
```bash
spod <playlist id> <download directory> <file extension>
```
for example:
```bash
spod 0Ao9ZoGttBb7TUrieOKg1L ~/Music mp3
```

## Installation
### Clone the repo
 ```bash
 git clone https://github.com/posaidon09/spod
 ```
### Install the packages
 ```bash
 npm install
 ```
### Setup the CLI (you may have to use sudo if you're on linux)
 ```bash
 npm i -g
 ```
### Create a [spotify app](https://developer.spotify.com/dashboard) 
make sure to select `Web API` in the creation options. after that go the app's settings and copy the Client ID and Secret

### Create env file
after you copy the Client ID and Secret go back to the spod folder and create a file named `.env` and type this in it
```env
SPOTIFY_ID=# your app id
SPOTIFY_SECRET=# your app secret
```
