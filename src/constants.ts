/**
 * @file 定数を定義するファイル
 */

/** Spotify AppのClient ID */
export const SPOTIFY_CLIENT_ID = import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID

/** Spotify APIの認証用エンドポイント */
export const SPOTIFY_API_ENDPOINT_AUTH = "https://accounts.spotify.com/authorize"

/** Spotify APIの要求スコープ */
export const SPOTIFY_API_SCOPES =
  "playlist-read-private playlist-read-collaborative user-read-email user-modify-playback-state"

/** PKCEの認証フローにてCodeVerifierをSessionStorageに保持しておく時のキー */
export const SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY = "code_verifier"

/** PKCEの認証フローにおけるcode受け取り用ページのURI (TODO: 環境変数化) */
export const SPOTIFY_PKCE_REDIRECT_URI = "https://local.dev:5173/pkce"

/** Spotify APIのリフレッシュトークンをLocalStorageに保存しておく時のキー (アクセストークンはInMemory) */
export const SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY = "refresh_token"

/** Spotify APIからユーザー名を取得できなかった時のフォールバックユーザー名 */
export const SPOTIFY_USERNAME_FALLBACK = "User"

/** プレイリストのサムネイルからテーマカラーを取得できなかった時のフォールバック色 */
export const PLAYLIST_COLOR_FALLBACK = "#212121"
