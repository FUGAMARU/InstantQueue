import { createContextId } from "@builder.io/qwik"

import type { Signal } from "@builder.io/qwik"

export const TokenContext = createContextId<Signal<string>>("token-context")
