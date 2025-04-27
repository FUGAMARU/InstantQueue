import { component$, useContextProvider, useSignal } from "@builder.io/qwik"
import { isDev } from "@builder.io/qwik"
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from "@builder.io/qwik-city"

import "destyle.css"
import "@/styles/global.css"
import "@fontsource/gabarito/400.css"
import "@fontsource/gabarito/700.css"
import { RouterHead } from "@/components/router-head/router-head"
import { TokenContext } from "@/token-context"

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  const accessToken = useSignal("")
  useContextProvider(TokenContext, accessToken)

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {!isDev && <link href={`${import.meta.env.BASE_URL}manifest.json`} rel="manifest" />}
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        {!isDev && <ServiceWorkerRegister />}
      </body>
    </QwikCityProvider>
  )
})
