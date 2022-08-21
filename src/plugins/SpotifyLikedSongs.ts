import http from "http";

import express from "express";
import axios from "axios";

import BasePlugin from "./BasePlugin";

/*
{
  added_at: '2019-06-05T17:14:19Z',
  track: {
    album: {
      album_type: 'album',
      artists: [Array],
      available_markets: [Array],
      external_urls: [Object],
      href: 'https://api.spotify.com/v1/albums/2wV7tAGfyPpbQtOpVW14Kn',
      id: '2wV7tAGfyPpbQtOpVW14Kn',
      images: [Array],
      name: 'Bleu noir',
      release_date: '2015-10-16',
      release_date_precision: 'day',
      total_tracks: 14,
      type: 'album',
      uri: 'spotify:album:2wV7tAGfyPpbQtOpVW14Kn'
    },
    artists: [ [Object] ],
    available_markets: [
      'AD', 'AE', 'AG', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ',
      'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BN',
      'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CG',
      'CH', 'CI', 'CL', 'CM', 'CO', 'CR', 'CV', 'CW', 'CY', 'CZ',
      'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ES',
      'FI', 'FJ', 'FM', 'FR', 'GA', 'GB', 'GD', 'GE', 'GH', 'GM',
      'GN', 'GQ', 'GR', 'GT', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT',
      'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IS', 'IT', 'JM', 'JO',
      'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KR', 'KW', 'KZ',
      'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV',
      ... 83 more items
    ],
    disc_number: 1,
    duration_ms: 211682,
    explicit: false,
    external_ids: { isrc: 'FRPJD1501007' },
    external_urls: {
      spotify: 'https://open.spotify.com/track/0ULb56QECCS6nEjzaVTRyM'
    },
    href: 'https://api.spotify.com/v1/tracks/0ULb56QECCS6nEjzaVTRyM',
    id: '0ULb56QECCS6nEjzaVTRyM',
    is_local: false,
    name: 'Bleu noir',
    popularity: 29,
    preview_url: 'https://p.scdn.co/mp3-preview/be659dab18d4bfdee0d3c36390866c897a8cdb1d?cid=YOUR_CLIENT_ID',
    track_number: 9,
    type: 'track',
    uri: 'spotify:track:0ULb56QECCS6nEjzaVTRyM'
  }
}
*/

type SpotifyTrack = any;

const CALLBACK_PORT = parseInt(process.env.SPOTIFY_CALLBACK_PORT, 10);
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const REDIRECT_ENDPOINT = "/spotify_callback";
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}${REDIRECT_ENDPOINT}`;
const SCOPE = "user-library-read";

const app = express();

function generateRandomString()
{
    const length = 16;
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++)
    {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
};

function generateAuthorizeURL(state: string): string
{
    const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: SCOPE,
        redirect_uri: REDIRECT_URI,
        state
    });
    return `https://accounts.spotify.com/authorize?${params}`;
}

function waitForCallback(): Promise<{ code: any, state: any}>
{
    return new Promise((resolve, reject) =>
    {
        let httpServer: http.Server;
        app.get(REDIRECT_ENDPOINT, (req, res) =>
        {
            resolve({
                code: req.query.code || null,
                state: req.query.state || null
            });

            res.end("<script>window.close()</script>");
            httpServer.close();
        })
        httpServer = app.listen(CALLBACK_PORT);
    });
}

async function getAccessToken(code: string): Promise<string>
{
    const url = "https://accounts.spotify.com/api/token";
    const authorization = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const body = new URLSearchParams({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
    });
    const response = await axios.post(url, body, {
        headers: {
            Authorization: `Basic ${authorization}`
        }
    });
    return response.data.access_token;
}

// https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-saved-tracks
async function getUsersSavedTracks(accessToken: string): Promise<Array<SpotifyTrack>>
{
    const MAX_LIMIT = 50;
    let tracks: Array<SpotifyTrack> = [];
    let url = `https://api.spotify.com/v1/me/tracks?limit=${MAX_LIMIT}`;

    while (url !== null)
    {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const { next, items } = response.data;

        // Keep only useful fields
        const formattedTracks = items.map((item: any) => {
            console.log(item);
            delete item.track.available_markets;
            delete item.track.album.available_markets;
            delete item.track.album.images;
            return item;
        });
        tracks = [...tracks, ...formattedTracks];
        url = next;
    }

    return tracks;
}

export class SpotifyLikedSongs extends BasePlugin
{
    protected readonly _name: string = "Spotify Liked Songs";
    protected readonly _description: string = "Manages the save of the Spotify liked songs";
    protected readonly _directory: string = "spotify-liked-songs";

    public async execute(): Promise<void>
    {
        const state: string = generateRandomString();
        const authorizeURL: string = generateAuthorizeURL(state);
        this._log(authorizeURL);
        const callbackResult = await waitForCallback();
        if (callbackResult.state === null || callbackResult.state !== state)
        {
            return this._log("Error : state_mismatch");
        }
        try
        {
            const accessToken = await getAccessToken(callbackResult.code);
            const tracks = await getUsersSavedTracks(accessToken);
            await this._writeFileUTF8("tracks.json", JSON.stringify(tracks));
            this._log(`${tracks.length} tracks saved`);
        }
        catch (error)
        {
            this._log(error as any);
        }
    }

    public getStatus(): boolean
    {
        return false;
    }
}
