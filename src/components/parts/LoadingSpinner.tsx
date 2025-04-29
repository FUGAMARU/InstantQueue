import { component$ } from "@builder.io/qwik"
import clsx from "clsx"

import styles from "@/components/parts/LoadingSpinner.module.css"

/** Props */
type Props = {
  /** 細くするかどうか */
  isThin?: boolean
}

export default component$(({ isThin = false }: Props) => {
  return <div class={clsx(styles.loadingSpinner, isThin && styles.Thin)} />
})
