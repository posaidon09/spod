 import axios from 'axios';
import qs from 'qs';
import 'dotenv/config';

const client_id = process.env.SPOTIFY_ID // Your client id
const client_secret = process.env.SPOTIFY_SECRET // Your secret
const auth_token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');

async function getAuth() {
  try{
    //make post request to SPOTIFY API for access token, sending relavent info
    const token_url = 'https://accounts.spotify.com/api/token';
    const data = qs.stringify({'grant_type':'client_credentials'});

    const response = await axios.post(token_url, data, {
      headers: { 
        'Authorization': `Basic ${auth_token}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      }
    })
    return response.data.access_token;
  }catch(error){
    console.log(error);
  }
}

export default async function getPlaylist(playlist) {
    const token = await getAuth();
    let res;
    if (!playlist.includes("https")) {
        res = await axios.get(`https://api.spotify.com/v1/playlists/${playlist}/tracks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
    } else {
        res = await axios.get(playlist, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
    }
    return res.data;
}
