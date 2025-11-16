import { Directive } from 'vue'
import { debounce, throttle } from '@/utils/debounce-throttle'

/**
 * 防抖指令
 * 使用方式：v-debounce:click.500="handleClick"
 */
export const vDebounce: Directive = {
  mounted(el, binding) {
    const [event, time] = binding.arg?.split('.') || ['click', '300']
    const delay = Number(time) || 300

    el._debounceFn = debounce(binding.value, delay)
    el.addEventListener(event, el._debounceFn)
  },
  unmounted(el) {
    if (el._debounceFn) {
      el.removeEventListener(el._debounceFn.event, el._debounceFn)
      delete el._debounceFn
    }
  }
}

/**
 * 节流指令
 * 使用方式：v-throttle:scroll.100="handleScroll"
 */
export const vThrottle: Directive = {
  mounted(el, binding) {
    const [event, time] = binding.arg?.split('.') || ['click', '300']
    const delay = Number(time) || 300

    el._throttleFn = throttle(binding.value, delay)
    el.addEventListener(event, el._throttleFn)
  },
  unmounted(el) {
    if (el._throttleFn) {
      el.removeEventListener(el._throttleFn.event, el._throttleFn)
      delete el._throttleFn
    }
  }
}