/**
 * @file APIに関連する定数や関数を定義するファイル
 */

import axios from "axios"

import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_PKCE_REDIRECT_URI,
  SPOTIFY_USERNAME_FALLBACK
} from "@/constants"

import type { Playlist } from "@/types"

/** API接続する時に使用するAxiosのインスタンス */
const spotifyApi = axios.create({
  baseURL: "https://accounts.spotify.com/api",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
})

/**
 * Bearerトークン付きのリクエストヘッダーを取得する
 *
 * @param accessToken - アクセストークン
 * @returns Bearerトークン付きのリクエストヘッダー
 */
const getBearerTokenHeader = (
  accessToken: string
): {
  /** リクエストヘッダー */
  headers: {
    /** Authorization */
    Authorization: string
  }
} => ({
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})

/** アクセストークン情報 */
type AccessTokenInfo = {
  /** アクセストークン */
  accessToken: string
  /** リフレッシュトークン */
  refreshToken: string
}

/**
 * codeからトークン情報を取得する
 *
 * @param code - 認可コード
 * @param codeVerifier - PKCEのcode_verifier
 * @returns アクセストークン、アクセストークンの有効期限、リフレッシュトークン
 */
export const getAccessToken = async (
  code: string,
  codeVerifier: string
): Promise<AccessTokenInfo> => {
  const { data } = await spotifyApi.post(
    "/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      client_id: SPOTIFY_CLIENT_ID,
      redirect_uri: SPOTIFY_PKCE_REDIRECT_URI // 使用はされないがcodeの取得時と完全に一致する必要がある
    })
  )

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  }
}

/**
 * アクセストークンをリフレッシュする
 *
 * @param refreshToken - リフレッシュトークン
 * @returns 新しいアクセストークン
 */
export const refreshAccessToken = async (refreshToken: string): Promise<AccessTokenInfo> => {
  const { data } = await spotifyApi.post(
    "/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID
    })
  )

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  }
}

/**
 * ユーザーのプレイリスト一覧を取得する
 *
 * @param accessToken - アクセストークン
 * @returns プレイリスト一覧
 */
export const getUserPlaylists = async (
  accessToken: string
): Promise<Array<Omit<Playlist, "themeColor">>> => {
  const { data } = await axios.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    getBearerTokenHeader(accessToken)
  )

  return data.items.map(item => ({
    playlistId: item.id,
    name: item.name,
    thumbnail: item.images[0]?.url ?? ""
  }))
}

/**
 * アカウントのユーザー名を取得する
 *
 * @param accessToken - アクセストークン
 * @returns ユーザー名
 */
export const getUserName = async (accessToken: string): Promise<string> => {
  const { data } = await axios.get<SpotifyApi.CurrentUsersProfileResponse>(
    "https://api.spotify.com/v1/me",
    getBearerTokenHeader(accessToken)
  )

  return data.display_name ?? SPOTIFY_USERNAME_FALLBACK
}
