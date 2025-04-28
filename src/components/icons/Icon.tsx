import { component$ } from "@builder.io/qwik"

import IconAdd from "@/components/icons/IconAdd"
import IconCheck from "@/components/icons/IconCheck"
import IconCross from "@/components/icons/IconCross"
import IconSpotify from "@/components/icons/IconSpotify"
import IconUnable from "@/components/icons/IconUnable"

/** Props */
type Props = {
  /** アイコン名 */
  name: "add" | "cross" | "check" | "spotify" | "unable"
}

export default component$(({ name }: Props) => {
  switch (name) {
    case "add":
      return <IconAdd />
    case "cross":
      return <IconCross />
    case "check":
      return <IconCheck />
    case "spotify":
      return <IconSpotify />
    case "unable":
      return <IconUnable />
  }
})
