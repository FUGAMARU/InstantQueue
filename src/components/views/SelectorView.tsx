import { component$, isServer, useContext, useStore, useTask$ } from "@builder.io/qwik"
import { Vibrant } from "node-vibrant/browser"

import { getUserPlaylists } from "@/api"
import ActionFooter from "@/components/templates/ActionFooter"
import PlaylistGrid from "@/components/templates/PlaylistGrid"
import styles from "@/components/views/SelectorView.module.css"
import { PLAYLIST_COLOR_FALLBACK } from "@/constants"
import { TokenContext } from "@/token-context"

import type PlaylistCard from "@/components/parts/PlaylistCard"
import type { PropsOf } from "@builder.io/qwik"

export default component$(() => {
  const accessToken = useContext(TokenContext)
  const playlists = useStore<Array<PropsOf<typeof PlaylistCard>>>([])

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
        } satisfies PropsOf<typeof PlaylistCard>
      })
    )
    Object.assign(playlists, playlistsWithThemeColor)
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
          FUGAMARU !
        </h1>
      </div>

      <div class={styles.grid}>
        <PlaylistGrid playlists={playlists} />
      </div>

      <ActionFooter />
    </div>
  )
})
