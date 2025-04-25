import { $, component$ } from "@builder.io/qwik"

import PlaylistCard from "@/components/PlaylistCard"
import {
  SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY,
  SPOTIFY_PKCE_REDIRECT_URI,
  SPOTIFY_API_ENDPOINT_AUTH,
  SPOTIFY_API_SCOPES,
  SPOTIFY_CLIENT_ID
} from "@/constants"

import type { DocumentHead } from "@builder.io/qwik-city"

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

    sessionStorage.setItem(SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY, codeVerifier)

    // CodeChallengeの生成
    const data = new TextEncoder().encode(codeVerifier)
    const hashed = await crypto.subtle.digest("SHA-256", data)
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")

    // 認証URLの生成
    const authUrl = new URL(SPOTIFY_API_ENDPOINT_AUTH)
    const params = {
      response_type: "code",
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      client_id: SPOTIFY_CLIENT_ID,
      scope: SPOTIFY_API_SCOPES,
      redirect_uri: SPOTIFY_PKCE_REDIRECT_URI
    }
    authUrl.search = new URLSearchParams(params).toString()

    window.location.href = authUrl.toString()
  })

  return (
    <div>
      <div style={{ width: 150, height: 150 }}>
        <PlaylistCard />
      </div>
      <button onClick$={handleStartPKCE} type="button">
        Start PKCE
      </button>
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
