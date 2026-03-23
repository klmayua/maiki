'use client'

import * as React from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastState {
  toasts: Toast[]
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

let memoryState: ToastState = { toasts: [] }
const listeners: Array<(state: ToastState) => void> = []

function dispatch(action: { type: 'ADD_TOAST'; toast: Toast } | { type: 'DISMISS_TOAST'; toastId: string } | { type: 'REMOVE_TOAST'; toastId: string }) {
  switch (action.type) {
    case 'ADD_TOAST':
      memoryState = {
        ...memoryState,
        toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      }
      break
    case 'DISMISS_TOAST': {
      const timeout = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', toastId: action.toastId })
      }, TOAST_REMOVE_DELAY)
      toastTimeouts.set(action.toastId, timeout)
      break
    }
    case 'REMOVE_TOAST':
      if (toastTimeouts.has(action.toastId)) {
        clearTimeout(toastTimeouts.get(action.toastId))
        toastTimeouts.delete(action.toastId)
      }
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      }
      break
  }

  listeners.forEach((listener) => listener(memoryState))
}

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

function toast({ title, description, variant = 'default' }: ToastOptions) {
  const id = genId()
  dispatch({
    type: 'ADD_TOAST',
    toast: { id, title, description, variant },
  })
  setTimeout(() => {
    dispatch({ type: 'DISMISS_TOAST', toastId: id })
  }, TOAST_REMOVE_DELAY)
  return { id, dismiss: () => dispatch({ type: 'DISMISS_TOAST', toastId: id }) }
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export { useToast, toast }
