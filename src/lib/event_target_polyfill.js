import EventTargetPolyfill from '@ungap/event-target'

try {
  // for some reason eslint both likes and dislikes
  // no-new here so we just call something useless
  // so it stops reporting this file
  const et = new EventTarget()
  et.dispatchEvent()
} catch {
  window.EventTarget = EventTargetPolyfill
}
