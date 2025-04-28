import { $, component$, isServer, useSignal, useStore, useTask$ } from "@builder.io/qwik"
import { isAxiosError } from "axios"
import { shuffle } from "es-toolkit"
import { Vibrant } from "node-vibrant/browser"

import { spotifyApiFunctions } from "@/api"
import ActionFooter from "@/components/templates/ActionFooter"
import PlaylistGrid from "@/components/templates/PlaylistGrid"
import styles from "@/components/views/SelectorView.module.css"
import {
  PLAYLIST_COLOR_FALLBACK,
  SELECTED_PLAYLIST_ID_LIST_LOCAL_STORAGE_KEY,
  SPOTIFY_TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY
} from "@/constants"
import { isValidArray, isValidString } from "@/utils"

import type { SelectedPlaylistsState } from "@/types"
import type { PropsOf } from "@builder.io/qwik"

/** Props */
type Props = {
  /** アクセストークン */
  accessToken: string
}

export default component$(({ accessToken }: Props) => {
  const unresolvedSpotifyApi = spotifyApiFunctions(accessToken)
  const userName = useSignal("")
  const playlists = useStore<PropsOf<typeof PlaylistGrid>["playlists"]>([])
  const selectedPlaylistsState = useStore<SelectedPlaylistsState>([])

  /**
   * プレイリストカードを押下した時の処理
   *
   * @param index - インデックス
   */
  const handlePlaylistCardClick$ = $((playlistId: string): void => {
    const targetIndex = selectedPlaylistsState.findIndex(
      selectedPlaylist => selectedPlaylist.playlistId === playlistId
    )

    selectedPlaylistsState[targetIndex].isChecked = !selectedPlaylistsState[targetIndex].isChecked

    localStorage.setItem(
      SELECTED_PLAYLIST_ID_LIST_LOCAL_STORAGE_KEY,
      JSON.stringify(
        selectedPlaylistsState
          .filter(playlist => playlist.isChecked)
          .map(playlist => playlist.playlistId)
      )
    )
  })

  /** Enqueueボタンを押下した時の処理 */
  const handleEnqueueButtonClick$ = $(async (): Promise<void> => {
    const spotifyApi = await unresolvedSpotifyApi

    // 選択されているプレイリストIDの一覧を取得
    const checkedPlaylistIdList = selectedPlaylistsState
      .filter(playlist => playlist.isChecked)
      .map(playlist => playlist.playlistId)

    // 選択されているプレイリストに含まれている全ての楽曲のURIを取得
    const allTrackUriList = await Promise.all(
      checkedPlaylistIdList.map(playlistId => spotifyApi.getPlaylistTracks(playlistId))
    )

    // 取得した楽曲のURIをランダムに並べ替える
    const shuffledTrackUriList = shuffle(allTrackUriList.flatMap(trackUriList => trackUriList))

    // ランダムに並べ替えた楽曲のURIをセットした一時的なプレイリストを作成
    const { id: createdTemporaryPlaylistId, uri: createdTemporaryPlaylistUri } =
      await spotifyApi.createTemporaryPlaylistAndSetTracks(shuffledTrackUriList)

    localStorage.setItem(
      SPOTIFY_TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY,
      createdTemporaryPlaylistId
    )

    // 再生開始
    try {
      await spotifyApi.startPlaylistPlayback(createdTemporaryPlaylistUri)
    } catch (e) {
      if (!isAxiosError(e)) {
        throw e
      }

      if (e.response?.data.error.reason === "NO_ACTIVE_DEVICE") {
        alert("再生可能なデバイスが存在しません。Spotifyアプリを開いてください。")
      }
    }
  })

  /** Resetボタンを押下した時の処理 */
  const handleResetButtonClick$ = $(async (): Promise<void> => {
    Object.assign(
      selectedPlaylistsState,
      selectedPlaylistsState.map(playlist => ({
        playlistId: playlist.playlistId,
        isChecked: false
      }))
    )

    localStorage.removeItem(SELECTED_PLAYLIST_ID_LIST_LOCAL_STORAGE_KEY)

    const temporaryPlaylistId = localStorage.getItem(
      SPOTIFY_TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY
    )

    if (!isValidString(temporaryPlaylistId)) {
      return
    }

    localStorage.removeItem(SPOTIFY_TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY)

    const spotifyApi = await unresolvedSpotifyApi
    await spotifyApi.deletePlaylist(temporaryPlaylistId)
  })

  useTask$(async () => {
    if (isServer) {
      return
    }

    const spotifyApi = await unresolvedSpotifyApi

    const userNameResponse = await spotifyApi.getUserName()
    userName.value = userNameResponse

    const userPlaylists = await spotifyApi.getUserPlaylists()
    const playlistsWithThemeColor = await Promise.all(
      userPlaylists.map(async playlist => {
        const palette = await Vibrant.from(playlist.thumbnail).getPalette()
        const vibrantColor = palette.Vibrant?.hex
        return {
          ...playlist,
          themeColor: vibrantColor ?? PLAYLIST_COLOR_FALLBACK
        }
      })
    )

    Object.assign(playlists, playlistsWithThemeColor)

    const checkedPlaylistIdListFromLocalStorage = localStorage.getItem(
      SELECTED_PLAYLIST_ID_LIST_LOCAL_STORAGE_KEY
    )

    const checkedPlaylistIdList = isValidString(checkedPlaylistIdListFromLocalStorage)
      ? (JSON.parse(checkedPlaylistIdListFromLocalStorage) as Array<string>)
      : []

    Object.assign(
      selectedPlaylistsState,
      playlistsWithThemeColor.map(playlist => ({
        playlistId: playlist.playlistId,
        isChecked:
          isValidArray(checkedPlaylistIdList) && checkedPlaylistIdList.includes(playlist.playlistId)
      }))
    )
  })

  return (
    <div class={styles.selectorView}>
      <div class={styles.header}>
        <div class={styles.version}>
          <img
            alt="InstantQueue Logo"
            height={16}
            src="https://placehold.jp/16x16.png"
            width={16}
          />
          <span class={styles.text}>InstantQueue v1.0.0</span>
        </div>
        <h1 class={styles.title}>
          Welcome back,
          <br />
          {userName.value} !
        </h1>
      </div>

      <div class={styles.grid}>
        <PlaylistGrid
          onPlaylistCardClick$={handlePlaylistCardClick$}
          playlists={playlists}
          selectedPlaylistsStateStore={selectedPlaylistsState}
        />
      </div>

      <ActionFooter
        onEnqueueButtonClick$={handleEnqueueButtonClick$}
        onResetButtonClick$={handleResetButtonClick$}
      />
    </div>
  )
})
