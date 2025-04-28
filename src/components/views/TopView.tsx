import { $, component$ } from "@builder.io/qwik"

import Button from "@/components/parts/Button"
import styles from "@/components/views/TopView.module.css"
import { SPOTIFY, WEB_STORAGE } from "@/constants"

export default component$(() => {
  /**
   * PKCE認証フローを開始するための関数
   * routeLoaderを使ってサーバーサイドで処理する実装を試したが、ページリダイレクトがエラーが出てできなかったのでクライアントサイドで処理
   *
   * @see https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
   */
  const handleStartPKCE = $(async () => {
    // CodeVerifierの生成
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const randomValues = crypto.getRandomValues(new Uint8Array(64))
    const codeVerifier = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "")

    sessionStorage.setItem(WEB_STORAGE.PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY, codeVerifier)

    // CodeChallengeの生成
    const data = new TextEncoder().encode(codeVerifier)
    const hashed = await crypto.subtle.digest("SHA-256", data)
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")

    // 認証URLの生成
    const authUrl = new URL(SPOTIFY.API_ENDPOINT_AUTH)
    const params = {
      response_type: "code",
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      client_id: SPOTIFY.CLIENT_ID,
      scope: SPOTIFY.API_SCOPES,
      redirect_uri: SPOTIFY.PKCE_REDIRECT_URI
    }
    authUrl.search = new URLSearchParams(params).toString()

    location.href = authUrl.toString()
  })

  return (
    <div class={styles.topView}>
      <div class={styles.main}>
        <div class={styles.upper}>
          <img
            alt="InstantQueue Logo"
            height={80}
            src="https://placehold.jp/80x80.png"
            width={80}
          />
          <h1 class={styles.title}>InstantQueue</h1>
          <span class={styles.description}>Mashup Multiple Playlists, One Perfect Queue.</span>
        </div>

        <div class={styles.button}>
          <Button
            color="green"
            iconName="spotify"
            label="Sign-In with Spotify"
            onClick$={handleStartPKCE}
          />
        </div>
      </div>
    </div>
  )
})
