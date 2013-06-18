# # FlowTip
#
# *A flexible, adaptable and easy to use tooltip positioning library.*
#
# Click [here](demo.html) for to see a demo.

class @FlowTip

  FlowTip: "2.0"

  # ### Create a FlowTip
  #
  # Call **FlowTip**'s constructor, optionally with some of the attributes listed below:
  #
  #     var myFlowTip = new FlowTip({
  #         region: "bottom"
  #         className: "my-tip"
  #         hasTail: false
  #     })
  constructor: (options = {}) ->
    for option of options
      if _.has(options, option) && options[option] != undefined
        this[option] = options[option]

  # ### Attributes

  # `className`: **String**; Additional class name(s) for the container of the tooltip.
  className: ""

  # `contentClassName`: **String**; Additional class name(s) for the tooltip's content.
  contentClassName: ""

  # `tailClassName`: **String**; Additional class name(s) for the tooltip's tail.
  tailClassName: ""

  # `appendTo`: **Element**; The element within which the tooltip will be inserted into.
  # Default value is the document's `body` and the tooltip would thus be free to move/appear
  # anywhere on the page and edge detection will only be performed on the edge of the page.
  # If `appendTo` is set to a element in the page, edge detection will be performed on the edge of
  # the element.
  appendTo: null

  # `tooltipContent`: **String** | **Element**; The content of the tooltip. May be specified as
  # (HTML) string or DOM element. Can be (re)set by calling `setTooltipContent(...)`.
  tooltipContent: null

  # `region`: **String**; The preferred region in which the tooltip will appear relative to its
  # target. Possibly values are: `top`, `bottom`, `left` and `right`.
  region: "top"

  # `persevere`: **Boolean**; If set to `true`, the tooltip will be reverted back to its preferred
  # region whenever possible (i.e. whenever there is enough space in that region). If set
  # to `false`, the tooltip will remain in the region edge detection puts it in until edge detection
  # changes it again.
  persevere: false

  # `hasTail`: **Boolean**; Controls if the tooltip has a "tail" that remains pointing to the
  # tooltip's target.
  hasTail: true

  animated: false

  width: null
  height: "auto"
  minWidth: null
  minHeight: null
  maxWidth: null
  maxHeight: null

  tailWidth: 20
  tailHeight: 10

  # `targetOffset`: **Integer**; The distance between:
  #
  # * the edge of the tooltip's target in the current region
  # * the closest edge of the tooltip's root (or tail; see `targetOffsetFrom` below) to the target's
  #   edge
  targetOffset: 10

  # `rotationOffset`: **Integer**; The distance between two closest edges of:
  #
  # * the boundary representive of the tooltip's `appendTo` attribute
  # * the target of the tooltip
  #
  # ... beyond which point edge detection will cause the tooltip to be rotated to an adjacent
  # region.
  rotationOffset: 30

  # `edgeOffset`: **Integer**; The distance between two closest edges of:
  #
  # * the boundary representive of the tooltip's `appendTo` attribute
  # * the target of the tooltip
  #
  # ... beyond which point edge detection will cause the tooltip to be flipped to an opposit region.
  edgeOffset: 30

  # `targetOffsetFrom`: **String**; Possible values are `root` and `tail`. When set to `root`,
  # `targetOffset` will be calculated against the edge of the tooltip's root; When set to `tail`,
  # `targetOffset` will take the tooltip's tail into account.
  targetOffsetFrom: "root"

  # ### Alignments
  #
  # Tooltip's alignments are divided into **root alignment** and **target alignment**, each with
  # a corresponding **offset** attribute that controls the direction of the alignment and offset
  # amount.
  #
  # ##### Alignment Pivot
  #
  # When talking about alignments, it's easiest to reference an imaginary "pivot" to which both the
  # tooltip and its target are aligned to. For example, if both the tooltip's root and its target
  # are set to "center" align, then this "pivot" would be a line that would run across the center of
  # both elements.
  #
  # The alignment pivot can also be seen as *the point at which the tooltip is "pointing" at the
  # target*.
  #
  # ##### Root Alignment
  #
  # Root alignment referrs to the alignment of the tooltip's root relative to the pivot.
  #
  # `rootAlign`: **String**; Possible values are `center` and `edge`. When set to `center`, the
  # tooltip's root will be center aligned against the pivot. When set to `edge`, one of the
  # tooltip's root's edge will be aligned against the pivot. See `rootAlignOffset` for the
  # exact mechanics of the two values. This value can also be specified on a per-region basis via
  # `[top|bottom|left|right]RootAlign`, and if a region's specific value is absence, the value from
  # `rootAlign` will be used.
  rootAlign: "center"

  # `rootAlignOffset`: **Integer**
  #
  # If `rootAlign` is set to `center`, this attribute controls the clockwise distance from the
  # pivot the tooltip's root will shift. When this value is positive, the root will shift clockwise,
  # and counter-clockwise when this value is negative.
  #
  # If `rootAlign` is set to `edge`, one of the tooltip's root's edge will be aligned against the
  # pivot. When this attribute is positive, the clockwise edge will be used and the
  # counter-clockwise edge will be used when this attribute is negative. The absolute value of this
  # attribute controls the amount away from that edge the tooltip's root will shift.
  rootAlignOffset: 0

  # ##### Target Alignment
  #
  # Target alignment refers to the alignment of the pivot relative to the target of the tooltip.
  #
  # `targetAlign`: **String**; Possible values are `center` and `edge`. When set to `center`, the
  # pivot will be center aligned against the target. When set to `edge`, one of the pivot's edge
  # will be aligned against the pivot. See `targetAlignOffset` for the exact mechanics of the two
  # values. This value can also be specified on a per-region basis via
  # `[top|bottom|left|right]TargetAlign`, and if a region's specific value is absence, the value
  # from `targetAlign` will be used.
  targetAlign: "center"

  # `rootAlignOffset`: **Integer**
  #
  # If `targetAlign` is set to `center`, this attribute controls the clockwise distance from the
  # pivot the target will be effectively shift (i.e. the target will not move, but the pivot will
  # shift in the opposite direction). When this value is positive, the pivot will effectively shift
  # clockwise, and counter-clockwise when this value is negative.
  #
  # If `targetAlign` is set to `edge`, one of the target's edge will be aligned against the
  # pivot. When this attribute is positive, the clockwise edge will be used and the
  # counter-clockwise edge will be used when this attribute is negative. The absolute value of this
  # attribute controls the amount away from that edge the target will effectively shift.
  targetAlignOffset: 0

  # `render`: Render the tooltip's root (if not already rendered), content and insert the tooltip
  # into the DOM. If called repeately, only re-render the tooltip's content.
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

    @_insertToDOM()

  # `setTarget`: Set/update the tooltip's target. The target is the element to which the
  # tooltip will be pointing at.
  setTarget: (target) ->
    @$target = $(target)
    @target = @$target[0]

  # `setTooltipContent`: Set/update the tooltip's content. If `render` is set to `true` for
  # `options`, the `render()` method will be called to re-render the content.
  setTooltipContent: (content, options = {}) ->
    @tooltipContent = content
    @render() if options.render

  # `reposition`: Perform edge detection and position calculations to update the tooltip's
  # position.
  reposition: ->
    return unless @target

    @$root.width(@width)
    @$root.height(@height)
    @$root.css({
      minWidth: @minWidth
      minHeight: @minHeight
      maxWidth: @maxWidth
      maxHeight: @maxHeight
    })

    if @width == "auto" || @height == "auto"
      @content.style.position = "relative"

    @$tail.width(@tailWidth)
    @$tail.height(@tailHeight)

    @_updateRegion()
    @_updatePosition()

  # `show`: Show the tooltip. Also update the tooltip's `visible` attribute.
  show: ->
    return if @visible

    @render()
    @visible = true
    @root.style.opacity = 0
    @root.style.display = "block"

    _.delay =>
      @reposition()
      @root.style.opacity = 1
      @$root.addClass("animated") if @animated
      @trigger("show")
    , 16

  # `hide`: Hide the tooltip. Also update the tooltip's `visible` attribute.
  hide: ->
    return unless @visible

    @visible = false
    @root.style.display = "none"

    @trigger("hide")
    @$root.removeClass("animated")

  # `trigger`: Trigger an event from the root of the tooltip.
  trigger: (eventName) ->
    @$root.trigger("#{eventName}.flowtip")

  # `destroy()`: Remove the tooltip's root from DOM.
  destroy: ->
    @$root.remove() if @$root

  # ##### Private Methods
  #
  # *Hitherto shalt thou come, but no further.*

  # `_updateRegion`: Performs edge detection and place the tooltip in a different if the current one
  # it's in doesn't have enough space.
  _updateRegion: (position) ->
    @_region ||= @region
    @_region = @region if @persevere

    position = @_calculatePosition(@_region)
    rootDimension = @_rootDimension()
    parentParameter = @_parentParameter()
    targetParameter = @_targetParameter()

    switch @_region
      when "top"
        if position.top - @edgeOffset < parentParameter.top
          @_region = "bottom"
      when "bottom"
        if position.top + rootDimension.height + @edgeOffset > parentParameter.top + parentParameter.height
          @_region = "top"
      when "left"
        if position.left - @edgeOffset < parentParameter.left
          @_region = "right"
      when "right"
        if position.left + rootDimension.width + @edgeOffset > parentParameter.left + parentParameter.width
          @_region = "left"

    switch @_region
      when "top", "bottom"
        if (parentParameter.left + parentParameter.width) - (targetParameter.left + (targetParameter.width / 2)) - @edgeOffset < @rotationOffset
          @_region = "left"
        else if targetParameter.left + (targetParameter.width / 2) - parentParameter.left - @edgeOffset < @rotationOffset
          @_region = "right"
      when "left", "right"
        if (parentParameter.top + parentParameter.height) - (targetParameter.top + (targetParameter.height / 2)) - @edgeOffset < @rotationOffset
          @_region = "top"
        else if targetParameter.top + (targetParameter.height / 2) - parentParameter.top - @edgeOffset < @rotationOffset
          @_region = "bottom"

  # `_updatePosition`: Update tooltip's elements' positions.
  _updatePosition: (position) ->
    position = @_calculatePosition(@_region)

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
      @tail.style.top = "#{position.tail.top}px"
      @tail.style.left = "#{position.tail.left}px"
      @tail.style.width = "#{position.tail.width}px"
      @tail.style.height = "#{position.tail.height}px"
      @tail.className = "flowtip-tail #{@tailClassName} #{@_tailType(@_region)}"
    else
      @tail.style.display = "none"

  # `_calculatePosition`: Calculate the would-be position of the tooltip for the given region.
  _calculatePosition: (region) ->
    rootDimension = @_rootDimension()
    parentParameter = @_parentParameter()
    targetParameter = @_targetParameter()

    tailWidth = 0
    tailHeight = 0
    if @hasTail
      tailDimension = @_tailDimension(region)
      tailWidth = tailDimension.width
      tailHeight = tailDimension.height

    position = {}

    effectiveTargetOffset = if @targetOffsetFrom == "root"
      @targetOffset
    else if @targetOffsetFrom == "tail"
      if region == "top" || region == "bottom"
        tailHeight + @targetOffset
      else if region == "left" || region == "right"
        tailWidth + @targetOffset

    switch region
      when "top"
        position = {
          top: targetParameter.top - rootDimension.height - effectiveTargetOffset
          left: @_rootPivot(region, targetParameter, rootDimension)
          tail: { top: rootDimension.height }
        }
      when "bottom"
        position = {
          top: targetParameter.top + targetParameter.height + effectiveTargetOffset
          left: @_rootPivot(region, targetParameter, rootDimension)
          tail: { top: -(tailHeight) }
        }
      when "left"
        position = {
          top: @_rootPivot(region, targetParameter, rootDimension)
          left: targetParameter.left - rootDimension.width - effectiveTargetOffset
          tail: { left: rootDimension.width }
        }
      when "right"
        position = {
          top: @_rootPivot(region, targetParameter, rootDimension)
          left: targetParameter.left + targetParameter.width + effectiveTargetOffset
          tail: { left: -(tailWidth) }
        }

    switch region
      when "top", "bottom"
        if position.left < parentParameter.left + @edgeOffset
          position.left = parentParameter.left + @edgeOffset
        else if position.left + rootDimension.width > parentParameter.left + parentParameter.width - @edgeOffset
          position.left = parentParameter.left + parentParameter.width - rootDimension.width - @edgeOffset
      when "left", "right"
        if position.top < parentParameter.top + @edgeOffset
          position.top = parentParameter.top + @edgeOffset
        else if position.top + rootDimension.height > parentParameter.top + parentParameter.height - @edgeOffset
          position.top = parentParameter.top + parentParameter.height - rootDimension.height - @edgeOffset

    if @hasTail
      position.tail = switch region
        when "top"
          {
            top: rootDimension.height
            left: @_tailPivot(region, targetParameter, tailDimension, position)
          }
        when "bottom"
          {
            top: -(tailHeight)
            left: @_tailPivot(region, targetParameter, tailDimension, position)
          }
        when "left"
          {
            top: @_tailPivot(region, targetParameter, tailDimension, position)
            left: rootDimension.width
          }
        when "right"
          {
            top: @_tailPivot(region, targetParameter, tailDimension, position)
            left: -(tailWidth)
          }
      position.tail.width = tailWidth
      position.tail.height = tailHeight

    position

  _insertToDOM: ->
    # Ensure "appendTo" is "position"'ed
    if @appendTo.style.position == ""
      @appendTo.style.position = "relative"
    @appendTo.appendChild(@root)

  _renderContent: ->
    if typeof(@tooltipContent) == "string"
      $(@content).html(@tooltipContent)
    else
      @$tooltipContent = $(@tooltipContent)
      @content.innerHTML = ""
      if @$tooltipContent.length
        @content.appendChild(@$tooltipContent[0])

  _rootPivot: (region, targetParameter, rootDimension) ->
    targetPivot = @_targetPivot(region, targetParameter)

    rootAlign = @_rootAlign(region)
    rootAlignOffset = @_rootAlignOffset(region)

    if rootAlign == "center"
      pivot = if region == "top" || region == "bottom"
        targetPivot - (rootDimension.width / 2)
      else if region == "left" || region == "right"
        targetPivot - (rootDimension.height / 2)

      effectiveOffset = if region == "top" || region == "right"
        rootAlignOffset
      else if region == "bottom" || region == "left"
        -rootAlignOffset
    else if rootAlign == "edge"
      pivots = if region == "top" || region == "bottom"
        [targetPivot, targetPivot - rootDimension.width]
      else if region == "left" || region == "right"
        [targetPivot, targetPivot - rootDimension.height]

      positive = rootAlignOffset >= 0
      pivot = if region == "top" || region == "right"
        if positive then pivots[1] else pivots[0]
      else if region == "bottom" || region == "left"
        if positive then pivots[0] else pivots[1]

      effectiveOffset = if region == "top" || region == "right"
        rootAlignOffset
      else if region == "bottom" || region == "left"
        -rootAlignOffset

    return pivot + effectiveOffset + @_targetAlignmentOffset(region, targetParameter)

  _tailPivot: (region, targetParameter, tailDimension, rootPosition) ->
    targetPivot = @_targetPivot(region, targetParameter)

    pivot = if region == "top" || region == "bottom"
      targetPivot - rootPosition.left - (tailDimension.width / 2)
    else if region == "left" || region == "right"
      targetPivot - rootPosition.top - (tailDimension.height / 2)

    effectiveOffset = @_targetAlignmentOffset(region, targetParameter)

    return pivot + effectiveOffset

  _targetPivot: (region, targetParameter) ->
    targetAlign = @_targetAlign(region)
    targetAlignOffset = @_targetAlignOffset(region)

    if targetAlign == "center"
      pivot = if region == "top" || region == "bottom"
        targetParameter.left + (targetParameter.width / 2)
      else if region == "left" || region == "right"
        targetParameter.top + (targetParameter.height / 2)
    else if targetAlign == "edge"
      pivots = if region == "top" || region == "bottom"
        [targetParameter.left, targetParameter.left + targetParameter.width]
      else if region == "left" || region == "right"
        [targetParameter.top, targetParameter.top + targetParameter.height]

      positive = targetAlignOffset >= 0
      pivot = if region == "top" || region == "right"
        if positive then pivots[1] else pivots[0]
      else if region == "bottom" || region == "left"
        if positive then pivots[0] else pivots[1]

    return pivot

  _targetAlignmentOffset: (region, targetParameter) ->
    targetAlign = @_targetAlign(region)
    targetAlignOffset = @_targetAlignOffset(region)

    if targetAlign == "center"
      return if region == "top" || region == "right"
        targetAlignOffset
      else if region == "bottom" || region == "left"
        -targetAlignOffset
    else if targetAlign == "edge"
      positive = targetAlignOffset >= 0
      return if region == "top" || region == "right"
        -targetAlignOffset
      else if region == "bottom" || region == "left"
        targetAlignOffset

  _rootAlign: (region) ->
    this["#{region}RootAlign"] || @rootAlign

  _rootAlignOffset: (region) ->
    this["#{region}RootAlignOffset"] || @rootAlignOffset

  _targetAlign: (region) ->
    this["#{region}TargetAlign"] || @targetAlign

  _targetAlignOffset: (region) ->
    this["#{region}TargetAlignOffset"] || @targetAlignOffset

  _rootDimension: ->
    { width: @$root.width(), height: @$root.height() }

  _tailDimension: (region) ->
    dimension = if @tail.getAttribute("original-width") && @tail.getAttribute("original-height")
      { width: parseInt(@tail.getAttribute("original-width")), height: parseInt(@tail.getAttribute("original-height")) }
    else
      @tail.setAttribute("original-width", width = @$tail.width())
      @tail.setAttribute("original-height", height = @$tail.height())
      { width: width, height: height }

    if region == "left" || region == "right"
      { width: dimension.height, height: dimension.width }
    else
      dimension

  _tailType: (region) ->
    switch region
      when "top"
        return "bottom"
      when "bottom"
        return "top"
      when "left"
        return "right"
      when "right"
        return "left"

  _targetParameter: ->
    targetOffset = @$target.offset()
    parentOffset = @$appendTo.offset()

    {
      top: targetOffset.top - parentOffset.top
      left: targetOffset.left - parentOffset.left
      height: @$target.outerHeight()
      width: @$target.outerWidth()
    }

  _parentParameter: ->
    parentOffset = @$appendTo.offset()
    {
      top: parentOffset.top
      left: parentOffset.left
      height: @$appendTo.outerHeight()
      width: @$appendTo.outerWidth()
    }
