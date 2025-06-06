import { $, component$, isServer, useSignal, useStore, useTask$ } from "@builder.io/qwik"
import { isAxiosError } from "axios"
import clsx from "clsx"
import { shuffle } from "es-toolkit"
import { Vibrant } from "node-vibrant/browser"

import { spotifyApiFunctions } from "@/api"
import Mascot from "@/components/parts/Mascot"
import PlaybackState from "@/components/parts/PlaybackState"
import ActionFooter from "@/components/templates/ActionFooter"
import PlaylistGrid from "@/components/templates/PlaylistGrid"
import styles from "@/components/views/SelectorView.module.css"
import { PLAYBACK_STATE_ALERT_MESSAGE, ELEMENTS, WEB_STORAGE, SPOTIFY } from "@/constants"
import { isValidArray, isValidString } from "@/utils"

import type { SelectedPlaylistsState } from "@/types"
import type { PropsOf } from "@builder.io/qwik"

/** Props */
type Props = {
  /** アクセストークン */
  accessToken: string
  /** 再生可能か */
  playbackState: PropsOf<typeof PlaybackState>["state"]
}

/**
 * SpotifyのAPIがレスポンスする自動生成されたプレイリストの画像をnode-vibrant用に取得しようとするとCORSエラーが発生するので、Viteのプロキシを利用して画像URLを取得する
 *
 * @param thumbnailUrl - プレイリストのサムネイルURL
 * @returns プロキシを通した画像URL
 */
const getProxiedThumbnailImageUrl = (thumbnailUrl: string): string => {
  const url = new URL(thumbnailUrl)

  if (url.host !== "mosaic.scdn.co") {
    return thumbnailUrl
  }

  return `/proxy/spotify${url.pathname}${url.search}`
}

