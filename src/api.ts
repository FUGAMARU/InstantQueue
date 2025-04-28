/**
 * @file APIに関連する定数や関数を定義するファイル
 */

import { $ } from "@builder.io/qwik"
import axios from "axios"

import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_PKCE_REDIRECT_URI,
  SPOTIFY_TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY,
  SPOTIFY_TEMPORARY_PLAYLIST_NAME,
  SPOTIFY_USERNAME_FALLBACK
} from "@/constants"
import { isDefined, isValidString } from "@/utils"

import type { Playlist } from "@/types"

/** Spotify APIの操作用関数群 */
type SpotifyApiFunctions = {
  /** ユーザーのプレイリスト一覧を取得する */
  getUserPlaylists: () => Promise<Array<Omit<Playlist, "themeColor">>>
  /** ユーザー名を取得する */
  getUserName: () => Promise<string>
  /** プレイリストに含まれる楽曲のURI一覧を取得する */
  getPlaylistTracks: (playlistId: string) => Promise<Array<string>>
  /** プレイリストを作成し、楽曲をセットする */
  createTemporaryPlaylistAndSetTracks: (trackUriList: Array<string>) => Promise<{
    /** プレイリストID */
    id: string
    /** プレイリストURI */
    uri: string
  }>
  /** プレイリストの再生を開始する */
  startPlaylistPlayback: (playlistUri: string) => Promise<void>
  /** プレイリストを削除する */
  deletePlaylist: (playlistId: string) => Promise<void>
}

/** アカウント系Spotify APIの操作用関数群 */
type SpotifyAccountsApiFunctions = {
  /** アクセストークンを取得する */
  getAccessToken: (code: string, codeVerifier: string) => Promise<AccessTokenInfo>
  /** アクセストークンをリフレッシュする */
  refreshAccessToken: (refreshToken: string) => Promise<AccessTokenInfo>
}

/** アクセストークン情報 */
type AccessTokenInfo = {
  /** アクセストークン */
  accessToken: string
  /** リフレッシュトークン */
  refreshToken: string
}

/**
 * Spotify APIの操作用関数群
 *
 * @param accessToken - アクセストークン
 * @returns Spotify APIアクセス用の関数群
 */
export const spotifyApiFunctions = $((accessToken: string): SpotifyApiFunctions => {
  const api = axios.create({
    baseURL: "https://api.spotify.com/v1",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  /**
   * ユーザーのプレイリスト一覧を取得する
   *
   * @returns プレイリスト一覧
   */
  const getUserPlaylists = async (): Promise<Array<Omit<Playlist, "themeColor">>> => {
    const playlists: Array<Omit<Playlist, "themeColor">> = []
    let nextUrl =
      "https://api.spotify.com/v1/me/playlists?limit=50&fields=items(id,name,images),next"

    // 再帰関数よりwhileループの方が見通しが良い…
    while (isValidString(nextUrl)) {
      const { data } = await axios.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

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

    const temporaryPlaylistId = localStorage.getItem(
      SPOTIFY_TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY
    )

    return isValidString(temporaryPlaylistId)
      ? playlists.filter(playlist => playlist.playlistId !== temporaryPlaylistId)
      : playlists
  }

  /**
   * ユーザー名を取得する
   *
   * @returns ユーザー名
   */
  const getUserName = async (): Promise<string> => {
    const { data } = await api.get<SpotifyApi.CurrentUsersProfileResponse>("/me")

    return data.display_name ?? SPOTIFY_USERNAME_FALLBACK
  }

  const getPlaylistTracks = $(async (playlistId: string): Promise<Array<string>> => {
    const trackUris: Array<string> = []
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(track.uri),next`

    // 再帰関数よりwhileループの方が見通しが良い…
    while (isValidString(nextUrl)) {
      const { data } = await axios.get<SpotifyApi.PlaylistTrackResponse>(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      trackUris.push(...data.items.map(item => item.track?.uri ?? ""))

      if (!isValidString(data.next)) {
        break
      }

      nextUrl = data.next
    }

    return trackUris.filter(isValidString)
  })

  /**
   * 一時的なプレイリストを作成し、楽曲をセットする
   *
   * @param trackUriList - セットする楽曲のURI一覧
   * @returns プレイリストIDとURI
   */
  const createTemporaryPlaylistAndSetTracks = async (
    trackUriList: Array<string>
  ): Promise<{
    /** プレイリストID */
    id: string
    /** プレイリストURI */
    uri: string
  }> => {
    const temporaryPlaylistId = localStorage.getItem(
      SPOTIFY_TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY
    )

    // 一時的なプレイリストが存在する場合は削除しておく
    if (isValidString(temporaryPlaylistId)) {
      await deletePlaylist(temporaryPlaylistId)
      localStorage.removeItem(SPOTIFY_TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY)
    }

    const { data: playlistData } = await api.post<SpotifyApi.CreatePlaylistResponse>(
      "/me/playlists",
      {
        name: SPOTIFY_TEMPORARY_PLAYLIST_NAME,
        public: false
      }
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
        api.post<SpotifyApi.PlaylistSnapshotResponse>(`/playlists/${id}/tracks`, {
          uris: chunk
        })
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
   * @param playlistUri - プレイリストURI
   */
  const startPlaylistPlayback = async (playlistUri: string): Promise<void> => {
    await api.put("/me/player/play", { context_uri: playlistUri })
  }

  /**
   * プレイリストを削除する
   *
   * @param playlistId - プレイリストID
   */
  const deletePlaylist = async (playlistId: string): Promise<void> => {
    await api.delete(`/playlists/${playlistId}/followers`)
  }

  return {
    getUserPlaylists,
    getUserName,
    getPlaylistTracks,
    createTemporaryPlaylistAndSetTracks,
    startPlaylistPlayback,
    deletePlaylist
  }
})

export const spotifyAccountsApiFunctions = $((): SpotifyAccountsApiFunctions => {
  const api = axios.create({
    baseURL: "https://accounts.spotify.com/api",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })

  /**
   * codeからトークン情報を取得する
   *
   * @param code - 認可コード
   * @param codeVerifier - PKCEのcode_verifier
   * @returns アクセストークン、アクセストークンの有効期限、リフレッシュトークン
   */
  const getAccessToken = async (code: string, codeVerifier: string): Promise<AccessTokenInfo> => {
    const { data } = await api.post(
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
  const refreshAccessToken = async (refreshToken: string): Promise<AccessTokenInfo> => {
    const { data } = await api.post(
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

  return {
    getAccessToken,
    refreshAccessToken
  }
})
