import axios from "axios"

/** API接続する時に使用するAxiosのインスタンス */
export const spotifyApi = axios.create({
  baseURL: "https://accounts.spotify.com/api",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
})
