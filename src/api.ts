/**
 * @file APIに関連する定数や関数を定義するファイル
 */

import axios from "axios"

import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_PKCE_REDIRECT_URI,
  SPOTIFY_TEMPORARY_PLAYLIST_NAME,
  SPOTIFY_USERNAME_FALLBACK
} from "@/constants"
import { isDefined, isValidString } from "@/utils"

import type { Playlist } from "@/types"

/** Spotifyのアカウント系API接続する時に使用するAxiosのインスタンス */
const spotifyAccountsApi = axios.create({
  baseURL: "https://accounts.spotify.com/api",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
})

/** SpotifyのAPIに接続する時に使用するAxiosのインスタンス */
const spotifyApi = axios.create({
  baseURL: "https://api.spotify.com/v1"
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
  const { data } = await spotifyAccountsApi.post(
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
  const { data } = await spotifyAccountsApi.post(
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
  const playlists: Array<Omit<Playlist, "themeColor">> = []
  let nextUrl = "https://api.spotify.com/v1/me/playlists?limit=50&fields=items(id,name,images),next"

  // 再帰関数よりwhileループの方が見通しが良い…
  while (isValidString(nextUrl)) {
    const { data } = await axios.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
      nextUrl,
      getBearerTokenHeader(accessToken)
    )

    playlists.push(
      ...data.items.map(item => ({
        playlistId: item.id,
        name: item.name,
        thumbnail: item.images[0]?.url ?? ""
      }))
    )

    if (!isValidString(data.next)) {
      break
    }

    nextUrl = data.next
  }

  return playlists
}

/**
 * アカウントのユーザー名を取得する
 *
 * @param accessToken - アクセストークン
 * @returns ユーザー名
 */
export const getUserName = async (accessToken: string): Promise<string> => {
  const { data } = await spotifyApi.get<SpotifyApi.CurrentUsersProfileResponse>(
    "/me",
    getBearerTokenHeader(accessToken)
  )

  return data.display_name ?? SPOTIFY_USERNAME_FALLBACK
}

/**
 * プレイリストに含まれる楽曲のURI一覧を取得する
 *
 * @param accessToken - アクセストークン
 * @param playlistId - プレイリストID
 * @returns プレイリストに含まれる楽曲のURI一覧
 */
export const getPlaylistTracks = async (
  accessToken: string,
  playlistId: string
): Promise<Array<string>> => {
  const trackUris: Array<string> = []
  let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(track.uri),next`

  // 再帰関数よりwhileループの方が見通しが良い…
  while (isValidString(nextUrl)) {
    const { data } = await axios.get<SpotifyApi.PlaylistTrackResponse>(
      nextUrl,
      getBearerTokenHeader(accessToken)
    )

    trackUris.push(...data.items.map(item => item.track?.uri ?? ""))

    if (!isValidString(data.next)) {
      break
    }

    nextUrl = data.next
  }

  return trackUris.filter(isValidString)
}

/**
 * InstantQueue用の臨時プレイリストを作成し、曲をセットする
 *
 * @param accessToken - アクセストークン
 * @param trackUriList - 曲のURI一覧
 * @returns 作成したプレイリストのURI
 */
export const createTemporaryPlaylistAndSetTracks = async (
  accessToken: string,
  trackUriList: Array<string>
): Promise<{
  /** プレイリストID */
  id: string
  /** プレイリストURI */
  uri: string
}> => {
  const { data: playlistData } = await spotifyApi.post<SpotifyApi.CreatePlaylistResponse>(
    "/me/playlists",
    {
      name: SPOTIFY_TEMPORARY_PLAYLIST_NAME,
      public: false
    },
    getBearerTokenHeader(accessToken)
  )

  const { id, uri } = playlistData

  // ローカルファイルを除外
  const localFileExcludedTrackUriList = trackUriList.filter(
    trackUri => !trackUri.startsWith("spotify:local:")
  )

  // Spotify APIの制限により1回のリクエストで100曲までしか追加できないので、100曲ごとに分割する
  const chunkedTrackUriList = localFileExcludedTrackUriList.reduce<Array<Array<string>>>(
    (resultArray, item, index) => {
      const chunkIndex = Math.floor(index / 100)
      if (!isDefined(resultArray[chunkIndex])) {
        resultArray[chunkIndex] = []
      }
      resultArray[chunkIndex].push(item)
      return resultArray
    },
    []
  )

  await Promise.all(
    chunkedTrackUriList.map(chunk =>
      spotifyApi.post<SpotifyApi.PlaylistSnapshotResponse>(
        `/playlists/${id}/tracks`,
        { uris: chunk },
        getBearerTokenHeader(accessToken)
      )
    )
  )

  return {
    id,
    uri
  }
}

/**
 * プレイリストの再生を開始する
 *
 * @param accessToken - アクセストークン
 * @param playlistUri - プレイリストURI
 */
export const startPlaylistPlayback = async (
  accessToken: string,
  playlistUri: string
): Promise<void> => {
  await spotifyApi.put(
    "/me/player/play",
    { context_uri: playlistUri },
    getBearerTokenHeader(accessToken)
  )
}

/**
 * プレイリストを削除する
 *
 * @param accessToken - アクセストークン
 * @param playlistId - プレイリストID
 */
export const deletePlaylist = async (accessToken: string, playlistId: string): Promise<void> => {
  await spotifyApi.delete(`/playlists/${playlistId}/followers`, getBearerTokenHeader(accessToken))
}
