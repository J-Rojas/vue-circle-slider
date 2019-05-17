<template>
  <div>
    <svg :width="side + 'px'" :height="side + 'px'" :viewBox="'0 0 ' + side + ' ' + side" ref="_svg"
      @touchmove="handleTouchMove"
      @click="handleClick"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
    >
      <g>
        <path :stroke="sliderColor" fill="none" :stroke-width="cpMainStrokeWidth" :d="cpPathD(cpAngleRadians, cpRadius, -cpRadius)"></path>
        <path :stroke="progressColor" fill="none" :stroke-width="cpPathStrokeWidth" :d="cpPathD(cpAngleRadians, cpProgressRadiusOrigin, cpProgressRadius)"></path>
        <circle :fill="knobColor" :r="cpKnobRadius" :cx="cpPathX" :cy="cpPathY"></circle>
      </g>
    </svg>
  </div>
</template>
<script>
import TouchPosition from '../modules/touch_position.js'
import CircleSliderState from '../modules/circle_slider_state.js'
export default {
  name: 'LinearSlider',
  created () {
    this.stepsCount = 1 + (this.max - this.min) / this.stepSize
    this.steps = Array.from({
      length: this.stepsCount
    }, (_, i) => this.min + i * this.stepSize)

    this.createSliderState()
    this.currentStepValue = this.circleSliderState.currentStep
    this.originValue = this.origin === null ? this.min : this.origin
    this.originValue = Math.min(this.max, Math.max(this.min, this.originValue))

    this.updateFromPropValue(this.value)
  },

  mounted () {
    this.createTouchPosition()
  },

  updated () {
    this.createTouchPosition()
    this.createSliderState()
  },

  props: {
    value: {
      type: Number,
      required: false,
      default: 0
    },
    side: {
      type: Number,
      required: false,
      default: 100
    },
    stepSize: {
      type: Number,
      required: false,
      default: 1
    },
    min: {
      type: Number,
      required: false,
      default: 0
    },
    max: {
      type: Number,
      required: false,
      default: 100
    },
    sliderColor: {
      type: String,
      required: false,
      default: '#334860'
    },
    progressColor: {
      type: String,
      required: false,
      default: '#00be7e'
    },
    knobColor: {
      type: String,
      required: false,
      default: '#00be7e'
    },
    knobRadius: {
      type: Number,
      required: false,
      default: null
    },
    knobRadiusRel: {
      type: Number,
      required: false,
      default: 7
    },
    width: {
      type: Number,
      required: false,
      default: null
    },
    widthRel: {
      type: Number,
      required: false,
      default: 20
    },
    progressWidth: {
      type: Number,
      required: false,
      default: null
    },
    progressWidthRel: {
      type: Number,
      required: false,
      default: 10
    },
    origin: {
      type: Number,
      required: false,
      default: null
    },
    angle: {
      type: Number,
      required: false,
      default: 0
    }
    // limitMin: {
    //   type: Number,
    //   required: false,
    //   default: null
    // },
    // limitMax: {
    //   type: Number,
    //   required: false,
    //   default: null
    // }
  },
  data () {
    return {
      originValue: null,
      steps: null,
      stepsCount: null,
      currentStepValue: 0,
      mousePressed: false,
      circleSliderState: null,
      mousemoveTicks: 0
    }
  },
  computed: {
    cpCenter () {
      return this.side / 2
    },
    cpMainStrokeWidth () {
      return this.width || this.side * 2 / this.widthRel
    },
    cpPathStrokeWidth () {
      return this.progressWidth || (this.side / 2) / this.progressWidthRel
    },
    cpPathX () {
      return this.pathX(this.cpAngleRadians, this.cpProgressRadius)
    },
    cpPathY () {
      return this.pathY(this.cpAngleRadians, this.cpProgressRadius)
    },
    cpKnobRadius () {
      return this.knobRadius || (this.side / 2) / this.knobRadiusRel
    },
    cpRadius () {
      let maxCurveWidth = Math.max(this.cpMainStrokeWidth, this.cpPathStrokeWidth)
      return (this.side / 2) - Math.max(maxCurveWidth, this.cpKnobRadius * 2) / 2
    },
    cpCenterValue () {
      return (this.max - this.min) / 2
    },
    cpOriginOffset () {
      return (this.origin - this.min)
    },
    cpProgressRadiusOrigin () {
      return (this.cpCenterValue - this.cpOriginOffset) / this.cpCenterValue * this.cpRadius
    },
    cpProgressRadius () {
      return this.cpProgressRadiusOrigin - this.currentStepValue / this.cpCenterValue * this.cpRadius
    },
    cpAngleRadians () {
      return this.angle * Math.PI / 180.0
    }
  },
  methods: {

    createTouchPosition () {
      this.touchPosition = new TouchPosition(this.$refs._svg, this.cpKnobRadius, this.cpKnobRadius, this.cpAngleRadians)
    },

    createSliderState () {
      this.circleSliderState = new CircleSliderState(this.steps, 0, this.value, this.cpRadius * 2)
    },

    cpPathD (angle, startRadius, endRadius) {
      let parts = []

      let startX = this.pathX(angle, startRadius)
      let startY = this.pathY(angle, startRadius)
      let endX = this.pathX(angle, endRadius)
      let endY = this.pathY(angle, endRadius)

      parts.push('M' + startX)
      parts.push(startY)
      parts.push('L' + endX)
      parts.push(endY)

      return parts.join(' ')
    },

    pathX (angle, radius) {
      return this.cpCenter + radius * Math.cos(angle)
    },

    pathY (angle, radius) {
      return this.cpCenter + radius * Math.sin(angle)
    },

    /*
     */
    fitToStep (val) {
      return Math.round(val / this.stepSize) * this.stepSize
    },

    /*
     */
    handleClick (e) {
      this.touchPosition.setNewPosition(e)
      const newAngle = this.calculateValueInPixels()
      this.animateSlider(this.value, newAngle)
    },

    /*
     */
    handleMouseDown (e) {
      e.preventDefault()
      this.mousePressed = true
      window.addEventListener('mousemove', this.handleWindowMouseMove)
      window.addEventListener('mouseup', this.handleMouseUp)
    },

    /*
     */
    handleMouseUp (e) {
      e.preventDefault()
      this.mousePressed = false
      window.removeEventListener('mousemove', this.handleWindowMouseMove)
      window.removeEventListener('mouseup', this.handleMouseUp)
      this.mousemoveTicks = 0
    },

    /*
     */
    handleWindowMouseMove (e) {
      e.preventDefault()
      if (this.mousemoveTicks < 5) {
        this.mousemoveTicks++
        return
      }

      this.touchPosition.setNewPosition(e)
      this.updateSlider()
    },

    /*
     */
    handleTouchMove (e) {
      this.$emit('touchmove')
      // Do nothing if two or more fingers used
      if (e.targetTouches.length > 1) {
        return true
      }

      const lastTouch = e.targetTouches.item(e.targetTouches.length - 1)
      this.touchPosition.setNewPosition(lastTouch)

      e.preventDefault()
      this.updateSlider()
    },

    calculateValueInPixels () {
      var value = this.cpRadius - this.touchPosition.cpSliderRadius
      return value
    },

    /*
     */
    updateValue (value) {
      this.circleSliderState.updateCurrentStepFromAngle(value)
      let stepValue = this.circleSliderState.currentStep
      this.currentStepValue = stepValue

      this.$emit('input', this.currentStepValue)
    },

    /*
     */
    updateFromPropValue (value) {
      let stepValue = this.fitToStep(value)
      this.circleSliderState.updateCurrentStepFromValue(stepValue)
      this.currentStepValue = stepValue
      this.$emit('input', this.currentStepValue)
    },

    /*
     */
    updateSlider () {
      let value = this.calculateValueInPixels()
      this.updateValue(value)
    },

    /*
     */
    animateSlider (startAngle, endAngle) {
      const animate = () => {
        this.updateValue(endAngle)
      }

      window.requestAnimationFrame(animate)
    }
  },
  watch: {
    value (val) {
      this.updateFromPropValue(val)
    }
  }
}
</script>
