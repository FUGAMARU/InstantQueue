import { component$ } from "@builder.io/qwik"
import { BsCheckCircle } from "@qwikest/icons/bootstrap"
import clsx from "clsx"

import styles from "@/components/parts/PlaylistCard.module.css"

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
type Props = {
  /** プレイリストID */
  playlistId: string
  /** プレイリスト名 */
  name: string
  /** プレイリストのサムネイルURL */
  thumbnail: string
  /** プレイリストのテーマカラー */
  themeColor: string
  /** 選択されているかどうか */
  isSelected?: boolean
}

export default component$(({ name, thumbnail, themeColor, isSelected = false }: Props) => {
  return (
    <div class={styles.playlistCard} style={{ backgroundColor: `${themeColor}cc` }}>
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
            <BsCheckCircle />
          </div>
        </div>
      )}
    </div>
  )
})
