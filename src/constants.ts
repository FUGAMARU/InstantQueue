/** Spotify AppのClient ID */
export const SPOTIFY_CLIENT_ID = import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID

/** Spotify APIのトークン取得用エンドポイント */
export const SPOTIFY_API_ENDPOINT_TOKEN = "https://accounts.spotify.com/api/token"

/** Spotify APIの認証用エンドポイント */
export const SPOTIFY_API_ENDPOINT_AUTH = "https://accounts.spotify.com/authorize"

/** Spotify APIの要求スコープ */
export const SPOTIFY_API_SCOPES =
  "playlist-read-private playlist-read-collaborative user-read-email user-modify-playback-state"

/** PKCEの認証フローにてCodeVerifierをSessionStorageに保持しておく時のキー */
export const SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY = "code_verifier"

/** PKCEの認証フローにおけるcode受け取り用ページのURI */
export const SPOTIFY_PKCE_REDIRECT_URI = "https://local.dev:5173/pkce"
