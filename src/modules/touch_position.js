export default class TouchPosition {
  /*
   */
  constructor (containerElement, sliderRadius, sliderTolerance, angle) {
    this.containerElement = containerElement
    this.sliderRadius = sliderRadius
    this.sliderTolerance = sliderTolerance
    this.angle = angle
    this.setNewPosition({x: 0, y: 0})
  }

  /*
   */
  setNewPosition (e) {
    const dimensions = this.containerElement.getBoundingClientRect()
    const side = dimensions.width
    this.center = side / 2
    this.relativeX = e.clientX - dimensions.left
    this.relativeY = e.clientY - dimensions.top
  }

  /*
   */
  get sliderAngle () {
    return (Math.atan2(this.relativeY - this.center, this.relativeX - this.center) + 2 * Math.PI) % (Math.PI * 2)
  }

  get cpSliderRadius () {
    let x = this.relativeX - this.center
    let y = this.relativeY - this.center
    let cos = Math.cos(this.angle)
    let sin = Math.sin(this.angle)
    let x_ = Math.abs(cos) > Number.EPSILON ? x / cos : 0
    let y_ = Math.abs(sin) > Number.EPSILON ? y / sin : 0
    return Math.abs(x_) > Math.abs(y_) ? x_ : y_
  }

  /*
   */
  get isTouchWithinSliderRange () {
    const touchOffset = Math.sqrt(Math.pow(Math.abs(this.relativeX - this.center), 2) + Math.pow(Math.abs(this.relativeY - this.center), 2))
    return Math.abs(touchOffset - this.sliderRadius) <= this.sliderTolerance
  }

  isTouchWithinSliderDot (currX, currY) {
    const touchOffset = Math.sqrt(Math.pow(Math.abs(this.relativeX - currX), 2) + Math.pow(Math.abs(this.relativeY - currY), 2))
    return Math.abs(touchOffset - this.sliderRadius) <= this.sliderTolerance
  }

}
