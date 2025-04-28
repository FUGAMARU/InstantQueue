import { component$ } from "@builder.io/qwik"
import clsx from "clsx"
import { capitalize } from "es-toolkit"

import Icon from "@/components/icons/Icon"
import styles from "@/components/parts/Button.module.css"

import type { PropsOf, QRL } from "@builder.io/qwik"

/** Props */
type Props = {
  /** 色 */
  color: "blue" | "red" | "green"
  /** ラベル */
  label: string
  /** アイコン */
  iconName: PropsOf<typeof Icon>["name"]
  /** 押下した時の処理 */
  onClick$: QRL<() => void>
}

export default component$(({ color, label, iconName, onClick$: handleClick$ }: Props) => {
  return (
    <button
      class={clsx(styles.buttonTag, styles[capitalize(color)])}
      onClick$={handleClick$}
      type="button"
    >
      <span class={styles.label}>{label}</span>
      <span class={styles.icon}>
        <Icon name={iconName} />
      </span>
    </button>
  )
})