export default component$(({ accessToken, playbackState }: Props) => {
  const unresolvedSpotifyApi = spotifyApiFunctions(accessToken)
  const userName = useSignal("")
  const playlists = useStore<PropsOf<typeof PlaylistGrid>["playlists"]>([])
  const selectedPlaylistsState = useStore<SelectedPlaylistsState>([])

  const enqueueButtonCheckMarkTrigger = useSignal<boolean | undefined>()
  const resetButtonCheckMarkTrigger = useSignal<boolean | undefined>()
  const isEnqueueButtonProcessing = useSignal(false)
  const isResetButtonProcessing = useSignal(false)

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
      WEB_STORAGE.SELECTED_PLAYLIST_ID_LIST_LOCAL_STORAGE_KEY,
      JSON.stringify(
        selectedPlaylistsState
          .filter(playlist => playlist.isChecked)
          .map(playlist => playlist.playlistId)
      )
    )
  })

  /** Enqueueボタンを押下した時の処理 */
  const handleEnqueueButtonClick$ = $(async (): Promise<void> => {
    try {
      isEnqueueButtonProcessing.value = true

      // 選択されているプレイリストIDの一覧を取得
      const checkedPlaylistIdList = selectedPlaylistsState
        .filter(playlist => playlist.isChecked)
        .map(playlist => playlist.playlistId)

      if (!isValidArray(checkedPlaylistIdList)) {
        alert("No playlists have been selected.")
        return
      }

      if (playbackState === "unable") {
        alert(PLAYBACK_STATE_ALERT_MESSAGE)
        return
      }

      const spotifyApi = await unresolvedSpotifyApi

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
        WEB_STORAGE.TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY,
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
          alert(PLAYBACK_STATE_ALERT_MESSAGE)
        }
      }

      // ボタンの中身をチェックマーク表示にする
      enqueueButtonCheckMarkTrigger.value = !(enqueueButtonCheckMarkTrigger.value ?? false)
    } finally {
      setTimeout(() => {
        isEnqueueButtonProcessing.value = false
      }, ELEMENTS.BUTTON_CONTENTS_FADE_ANIMATION_DURATION)
    }
  })

  /** Resetボタンを押下した時の処理 */
  const handleResetButtonClick$ = $(async (): Promise<void> => {
    try {
      isResetButtonProcessing.value = true

      Object.assign(
        selectedPlaylistsState,
        selectedPlaylistsState.map(playlist => ({
          playlistId: playlist.playlistId,
          isChecked: false
        }))
      )

      localStorage.removeItem(WEB_STORAGE.SELECTED_PLAYLIST_ID_LIST_LOCAL_STORAGE_KEY)

      const temporaryPlaylistId = localStorage.getItem(
        WEB_STORAGE.TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY
      )

      if (!isValidString(temporaryPlaylistId)) {
        return
      }

      localStorage.removeItem(WEB_STORAGE.TEMPORARY_PLAYLIST_ID_LOCAL_STORAGE_KEY)

      const spotifyApi = await unresolvedSpotifyApi
      await spotifyApi.deletePlaylist(temporaryPlaylistId)

      // ボタンの中身をチェックマーク表示にする
      resetButtonCheckMarkTrigger.value = !(resetButtonCheckMarkTrigger.value ?? false)
    } finally {
      setTimeout(() => {
        isResetButtonProcessing.value = false
      }, ELEMENTS.BUTTON_CONTENTS_FADE_ANIMATION_DURATION)
    }
  })

  useTask$(async () => {
    if (isServer) {
      return
    }

    const spotifyApi = await unresolvedSpotifyApi

    const userNameResponse = await spotifyApi.getUserName()
    userName.value = userNameResponse

    const userPlaylists = await spotifyApi.getUserPlaylists()
    const playlistPalettes = await Promise.all(
      userPlaylists.map(async playlist =>
        Vibrant.from(getProxiedThumbnailImageUrl(playlist.thumbnail)).getPalette()
      )
    )
    const playlistsWithThemeColor = playlistPalettes.map((palette, index) => {
      const vibrantColor = palette.Vibrant?.hex
      return {
        ...userPlaylists[index],
        themeColor: vibrantColor ?? ELEMENTS.PLAYLIST_COLOR_FALLBACK
      }
    })

    const playlistsWithLikedSongs = [
      {
        playlistId: SPOTIFY.LIKED_SONGS_PLAYLIST_ID,
        name: "Liked Songs",
        thumbnail: "", // 使用されないので空文字
        themeColor: ELEMENTS.LIKED_SONGS_COLOR
      },
      ...playlistsWithThemeColor
    ]

    Object.assign(playlists, playlistsWithLikedSongs)

    const checkedPlaylistIdListFromLocalStorage = localStorage.getItem(
      WEB_STORAGE.SELECTED_PLAYLIST_ID_LIST_LOCAL_STORAGE_KEY
    )

    const checkedPlaylistIdList = isValidString(checkedPlaylistIdListFromLocalStorage)
      ? (JSON.parse(checkedPlaylistIdListFromLocalStorage) as Array<string>)
      : []

    Object.assign(
      selectedPlaylistsState,
      playlistsWithLikedSongs.map(playlist => ({
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
          <img class={styles.logo} height={16} src="/logo.svg" width={16} />
          <span class={styles.text}>InstantQueue v1.0.0</span>
        </div>

        <h1 class={styles.title}>
          Welcome back,
          <br />
          {userName.value} !
        </h1>

        <PlaybackState state={playbackState} />

        <div class={clsx(styles.mascot, styles.displaySP)}>
          <Mascot />
        </div>
        <div class={clsx(styles.mascot, styles.displayPC)}>
          <Mascot isLarger />
        </div>
      </div>

      <div class={styles.grid}>
        <PlaylistGrid
          onPlaylistCardClick$={handlePlaylistCardClick$}
          playlists={playlists}
          selectedPlaylistsStateStore={selectedPlaylistsState}
        />
      </div>

      <ActionFooter
        enqueueButtonCheckMarkTrigger={enqueueButtonCheckMarkTrigger.value}
        isEnqueueButtonProcessing={isEnqueueButtonProcessing.value}
        isResetButtonProcessing={isResetButtonProcessing.value}
        onEnqueueButtonClick$={handleEnqueueButtonClick$}
        onResetButtonClick$={handleResetButtonClick$}
        resetButtonCheckMarkTrigger={resetButtonCheckMarkTrigger.value}
      />
    </div>
  )
})
