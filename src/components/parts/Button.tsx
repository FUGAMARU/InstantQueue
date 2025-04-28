import { component$ } from "@builder.io/qwik"
import { BsSpotify } from "@qwikest/icons/bootstrap"
import { TbMoodPlus, TbMoodWrrr } from "@qwikest/icons/tablericons"
import clsx from "clsx"
import { capitalize } from "es-toolkit"

import styles from "@/components/parts/Button.module.css"

import type { JSXOutput, QRL } from "@builder.io/qwik"

/** アイコン一覧 */
type Icon = "spotify" | "add" | "cross"

/** Props */
type Props = {
  /** 色 */
  color: "blue" | "red" | "green"
  /** ラベル */
  label: string
  /** アイコン */
  icon: Icon
  /** 押下した時の処理 */
  onClick$: QRL<() => void>
}

export default component$(({ color, label, icon, onClick$: handleClick$ }: Props) => {
  const iconMap = {
    spotify: <BsSpotify />,
    add: <TbMoodPlus />,
    cross: <TbMoodWrrr />
  } as const satisfies Record<Icon, JSXOutput>

  return (
    <button
      class={clsx(styles.buttonTag, styles[capitalize(color)])}
      onClick$={handleClick$}
      type="button"
    >
      <span class={styles.label}>{label}</span>
      <span class={styles.icon}>{iconMap[icon]}</span>
    </button>
  )
})
