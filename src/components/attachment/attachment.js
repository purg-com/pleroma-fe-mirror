import StillImage from '../still-image/still-image.vue'
import Flash from '../flash/flash.vue'
import VideoAttachment from '../video_attachment/video_attachment.vue'
import nsfwImage from '../../assets/nsfw.png'
import fileTypeService from '../../services/file_type/file_type.service.js'
import { mapGetters } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFile,
  faMusic,
  faImage,
  faVideo,
  faPlayCircle,
  faPauseCircle,
  faTimes,
  faStop,
  faSearchPlus,
  faTrashAlt,
  faPencilAlt,
  faAlignRight,
  faVolumeUp,
  faVolumeMute
} from '@fortawesome/free-solid-svg-icons'
import { useMediaViewerStore } from 'src/stores/media_viewer'

library.add(
  faFile,
  faMusic,
  faImage,
  faVideo,
  faPlayCircle,
  faPauseCircle,
  faTimes,
  faStop,
  faSearchPlus,
  faTrashAlt,
  faPencilAlt,
  faAlignRight,
  faVolumeUp,
  faVolumeMute
)

const Attachment = {
  props: [
    'attachment',
    'compact',
    'description',
    'hideDescription',
    'nsfw',
    'size',
    'setMedia',
    'remove',
    'shiftUp',
    'shiftDn',
    'edit'
  ],
  data () {
    return {
      localDescription: this.description || this.attachment.description,
      nsfwImage: this.$store.state.instance.nsfwCensorImage || nsfwImage,
      hideNsfwLocal: this.$store.getters.mergedConfig.hideNsfw,
      preloadImage: this.$store.getters.mergedConfig.preloadImage,
      loading: false,
      img: fileTypeService.fileType(this.attachment.mimetype) === 'image' && document.createElement('img'),
      modalOpen: false,
      showHidden: false,
      flashLoaded: false,
      showDescription: false,
      // Audio player state
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      audioContext: null,
      analyser: null,
      audioSource: null,
      animationFrame: null,
      visualizerCanvas: null
    }
  },
  components: {
    Flash,
    StillImage,
    VideoAttachment
  },
  computed: {
    classNames () {
      return [
        {
          '-loading': this.loading,
          '-nsfw-placeholder': this.hidden,
          '-editable': this.edit !== undefined,
          '-compact': this.compact
        },
        '-type-' + this.type,
        this.size && '-size-' + this.size,
        `-${this.useContainFit ? 'contain' : 'cover'}-fit`
      ]
    },
    usePlaceholder () {
      return this.size === 'hide'
    },
    useContainFit () {
      return this.$store.getters.mergedConfig.useContainFit
    },
    placeholderName () {
      if (this.attachment.description === '' || !this.attachment.description) {
        return this.type.toUpperCase()
      }
      return this.attachment.description
    },
    placeholderIconClass () {
      if (this.type === 'image') return 'image'
      if (this.type === 'video') return 'video'
      if (this.type === 'audio') return 'music'
      return 'file'
    },
    referrerpolicy () {
      return this.$store.state.instance.mediaProxyAvailable ? '' : 'no-referrer'
    },
    type () {
      return fileTypeService.fileType(this.attachment.mimetype)
    },
    hidden () {
      return this.nsfw && this.hideNsfwLocal && !this.showHidden
    },
    isEmpty () {
      return (this.type === 'html' && !this.attachment.oembed)
    },
    useModal () {
      let modalTypes = []
      switch (this.size) {
        case 'hide':
        case 'small':
          modalTypes = ['image', 'video', 'audio', 'flash']
          break
        default:
          modalTypes = this.mergedConfig.playVideosInModal
            ? ['image', 'video', 'flash']
            : ['image']
          break
      }
      return modalTypes.includes(this.type)
    },
    videoTag () {
      return this.useModal ? 'button' : 'span'
    },
    ...mapGetters(['mergedConfig'])
  },
  watch: {
    'attachment.description' (newVal) {
      this.localDescription = newVal
    },
    localDescription (newVal) {
      this.onEdit(newVal)
    }
  },
  methods: {
    linkClicked ({ target }) {
      if (target.tagName === 'A') {
        window.open(target.href, '_blank')
      }
    },
    openModal () {
      if (this.useModal) {
        this.$emit('setMedia')
        useMediaViewerStore().setCurrentMedia(this.attachment)
      } else if (this.type === 'unknown') {
        window.open(this.attachment.url)
      }
    },
    openModalForce () {
      this.$emit('setMedia')
      useMediaViewerStore().setCurrentMedia(this.attachment)
    },
    onEdit (event) {
      this.edit && this.edit(this.attachment, event)
    },
    onRemove () {
      this.remove && this.remove(this.attachment)
    },
    onShiftUp () {
      this.shiftUp && this.shiftUp(this.attachment)
    },
    onShiftDn () {
      this.shiftDn && this.shiftDn(this.attachment)
    },
    stopFlash () {
      this.$refs.flash.closePlayer()
    },
    setFlashLoaded (event) {
      this.flashLoaded = event
    },
    toggleDescription () {
      this.showDescription = !this.showDescription
    },
    toggleHidden (event) {
      if (
        (this.mergedConfig.useOneClickNsfw && !this.showHidden) &&
        (this.type !== 'video' || this.mergedConfig.playVideosInModal)
      ) {
        this.openModal(event)
        return
      }
      if (this.img && !this.preloadImage) {
        if (this.img.onload) {
          this.img.onload()
        } else {
          this.loading = true
          this.img.src = this.attachment.url
          this.img.onload = () => {
            this.loading = false
            this.showHidden = !this.showHidden
          }
        }
      } else {
        this.showHidden = !this.showHidden
      }
    },
    onImageLoad (image) {
      const width = image.naturalWidth
      const height = image.naturalHeight
      this.$emit('naturalSizeLoad', { id: this.attachment.id, width, height })
    },
    formatTime (seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    togglePlay () {
      const audio = this.$refs.audio
      if (!audio) return

      if (this.isPlaying) {
        audio.pause()
        this.isPlaying = false
      } else {
        this.isPlaying = true
        audio.play()
        this.setupAudioVisualization()
      }
    },
    handleVolumeChange (event) {
      const audio = this.$refs.audio
      if (!audio) return

      this.volume = parseFloat(event.target.value)
      audio.volume = this.volume
    },
    updateCanvasSize () {
      const canvas = this.$refs.visualizerCanvas
      const container = this.$refs.audioContainer
      if (canvas && container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    },
    setupAudioVisualization () {
      const audio = this.$refs.audio
      const canvas = this.$refs.visualizerCanvas
      if (!audio || !canvas) return

      try {
        if (!this.audioContext) {
          this.audioContext = new AudioContext()
          this.analyser = this.audioContext.createAnalyser()
          
          try {
            this.audioSource = this.audioContext.createMediaElementSource(audio)
            this.audioSource.connect(this.analyser)
            this.analyser.connect(this.audioContext.destination)
            
            this.analyser.fftSize = 256
          } catch (error) {
            console.warn('Audio visualization setup failed:', error)
            this.cleanupVisualization()
            return
          }
        } else {
          this.audioContext.resume()
        }
        
        // Update canvas size
        this.updateCanvasSize()
        
        const bufferLength = this.analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        
        const draw = () => {
          if (!canvas || !this.isPlaying) return
          
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          
          const width = canvas.width
          const height = canvas.height
          
          this.analyser.getByteFrequencyData(dataArray)
          
          ctx.clearRect(0, 0, width, height)
          
          const barWidth = Math.ceil(width / bufferLength)
          const totalWidth = barWidth * bufferLength
          const startX = (width - totalWidth) / 2  // Center the visualization
          let x = startX
          
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height
            
            ctx.fillStyle = getComputedStyle(canvas).getPropertyValue('--faintText')
            ctx.globalAlpha = Math.min(0.5, (barHeight / height) + 0.1)
            
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
            x += barWidth
          }
          
          this.animationFrame = requestAnimationFrame(draw)
        }
        
        draw()
      } catch (error) {
        console.error('Audio visualization setup failed:', error)
      }
    },
    cleanupVisualization () {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
      if (this.audioContext) {
        this.audioContext.suspend()
      }
    },
    onAudioTimeUpdate (event) {
      this.currentTime = event.target.currentTime
    },
    onAudioDurationChange (event) {
      this.duration = event.target.duration
    },
    onAudioEnded () {
      this.isPlaying = false
      this.cleanupVisualization()
    },
    seek (event) {
      const audio = this.$refs.audio
      if (!audio) return
      
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const percentage = x / rect.width
      audio.currentTime = percentage * this.duration
    }
  },
  mounted () {
    if (this.$refs.audioContainer) {
      const resizeObserver = new ResizeObserver(this.updateCanvasSize)
      resizeObserver.observe(this.$refs.audioContainer)
      
      return () => {
        resizeObserver.disconnect()
      }
    }
  }
}

export default Attachment
