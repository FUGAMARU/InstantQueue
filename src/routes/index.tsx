import { component$, useContext } from "@builder.io/qwik"

import PlaylistCard from "@/components/parts/PlaylistCard"
import TopView from "@/components/views/TopView"
import { TokenContext } from "@/token-context"
import { isValidString } from "@/utils"

import type { DocumentHead } from "@builder.io/qwik-city"

export default component$(() => {
  const accessToken = useContext(TokenContext)

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {isValidString(accessToken.value) ? (
        <div>
          <div style={{ width: 150, height: 150 }}>
            <PlaylistCard />
          </div>

          {accessToken.value}
        </div>
      ) : (
        <TopView />
      )}
    </div>
  )
})

export const head: DocumentHead = {
  title: "InstantQueue",
  meta: [
    {
      name: "description",
      content: "Qwik site description"
    }
  ]
}
