import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik"
import { useNavigate } from "@builder.io/qwik-city"

import { spotifyAccountsApiFunctions } from "@/api"
import {
  SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY,
  SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY
} from "@/constants"
import { TokenContext } from "@/token-context"
import { isDefined } from "@/utils"

export default component$(() => {
  const accessToken = useContext(TokenContext)
  const navigate = useNavigate()

  // routeActionを使ってサーバーサイドで処理する実装を試したが、クエリパラメーターがうまく取得できなかったのでクライアントサイドで処理
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // クエリパラメーターのcodeを取得
    const url = new URL(location.href)
    const code = url.searchParams.get("code")
    const codeVerifier = sessionStorage.getItem(SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY)

    if (!isDefined(code) || !isDefined(codeVerifier)) {
      navigate("/")
      return
    }

    const spotifyAccountsApi = await spotifyAccountsApiFunctions()
    const tokenInfo = await spotifyAccountsApi.getAccessToken(code, codeVerifier)

    accessToken.value = tokenInfo.accessToken
    localStorage.setItem(SPOTIFY_REFRESH_TOKEN_LOCAL_STORAGE_KEY, tokenInfo.refreshToken)
    sessionStorage.removeItem(SPOTIFY_PKCE_CODE_VERIFIER_SESSION_STORAGE_KEY)
    navigate("/")
  })

  return null
})
