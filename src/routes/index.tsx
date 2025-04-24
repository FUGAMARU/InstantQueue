import { component$ } from "@builder.io/qwik"

import PlaylistCard from "@/components/PlaylistCard"

import type { DocumentHead } from "@builder.io/qwik-city"

export default component$(() => {
  return (
    <div style={{ width: 150, height: 150 }}>
      <PlaylistCard />
    </div>
  )
})

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description"
    }
  ]
}
