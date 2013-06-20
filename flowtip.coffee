# # FlowTip
#
# *A flexible, adaptable and easy to use tooltip positioning library.*
#
# [**Interactive Demo**](demo.html)
#
# [**GitHub Repo**/**Download**](https://github.com/qiushihe/flowtip)

# ### Glossaries
#
# The documentation and source of this library refers to several terms that may require clarification:
#
# **Tooltip**: An instance of **FlowTip** object.
#
# **Root**: The **root** of a tooltip refers to the element that contains both the tooltip's
# "content" element, and "tail" element.
#
# **Content (element)**: The container element for the tooltip's content.
#
# **Tail**: The tail of the tooltip. It's usually visualized as a pointy "nub" of sort.
#
# **Target**: The target is the thing the tooltip points to.
#
# **Region**: There are four different regions a tooltip could be in at any given time. The four
# regions are "top", "bottom", "left" and "right". Region is described relative to the target of
# the tooltip. For example, region "top" means the tooltip would appear above the target, and
# region "right" means the tooltip would appear to the right side of the target.
#
# **Pivot**: The pivot is a imaginary line that is aligned to the target and the tooltip's root is
# then in term aligned to the pivot.

class @FlowTip

  FlowTip: "2.0"

  # ### Create a FlowTip
  #
  # Creates an instance of the **FlowTip** object:
  #
  #     var tooltip = new FlowTip();
  #
  # An instance of the **FlowTip** can be created with options (see **Attributes** section below):
  #
  #     var myFlowTip = new FlowTip({
  #         region: "bottom"
  #         className: "my-tip"
  #         hasTail: false
  #     })
  #
  # At this point, the tooltip is not yet "attached" to a target. The tooltip's target can be set by
  # calling `setTarget`:
  #
  #     tooltip.setTarget(tooltipTarget);
  #
  # where `tooltipTarget` may be a DOM object or a jQuery selection.
  #
  # To make the tooltip visible, call `show`:
  #
  #     tooltip.show();
  #
  # This will render the tooltip is it's not already rendered, and position the tooltip in the
  # appropriate region (see `region` in **Attributes** section below) with proper alignments
  # (see **Alignments** section below).
  #
  # It's important to note that instances of **FlowTip** does **not** automatically re-position
  # themselves when their targets move. The responsibility of detecting target movement lies outside
  # the scope of this library. To update the tooltip's position against its target:
  #
  #     tooltip.reposition();
  constructor: (options = {}) ->
    @visible = false
    @target = null

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

  # `appendTo`: **Element**; The element within which the tooltip will be inserted into. Can be set
  # or updated by calling `setAppendTo`. Default value is the document's `body` and the tooltip
  # would thus be free to appear and move anywhere on the page and edge detection will only be
  # performed on the edge of the page.
  #
  # If `appendTo` is set to an element then edge detection will be performed on the edge of
  # the element instead.
  appendTo: null

  # `tooltipContent`: **String** or **Element**; The content of the tooltip. May be specified as
  # (HTML) string or DOM element. Can be set or updated by calling `setTooltipContent`.
  tooltipContent: null

  # `region`: **String**; The preferred region in which the tooltip will appear at first relative to
  # its target. Possibly values are: `top`, `bottom`, `left` and `right`.
  region: "top"

  # `persevere`: **Boolean**; If set to `true`, the tooltip will revert back to its preferred region
  # whenever there is enough space in that region. If set to `false`, the tooltip will remain in the
  # region edge detection puts it in, until edge detection changes it again.
  persevere: false

  # `hasTail`: **Boolean**; Controls if the tooltip's tail's visibility. When set to `false` the
  # tooltip's tail will be hidden and ignored for all positioning calculations.
  hasTail: true

  # `width`: **Integer**; Width of the tooltip's root. If set to `null`, the tooltip will expand to
  # fit its content's width.
  width: null

  # `height`: **Integer** or the string "auto"; Height of the tooltip's root. If set to `null`, the
  # tooltip will expand to fit its content's height. If set to `"auto"`, the tooltip's content will
  # be relatively positioned to allow possible scrolling.
  height: "auto"

  # `minWidth`: **String**; In the form of `42px`, or other forms accepted by CSS min-width.
  minWidth: null

  # `minHeight`: **String**; In the form of `42px`, or other forms accepted by CSS max-width.
  minHeight: null

  # `maxWidth`: **String**; In the form of `42px`, or other forms accepted by CSS min-height.
  maxWidth: null

  # `maxHeight`:**String**; In the form of `42px`, or other forms accepted by CSS max-height.
  maxHeight: null

  # `tailWidth`: **Integer**; Width of the tail element.
  tailWidth: 20

  # `tailHeight`: **Integer**; Height of the tail element.
  tailHeight: 10

  animated: false

  # `targetOffset`: **Integer**; The distance between the tooltip's root (or tip of the tail, see
  # `targetOffsetFrom` below) and the target's edge.
  targetOffset: 10

  # `rotationOffset`: **Integer**; The distance between the target's edge and the edge of the
  # boundary representative the tooltip's `appendTo` element. When this distance is smaller than
  # `rotationOffset`, edge detection will place the tooltip in an adjacent region (i.e. rotating the
  # tooltip).
  rotationOffset: 30

  # `edgeOffset`: **Integer**; The distance between the tooltip's root's edge and the edge of the
  # boundary representative the tooltip's `appendTo` element. When this distance is smaller than
  # `edgeOffset`, edge detection will place the tooltip in an opposite region (i.e. flipping the
  # tooltip).
  edgeOffset: 30

  # `targetOffsetFrom`: **String**; Possible values are `root` and `tail`. When set to `root`,
  # `targetOffset` will be calculated against the edge of the tooltip's root; When set to `tail`,
  # `targetOffset` will be calculated against the tip of the tail.
  targetOffsetFrom: "root"

  # ### Alignments
  #
  # Tool tip's alignments are divided into **root alignment** and **target alignment**, each with
  # a corresponding **offset** attribute that controls the direction of the alignment and offset
  # amount.
  #
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

  # `targetAlignOffset`: **Integer**
  #
  # If `targetAlign` is set to `center`, this value controls the clockwise distance from the center
  # of the target the pivot will shift. When this value is positive, the pivot will shift clockwise,
  # and counter-clockwise when this value is negative.
  #
  # If `targetAlign` is set to `edge`, the pivot will shift away from one of the target's edges.
  # When this value is positive, the clockwise edge will be used, and the counter-clockwise edge
  # will be used when this value is negative. The absolute value of this value controls the amount
  # of shifting.
  targetAlignOffset: 0

  # ##### Root Alignment
  #
  # Root alignment refers to the alignment of the tooltip's root relative to the pivot.
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
  # If `rootAlign` is set to `center`, this value controls the clockwise distance from the pivot the
  # tooltip's root will shift. When this value is positive, the root will shift clockwise, and
  # counter-clockwise when this value is negative.
  #
  # If `rootAlign` is set to `edge`, one of the tooltip's root's edge will be aligned against the
  # pivot. When this value is positive, the clockwise edge will be used, and the counter-clockwise
  # edge will be used when this value is negative. The absolute value of this value controls the
  # amount of shifting.
  rootAlignOffset: 0

  # `render`: Render the tooltip's root (if not already rendered), content and insert the tooltip
  # into the DOM. If called repeatedly, only re-render the tooltip's content.
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

  # `setAppendTo`: Set the tooltip's containing element. If the tooltip has already been rendered,
  # the tooltip will be moved/inserted into the new containing element.
  setAppendTo: (appendTo) ->
    @$appendTo = $(appendTo)
    @appendTo = @$appendTo[0]
    @_insertToDOM() if @$root

  # `setTarget`: Set the tooltip's target. The target is the element to which the tooltip will be
  # pointing at.
  setTarget: (target) ->
    @$target = $(target)
    @target = @$target[0]

  # `setTooltipContent`: Set the tooltip's content. If `render` is set to `true` for `options`, the
  # `render()` method will be called to re-render the content.
  setTooltipContent: (content, options = {}) ->
    @tooltipContent = content
    @render() if options.render

  # `reposition`: Perform edge detection and position calculations to update the tooltip's position.
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

  # `destroy`: Remove the tooltip's root from DOM.
  destroy: ->
    @$root.remove() if @$root

  # ##### Private Methods
  #
  # *Hitherto shalt thou come, but no further.*

  _updateRegion: (position) ->
    @_region ||= @region
    @_region = @region if @persevere

    position = @_calculatePosition(@_region)
    rootDimension = @_rootDimension()
    parentParameter = @_parentParameter()
    targetParameter = @_targetParameter()

    switch @_region
      when "top"
        if position.top - @edgeOffset < 0
          @_region = "bottom"
      when "bottom"
        if position.top + rootDimension.height + @edgeOffset > parentParameter.height
          @_region = "top"
      when "left"
        if position.left - @edgeOffset < parentParameter.left
          @_region = "right"
      when "right"
        if position.left + rootDimension.width + @edgeOffset > parentParameter.width
          @_region = "left"

    switch @_region
      when "top", "bottom"
        if (parentParameter.width) - (targetParameter.left + (targetParameter.width / 2)) - @edgeOffset < @rotationOffset
          @_region = "left"
        else if targetParameter.left + (targetParameter.width / 2) - @edgeOffset < @rotationOffset
          @_region = "right"
      when "left", "right"
        if (parentParameter.height) - (targetParameter.top + (targetParameter.height / 2)) - @edgeOffset < @rotationOffset
          @_region = "top"
        else if targetParameter.top + (targetParameter.height / 2) - @edgeOffset < @rotationOffset
          @_region = "bottom"

  _updatePosition: (position) ->
    position = @_calculatePosition(@_region)

    @root.style.top = "#{position.top + @$appendTo.scrollTop()}px"
    @root.style.left = "#{position.left + @$appendTo.scrollLeft()}px"

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
        if position.left < @edgeOffset
          position.left = @edgeOffset
        else if position.left + rootDimension.width > parentParameter.width - @edgeOffset
          position.left = parentParameter.width - rootDimension.width - @edgeOffset
      when "left", "right"
        if position.top < @edgeOffset
          position.top = @edgeOffset
        else if position.top + rootDimension.height > parentParameter.height - @edgeOffset
          position.top = parentParameter.height - rootDimension.height - @edgeOffset

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
    # Ensure "position" is explicitly defined on the appendTo element
    @appendTo.style.position = @$appendTo.css("position")
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
