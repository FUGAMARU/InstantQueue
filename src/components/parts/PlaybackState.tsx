import { component$ } from "@builder.io/qwik"
import clsx from "clsx"

import Icon from "@/components/icons/Icon"
import styles from "@/components/parts/PlaybackState.module.css"

/** Props */
type Props = {
  /** 状態 */
  state: "ready" | "unable"
}

export default component$(({ state }: Props) => {
  return (
    <div class={clsx(styles.playbackState, state === "ready" ? styles.Ready : styles.Unable)}>
      <span class={styles.icon}>
        <Icon name={state === "ready" ? "check" : "unable"} />
      </span>
      <span class={styles.text}>{state === "ready" ? "Ready to Play" : "Unable to Play"}</span>
    </div>
  )
})
