/**
 * @file 定数を定義するファイル
 */

/** Spotify関連の定数 */
export const SPOTIFY = {
  /** SpotifyのクライアントID */
  CLIENT_ID: import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID,
  /** PKCEのリダイレクトURI */
  PKCE_REDIRECT_URI: `${import.meta.env.PUBLIC_ORIGIN}/pkce`,
  /** Spotifyの認証エンドポイント */
  API_ENDPOINT_AUTH: "https://accounts.spotify.com/authorize",
  /** Spotify APIのスコープ */
  API_SCOPES:
    "playlist-read-private playlist-modify-private playlist-read-collaborative user-library-read user-read-email user-read-playback-state user-modify-playback-state",
  /** 一時的なプレイリストの名前 */
  TEMPORARY_PLAYLIST_NAME: "InstantQueue Temporary Playlist",
  /** ユーザー名のフォールバック */
  USERNAME_FALLBACK: "User",
  /** お気に入りの曲の仮想プレイリストID */
  LIKED_SONGS_PLAYLIST_ID: "liked-songs"
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

/** 要素関連の定数 */
export const ELEMENTS = {
  /** プレイリストのテーマカラーを取得できなかった時のフォールバックカラー */
  PLAYLIST_COLOR_FALLBACK: "#212121",
  /** お気に入りの曲のテーマカラー */
  LIKED_SONGS_COLOR: "#5e63cd",
  /** ボタンコンテンツのフェードアニメーションのDuration (ミリ秒) */
  BUTTON_CONTENTS_FADE_ANIMATION_DURATION: 400,
  /** ボタンコンテンツのフェードアニメーション後にチェックマークを表示しておく秒数 (ミリ秒) */
  BUTTON_CONTENTS_CHECK_MARK_DISPLAY_DURATION: 3000,
  /** マスコットキャラクターのフェードアニメーションのDuration (ミリ秒) */
  MASCOT_FADE_ANIMATION_DURATION: 1000,
  /** マスコットキャラクターのフェードアニメーションのDelay (ミリ秒) */
  MASCOT_FADE_ANIMATION_DELAY: 150
}

/** 再生不可能な状態で再生開始しようとした時に表示するアラートメッセージ */
export const PLAYBACK_STATE_ALERT_MESSAGE =
  "No playable devices found. Please open the Spotify app."
