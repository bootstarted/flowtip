# FlowTip
# https://github.com/qiushihe/flowtip

class @FlowTip

  FlowTip: "3.0"

  className: ""
  contentClassName: ""
  tailClassName: ""
  appendTo: null
  tooltipContent: null
  region: "top"
  topDisabled: false
  bottomDisabled: false
  leftDisabled: false
  rightDisabled: false
  hideInDisabledRegions: false
  persevere: false
  hasTail: true
  width: null
  height: "auto"
  minWidth: null
  minHeight: null
  maxWidth: null
  maxHeight: null
  tailWidth: 20
  tailHeight: 10
  targetOffset: 10
  targetOffsetFrom: "root"
  edgeOffset: 30
  rotationOffset: 30
  targetAlign: "center"
  targetAlignOffset: 0
  rootAlign: "center"
  rootAlignOffset: 0

  constructor: (options = {}) ->
    @visible = false
    @target = null

    for option of options
      if _.has(options, option) && options[option] != undefined
        this[option] = options[option]

    @coordinator = new FlowTip.Coordinator()

  render: ->
    return @_renderContent() if @$root

    @root = document.createElement("div")
    @root.className = "flowtip #{@className}"
    @root.style.position = "absolute"
    @root.style.display = "none"

    @content = document.createElement("div")
    @content.className = "flowtip-content #{@contentClassName}"
    @_renderContent()
    @_repositionCount = 0
    @root.appendChild(@content)

    @tail = document.createElement("div")
    @tail.className = "flowtip-tail #{@tailClassName}"
    @tail.style.position = "absolute"
    @tail.appendChild(document.createElement("div"))
    @root.appendChild(@tail)

    @$root = $(@root)
    @$content = $(@content)
    @$tail = $(@tail)
    @$appendTo = $(@appendTo ||= document.body)
    @appendTo = @$appendTo[0]

    @_insertToDOM()

  setAppendTo: (appendTo) ->
    @$appendTo = $(appendTo)
    @appendTo = @$appendTo[0]
    @_insertToDOM() if @$root

  setTarget: (target) ->
    @$target = $(target)
    @target = @$target[0]
    @clientRect = false

  setClientRectTarget: (rect) ->
    @target = rect
    @$target = null
    @clientRect = true

  setTooltipContent: (content, options = {}) ->
    @tooltipContent = content
    @render() if options.render

  reposition: (options = {}) ->
    return unless @target

    @_updateDimensions()
    @_updatePosition(options)

  show: ->
    return if @visible

    @render()
    @visible = true
    @_updateVisibility(false)
    @root.style.display = "block"

    _.delay =>
      @reposition()
      # No need to call `updateVisibility` here because `reposition` internally calls
      # `_updatePosition` which calls `updateVisibility` with the visibility argument based on
      # regional visibility settings
      @trigger("show")
    , 16

  hide: ->
    return unless @visible

    @visible = false
    @root.style.display = "none"

    @trigger("hide")

  trigger: (eventName) ->
    @$root.trigger("#{eventName}.flowtip")

  destroy: ->
    @$root.remove() if @$root

  # Deprecated Methods

  setClientRect: (rect) ->
    @setClientRectTarget(rect)

  # Private Methods
  # *Hitherto shalt thou come, but no further.*

  _updateCoordinator: ->
    @coordinator.tooltipOptions = _.reduce(FlowTip.Coordinator.TooltipOptions, (opts, opt) =>
      opts[opt] = this[opt]
      opts
    , {})

    @coordinator.$tooltipRoot = @$root
    @coordinator.$tooltipTail = @$tail
    @coordinator.$tooltipParent = @$appendTo

    @coordinator.tooltipTargetType = if @clientRect then "rect" else "element"
    @coordinator.tooltipTarget = @target
    @coordinator.$tooltipTarget = @$target

  _updateDimensions: ->
    @$root.width(@width)
    @$root.height(@height)
    @$root.css({
      minWidth: @minWidth
      minHeight: @minHeight
      maxWidth: @maxWidth
      maxHeight: @maxHeight
    })

    @$tail.width(@tailWidth)
    @$tail.height(@tailHeight)

    if @width == "auto" || @height == "auto"
      @content.style.position = "relative"

  _updateVisibility: (visible) ->
    @root.style.opacity = if visible then 1 else 0

  _updatePosition: (options = {}) ->
    previousRegion = @coordinator.currentRegion()
    @_updateCoordinator()
    position = @coordinator.calculatePosition()
    inSameRegion = previousRegion == @coordinator.currentRegion()
    hadPriorValue = (@root.style.top || @root.style.left)

    options.animate = options.animate && @visible && inSameRegion && hadPriorValue

    if typeof(Modernizr) != "undefined"
      @root.style[Modernizr.prefixed("transition")] = "none"

    if options.animate && typeof(Modernizr) != "undefined"
      topTransform = parseInt(@root.style.top.replace("px", ""), 10) - position.top
      leftTransform = parseInt(@root.style.left.replace("px", ""), 10) - position.left
      @root.style[Modernizr.prefixed("transform")] = "translate3d(#{leftTransform}px, #{topTransform}px, 0)"

    @root.style.top = "#{position.top}px"
    @root.style.left = "#{position.left}px"

    rootHeight = @$root.height()
    contentHeight = @$content.height()
    contentOuterHeight = @$content.outerHeight(true)
    contentSpacing = contentOuterHeight - contentHeight

    if contentOuterHeight > rootHeight
      @content.style.maxHeight = "#{rootHeight - contentSpacing}px"
      @$root.addClass("content-overflow")

    if @hasTail
      @tail.style.display = "block"
      @tail.style.top = "#{Math.round(position.tail.top)}px"
      @tail.style.left = "#{Math.round(position.tail.left)}px"
      @tail.style.width = "#{position.tail.width}px"
      @tail.style.height = "#{position.tail.height}px"
      @tail.className = "flowtip-tail #{@tailClassName} #{position.tail.type}"
      @root.className = @root.className.replace(/tail-at-[\w]+/, "").trim()
      @root.className = "#{@root.className} tail-at-#{position.tail.type}"
    else
      @tail.style.display = "none"

    @_updateVisibility(!position.hidden)

    if options.animate && typeof(Modernizr) != "undefined"
      prefix = Modernizr.prefixed("transform").replace("Transform", "").toLowerCase()
      prefix = "-#{prefix}-" if prefix
      @root.style[Modernizr.prefixed("transition")] = "#{prefix}transform #{options.animationDuration || "100ms"} linear"
      @root.style[Modernizr.prefixed("transform")] = "translate3d(0, 0, 0)"

  _insertToDOM: ->
    # Ensure "position" is explicitly defined on the appendTo element
    position = @$appendTo.css("position")
    position = "relative" unless position in ["relative", "absolute", "fixed"]
    @appendTo.style.position = position
    @appendTo.appendChild(@root)

  _renderContent: ->
    if typeof(@tooltipContent) == "string"
      $(@content).html(@tooltipContent)
    else
      @$tooltipContent = $(@tooltipContent)

      if @$tooltipContent.length
        node = @$tooltipContent[0]
        @content.removeChild(node) if @content.contains(node)

      @content.innerHTML = ""
      @content.appendChild(node) if node

