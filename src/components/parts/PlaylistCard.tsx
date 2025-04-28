import { component$ } from "@builder.io/qwik"
import clsx from "clsx"

import Icon from "@/components/icons/Icon"
import styles from "@/components/parts/PlaylistCard.module.css"

import type { Playlist } from "@/types"
import type { PropFunction } from "@builder.io/qwik"

/**
 * 背景色から文字色を白にするべきかを判定する
 * 参考: https://zenn.dev/mryhryki/articles/2020-11-12-hatena-background-color
 *
 * @param backgroundColorCode - 背景色
 * @returns 白文字色にするべきか
 */
const determineWhiteTextColor = (backgroundColorCode: string): boolean => {
  const [, red, green, blue] = backgroundColorCode.match(/^#(..)(..)(..)$/) ?? []
  const redValue = parseInt(red, 16)
  const greenValue = parseInt(green, 16)
  const blueValue = parseInt(blue, 16)

  const brightness = Math.floor(redValue * 0.299 + greenValue * 0.587 + blueValue * 0.114)

  return brightness < 200
}

/** Props */
type Props = Omit<Playlist, "playlistId"> & {
  /** 選択されているかどうか */
  isSelected?: boolean
  /** 押下した時の処理 */
  onClick$: PropFunction<() => void>
}

export default component$(
  ({ name, thumbnail, themeColor, isSelected = false, onClick$: handleClick$ }: Props) => {
    return (
      <button
        class={styles.playlistCard}
        onClick$={handleClick$}
        style={{ backgroundColor: `${themeColor}cc` }}
        type="button"
      >
        <div class={styles.contents}>
          <img alt={name} class={styles.artwork} height={138} src={thumbnail} width={138} />
          <div class={styles.title} style={{ backgroundColor: `${themeColor}cc` }}>
            <span class={clsx(styles.inner, !determineWhiteTextColor(themeColor) && styles.Black)}>
              {name}
            </span>
          </div>
        </div>

        {isSelected && (
          <div class={styles.overlay}>
            <div class={styles.icon}>
              <Icon name="check" />
            </div>
          </div>
        )}
      </button>
    )
  }
)
