import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import { useRef, useCallback } from 'react'
import * as Y from 'yjs'

// type UserSnapshot = ReturnType<Awareness[`getLocalState`]>

export function useSubscribeYjs(data: any): any

export function useSubscribeYjs<Selection>(
  data: Y.AbstractType,
  selector: (state: any) => Selection,
  compare?: (a: Selection, b: Selection) => boolean,
): Selection

export function useSubscribeYjs<Selection>(
  data: Y.AbstractType,
  selector: (state: any) => Selection = (state) => state as Selection,
  compare?: (a: Selection, b: Selection) => boolean,
) {
  const stateRef = useRef()
  if (!stateRef.current) {
    stateRef.current = data.toJSON()
  }
  const getSnapshot = useCallback((data: any) => {
    return stateRef.current
  }, [])

  const subscribe = useCallback((data: any, callback: () => void) => {
    const onChange = (_: any) => {
      stateRef.current = data.toJSON()
      callback()
    }

    data.observeDeep(onChange)
    return () => data.unobserveDeep(onChange)
  }, [])

  const state = useSyncExternalStoreWithSelector(
    (callback) => subscribe(data, callback),
    () => getSnapshot(data),
    () => getSnapshot(data),
    selector,
    compare,
  )

  return state
}
