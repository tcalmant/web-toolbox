/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for composables/useWakeLock.ts
 */

import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, ref, type Ref } from 'vue'

import { useWakeLock } from '../../../src/composables/useWakeLock'

class FakeSentinel extends EventTarget {
  released = false

  release() {
    this.released = true
    this.dispatchEvent(new Event('release'))
    return Promise.resolve()
  }
}

interface Scene {
  enabled: Ref<boolean>
  wrapper: VueWrapper
  /** Grants every pending request */
  grant: () => Promise<void>
  setVisible: (visible: boolean) => void
  sentinels: FakeSentinel[]
}

let pending: Array<() => void> = []
let sentinels: FakeSentinel[] = []
let visible = true

beforeEach(() => {
  pending = []
  sentinels = []
  visible = true
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (visible ? 'visible' : 'hidden'),
  })
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: {
      request: () =>
        new Promise<FakeSentinel>((resolve) => {
          pending.push(() => {
            const sentinel = new FakeSentinel()
            sentinels.push(sentinel)
            resolve(sentinel)
          })
        }),
    },
  })
})

afterEach(() => {
  Reflect.deleteProperty(navigator, 'wakeLock')
  Reflect.deleteProperty(document, 'visibilityState')
})

function setUp(): Scene {
  const enabled = ref(true)
  const Host = defineComponent({
    setup() {
      useWakeLock(enabled)
      return () => null
    },
  })
  return {
    enabled,
    wrapper: mount(Host),
    grant: async () => {
      const grants = pending
      pending = []
      grants.forEach((grant) => grant())
      await flushPromises()
    },
    setVisible: (value) => {
      visible = value
      document.dispatchEvent(new Event('visibilitychange'))
    },
    sentinels,
  }
}

describe('useWakeLock', () => {
  it.each<[string, (scene: Scene) => Promise<void>, number, number]>([
    [
      'toggled off while a request is pending',
      async ({ enabled, grant }) => {
        enabled.value = false
        await grant()
      },
      1,
      0,
    ],
    [
      'unmounted while a request is pending',
      async ({ wrapper, grant }) => {
        wrapper.unmount()
        await grant()
      },
      1,
      0,
    ],
    [
      'two concurrent requests',
      async ({ setVisible, grant }) => {
        setVisible(true)
        await grant()
      },
      2,
      1,
    ],
    [
      'request again once shown after the browser released it',
      async ({ grant, setVisible, sentinels }) => {
        await grant()
        sentinels[0]!.release()
        setVisible(false)
        await grant()
        setVisible(true)
        await grant()
      },
      2,
      1,
    ],
  ])('%s', async (_, run, requests, held) => {
    const scene = setUp()
    await run(scene)
    expect(scene.sentinels).toHaveLength(requests)
    expect(scene.sentinels.filter((sentinel) => !sentinel.released)).toHaveLength(held)
  })
})
