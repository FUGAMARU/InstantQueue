import { component$ } from "@builder.io/qwik"
import { BsSpotify, BsArrowRight, BsX } from "@qwikest/icons/bootstrap"
import clsx from "clsx"
import { capitalize } from "es-toolkit"

import styles from "@/components/parts/Button.module.css"

import type { JSXOutput, PropFunction } from "@builder.io/qwik"

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
  onClick$: PropFunction<() => void>
  /** 大きめに表示するかどうか */
  isLarger?: boolean
}

export default component$(
  ({ color, label, icon, onClick$: handleClick$, isLarger = false }: Props) => {
    const iconMap = {
      spotify: <BsSpotify />,
      add: <BsArrowRight />,
      cross: <BsX />
    } as const satisfies Record<Icon, JSXOutput>

    return (
      <button
        class={clsx(styles.buttonTag, styles[capitalize(color)], isLarger && styles.Larger)}
        onClick$={handleClick$}
        type="button"
      >
        <span class={clsx(styles.label, isLarger && styles.Larger)}>{label}</span>
        <span class={clsx(styles.icon, isLarger && styles.Larger)}>{iconMap[icon]}</span>
      </button>
    )
  }
)
