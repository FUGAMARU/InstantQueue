import {
  $,
  component$,
  isServer,
  useContext,
  useSignal,
  useStore,
  useTask$
} from "@builder.io/qwik"
import { Vibrant } from "node-vibrant/browser"

import { getUserName, getUserPlaylists } from "@/api"
import ActionFooter from "@/components/templates/ActionFooter"
import PlaylistGrid from "@/components/templates/PlaylistGrid"
import styles from "@/components/views/SelectorView.module.css"
import { PLAYLIST_COLOR_FALLBACK } from "@/constants"
import { TokenContext } from "@/token-context"

import type { SelectedPlaylistsState } from "@/types"
import type { PropsOf } from "@builder.io/qwik"

export default component$(() => {
  const accessToken = useContext(TokenContext)
  const userName = useSignal("")
  const playlists = useStore<PropsOf<typeof PlaylistGrid>["playlists"]>([])
  const selectedPlaylistsState = useStore<SelectedPlaylistsState>(
    playlists.map(playlist => ({
      playlistId: playlist.playlistId,
      isChecked: false
    }))
  )

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
  })

  /** Enqueueボタンを押下した時の処理 */
  const handleEnqueueButtonClick$ = $((): void => {
    console.log("チェックされているプレイリストの一覧")
    const checkedPlaylistIdList = selectedPlaylistsState
      .filter(playlist => playlist.isChecked)
      .map(playlist => playlist.playlistId)
    console.log(checkedPlaylistIdList)
  })

  /** Reset Queueボタンを押下した時の処理 */
  const handleResetQueueButtonClick$ = $((): void => {
    console.log("Reset Queue button clicked")
  })

  useTask$(async () => {
    if (isServer) {
      return
    }

    const userPlaylists = await getUserPlaylists(accessToken.value)
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
    Object.assign(
      selectedPlaylistsState,
      playlistsWithThemeColor.map(playlist => ({
        playlistId: playlist.playlistId,
        isChecked: false
      }))
    )

    const userNameResponse = await getUserName(accessToken.value)
    userName.value = userNameResponse
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
        onResetQueueButtonClick$={handleResetQueueButtonClick$}
      />
    </div>
  )
})
