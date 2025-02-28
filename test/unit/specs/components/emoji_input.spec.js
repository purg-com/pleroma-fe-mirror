import { h } from 'vue'
import { shallowMount } from '@vue/test-utils'
import EmojiInput from 'src/components/emoji_input/emoji_input.vue'
import vClickOutside from 'click-outside-vue3'

const generateInput = (value, padEmoji = true) => {
  const wrapper = shallowMount(EmojiInput, {
    global: {
      renderStubDefaultSlot: true,
      mocks: {
        $store: {
          getters: {
            mergedConfig: {
              padEmoji
            }
          }
        },
        $t: (msg) => msg
      },
      stubs: {
        FAIcon: true,
        Popover: {
          template: `<div><slot trigger /></div>`,
          methods: {
            updateStyles () {}
          }
        }
      },
      directives: {
        'click-outside': vClickOutside
      }
    },
    props: {
      suggest: () => [],
      enableEmojiPicker: true,
      modelValue: value
    },
    slots: {
      default: () => h('input', '')
    }
  })
  return wrapper
}

describe('EmojiInput', () => {
  describe('insertion mechanism', () => {
    it('inserts string at the end with trailing space', () => {
      const initialString = 'Testing'
      const wrapper = generateInput(initialString)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: initialString.length })
      wrapper.vm.insert({ insertion: '(test)', keepOpen: false })
      const inputEvents = wrapper.emitted()['update:modelValue']
      expect(inputEvents[inputEvents.length - 1][0]).to.eql('Testing (test) ')
    })

    it('inserts string at the end with trailing space (source has a trailing space)', () => {
      const initialString = 'Testing '
      const wrapper = generateInput(initialString)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: initialString.length })
      wrapper.vm.insert({ insertion: '(test)', keepOpen: false })
      const inputEvents = wrapper.emitted()['update:modelValue']
      expect(inputEvents[inputEvents.length - 1][0]).to.eql('Testing (test) ')
    })

    it('inserts string at the begginning without leading space', () => {
      const initialString = 'Testing'
      const wrapper = generateInput(initialString)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: 0 })
      wrapper.vm.insert({ insertion: '(test)', keepOpen: false })
      const inputEvents = wrapper.emitted()['update:modelValue']
      expect(inputEvents[inputEvents.length - 1][0]).to.eql('(test) Testing')
    })

    it('inserts string between words without creating extra spaces', () => {
      const initialString = 'Spurdo Sparde'
      const wrapper = generateInput(initialString)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: 6 })
      wrapper.vm.insert({ insertion: ':ebin:', keepOpen: false })
      const inputEvents = wrapper.emitted()['update:modelValue']
      expect(inputEvents[inputEvents.length - 1][0]).to.eql('Spurdo :ebin: Sparde')
    })

    it('inserts string between words without creating extra spaces (other caret)', () => {
      const initialString = 'Spurdo Sparde'
      const wrapper = generateInput(initialString)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: 7 })
      wrapper.vm.insert({ insertion: ':ebin:', keepOpen: false })
      const inputEvents = wrapper.emitted()['update:modelValue']
      expect(inputEvents[inputEvents.length - 1][0]).to.eql('Spurdo :ebin: Sparde')
    })

    it('inserts string without any padding if padEmoji setting is set to false', () => {
      const initialString = 'Eat some spam!'
      const wrapper = generateInput(initialString, false)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: initialString.length, keepOpen: false })
      wrapper.vm.insert({ insertion: ':spam:' })
      const inputEvents = wrapper.emitted()['update:modelValue']
      expect(inputEvents[inputEvents.length - 1][0]).to.eql('Eat some spam!:spam:')
    })

    it('correctly sets caret after insertion at beginning', async () => {
      const initialString = '1234'
      const wrapper = generateInput(initialString)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: 0 })
      wrapper.vm.insert({ insertion: '1234', keepOpen: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.caret).to.eql(5)
    })

    it('correctly sets caret after insertion at end', async () => {
      const initialString = '1234'
      const wrapper = generateInput(initialString)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: initialString.length })
      wrapper.vm.insert({ insertion: '1234', keepOpen: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.caret).to.eql(10)
    })

    it('correctly sets caret after insertion if padEmoji setting is set to false', async () => {
      const initialString = '1234'
      const wrapper = generateInput(initialString, false)
      const input = wrapper.find('input')
      input.setValue(initialString)
      wrapper.setData({ caret: initialString.length })
      wrapper.vm.insert({ insertion: '1234', keepOpen: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.caret).to.eql(8)
    })
  })
})
