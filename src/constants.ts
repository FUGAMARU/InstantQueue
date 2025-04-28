/**
 * @file 定数を定義するファイル
 */

/** Spotify関連の定数 */
export const SPOTIFY = {
  /** SpotifyのクライアントID */
  CLIENT_ID: import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID,
  /** Spotifyの認証エンドポイント */
  API_ENDPOINT_AUTH: "https://accounts.spotify.com/authorize",
  /** Spotify APIのスコープ */
  API_SCOPES:
    "playlist-read-private playlist-modify-private playlist-read-collaborative user-read-email user-read-playback-state user-modify-playback-state",
  /** PKCEのリダイレクトURI */
  PKCE_REDIRECT_URI: "https://local.dev:5173/pkce",
  /** 一時的なプレイリストの名前 */
  TEMPORARY_PLAYLIST_NAME: "InstantQueue Temporary Playlist",
  /** ユーザー名のフォールバック */
  USERNAME_FALLBACK: "User"
} as const

/** WebStorage関連の定数 */
export const WEB_STORAGE = {
  /** PKCEのコード検証用キー */
  PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY: "code_verifier",
  /** リフレッシュトークン */
  REFRESH_TOKEN_LOCAL_STORAGE_KEY: "refresh_token",
  /** 一時的なプレイリストID */
  TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY: "temporary_playlist_id",
  /** 選択されたプレイリストID一覧 */
  SELECTED_PLAYLIST_ID_LIST_LOCAL_STORAGE_KEY: "selected_playlist_id_list"
} as const

/** プレイリストのテーマカラーを取得できなかった時のフォールバックカラー */
export const PLAYLIST_COLOR_FALLBACK = "#212121"

/** 再生不可能な状態で再生開始しようとした時に表示するアラートメッセージ */
export const PLAYBACK_STATE_ALERT_MESSAGE =
  "No playable devices found. Please open the Spotify app."
