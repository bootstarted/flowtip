class @FlowTip.Coordinator
  @TooltipOptions = [
    "region", "persevere",
    "targetOffset", "targetOffsetFrom", "rotationOffset", "edgeOffset",
    "rootAlign", "rootAlignOffset", "topRootAlignOffset", "bottomRootAlignOffset", "leftRootAlignOffset", "rightRootAlignOffset",
    "targetAlign", "targetAlignOffset", "topTargetAlignOffset", "bottomTargetAlignOffset", "leftTargetAlignOffset", "rightTargetAlignOffset",
    "topDisabled", "bottomDisabled", "leftDisabled", "rightDisabled", "hideInDisabledRegions"
  ]

  tooltipTargetType: "element" # or "rect"

  constructor: (options = {}) ->
    @tooltipOptions = _.defaults(options.tooltipOptions || {}, {
      region: "top"
      targetOffset: 10
      targetOffsetFrom: "root"
      edgeOffset: 30
      rotationOffset: 30
      targetAlign: "center"
      targetAlignOffset: 0
      rootAlign: "center"
      rootAlignOffset: 0
    })
    @$tooltipRoot = $(options.tooltipRoot)
    @$tooltipTail = $(options.tooltipTail)
    @$tooltipParent = $(options.tooltipParent)

    @tooltipTargetType = options.tooltipTargetType
    @tooltipTarget = options.tooltipTarget
    if @tooltipTargetType == "element"
      @$tooltipTarget = $(@tooltipTarget)

  calculatePosition: (region) ->
    @_updateRegion() unless region
    @_calculatePosition(region || @_region)

  currentRegion: ->
    @_region

  _rootAlign: (region) ->
    @tooltipOptions["#{region}RootAlign"] || @tooltipOptions.rootAlign

  _rootAlignOffset: (region) ->
    @tooltipOptions["#{region}RootAlignOffset"] || @tooltipOptions.rootAlignOffset

  _targetAlign: (region) ->
    @tooltipOptions["#{region}TargetAlign"] || @tooltipOptions.targetAlign

  _targetAlignOffset: (region) ->
    @tooltipOptions["#{region}TargetAlignOffset"] || @tooltipOptions.targetAlignOffset

  _availableRegion: (region) ->
    !@tooltipOptions["#{region}Disabled"]

  _fitsInRegion: (region) ->
    position = @_calculatePosition(region)
    rootDimension = @_rootDimension()
    parentParameter = @_parentParameter()

    switch region
      when "top"
        position.top - @tooltipOptions.edgeOffset >= 0
      when "bottom"
        position.top + rootDimension.height + @tooltipOptions.edgeOffset <= parentParameter.height
      when "left"
        position.left - @tooltipOptions.edgeOffset >= 0
      when "right"
        position.left + rootDimension.width + @tooltipOptions.edgeOffset <= parentParameter.width

  _availableAndFitsIn: (regions, regionParameter, _first) ->
    _first ||= regions[0]
    region = regions[0]

    if !regions || regions.length <= 0
      # Return the first region if `hideInDisabledRegions` is `true`, and in which case the tooltip
      # will be hidden by `_updatePosition`.
      return if @tooltipOptions.hideInDisabledRegions then _first else @_region

    if regionParameter[region].availables && regionParameter[region].fits
      return region
    else
      return @_availableAndFitsIn(regions.slice(1), regionParameter, _first)

  _rootDimension: ->
    { width: @$tooltipRoot.width(), height: @$tooltipRoot.height() }

  _tailDimension: (region) ->
    @_tailOriginalWidth = @$tooltipTail.width() unless @_tailOriginalWidth
    @_tailOriginalHeight = @$tooltipTail.height() unless @_tailOriginalHeight

    dimension = { width: @_tailOriginalWidth, height: @_tailOriginalHeight }

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

  _parentParameter: ->
    parentOffset = @$tooltipParent.offset()
    {
      top: parentOffset.top
      left: parentOffset.left
      height: @$tooltipParent.outerHeight()
      width: @$tooltipParent.outerWidth()
      scrollTop: @$tooltipParent.scrollTop()
      scrollLeft: @$tooltipParent.scrollLeft()
    }

  _targetParameter: ->
    parentOffset = @$tooltipParent.offset()

    if @tooltipTargetType == "rect"
      {
        top: @tooltipTarget.top - parentOffset.top
        left: @tooltipTarget.left - parentOffset.left
        height: @tooltipTarget.bottom - @tooltipTarget.top
        width: @tooltipTarget.right - @tooltipTarget.left
      }
    else
      targetOffset = @$tooltipTarget.offset()
      {
        top: targetOffset.top - parentOffset.top
        left: targetOffset.left - parentOffset.left
        height: @$tooltipTarget.outerHeight()
        width: @$tooltipTarget.outerWidth()
      }

  _regionParameter: ->
    {
      top: {
        fits: @_fitsInRegion("top")
        availables: @_availableRegion("top")
      }
      bottom: {
        fits: @_fitsInRegion("bottom")
        availables: @_availableRegion("bottom")
      }
      left: {
        fits: @_fitsInRegion("left")
        availables: @_availableRegion("left")
      }
      right: {
        fits: @_fitsInRegion("right")
        availables: @_availableRegion("right")
      }
    }

  _targetAlignmentOffset: (region) ->
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

  _tailPivot: (region, targetParameter, tailDimension, rootPosition) ->
    targetPivot = @_targetPivot(region, targetParameter)

    pivot = if region == "top" || region == "bottom"
      targetPivot - rootPosition.left - (tailDimension.width / 2)
    else if region == "left" || region == "right"
      targetPivot - rootPosition.top - (tailDimension.height / 2)

    effectiveOffset = @_targetAlignmentOffset(region)

    return pivot + effectiveOffset

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

    return pivot + effectiveOffset + @_targetAlignmentOffset(region)

  _calculatePosition: (region) ->
    hasTail = @$tooltipTail.length > 0
    rootDimension = @_rootDimension()
    parentParameter = @_parentParameter()
    targetParameter = @_targetParameter()

    tailWidth = 0
    tailHeight = 0
    if hasTail
      tailDimension = @_tailDimension(region)
      tailWidth = tailDimension.width
      tailHeight = tailDimension.height

    position = {}

    effectiveTargetOffset = if @tooltipOptions.targetOffsetFrom == "root"
      @tooltipOptions.targetOffset
    else if @tooltipOptions.targetOffsetFrom == "tail"
      if region == "top" || region == "bottom"
        tailHeight + @tooltipOptions.targetOffset
      else if region == "left" || region == "right"
        tailWidth + @tooltipOptions.targetOffset

    switch region
      when "top"
        position = {
          top: targetParameter.top - rootDimension.height - effectiveTargetOffset
          left: @_rootPivot(region, targetParameter, rootDimension)
        }
        position.tail = { top: rootDimension.height } if hasTail
      when "bottom"
        position = {
          top: targetParameter.top + targetParameter.height + effectiveTargetOffset
          left: @_rootPivot(region, targetParameter, rootDimension)
        }
        position.tail = { top: -(tailHeight) } if hasTail
      when "left"
        position = {
          top: @_rootPivot(region, targetParameter, rootDimension)
          left: targetParameter.left - rootDimension.width - effectiveTargetOffset
        }
        position.tail = { left: rootDimension.width } if hasTail
      when "right"
        position = {
          top: @_rootPivot(region, targetParameter, rootDimension)
          left: targetParameter.left + targetParameter.width + effectiveTargetOffset
        }
        position.tail = { left: -(tailWidth) } if hasTail

    switch region
      when "top", "bottom"
        if position.left < @tooltipOptions.edgeOffset
          position.left = @tooltipOptions.edgeOffset
        else if position.left + rootDimension.width > parentParameter.width - @tooltipOptions.edgeOffset
          position.left = parentParameter.width - rootDimension.width - @tooltipOptions.edgeOffset
      when "left", "right"
        if position.top < @tooltipOptions.edgeOffset
          position.top = @tooltipOptions.edgeOffset
        else if position.top + rootDimension.height > parentParameter.height - @tooltipOptions.edgeOffset
          position.top = parentParameter.height - rootDimension.height - @tooltipOptions.edgeOffset

    if hasTail
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
      position.tail.top = Math.round(position.tail.top)
      position.tail.left = Math.round(position.tail.left)
      position.tail.width = tailWidth
      position.tail.height = tailHeight
      position.tail.type = @_tailType(@_region)

    position.hidden = !@_availableRegion(@_region)
    position.top = Math.round(position.top) + parentParameter.scrollTop
    position.left = Math.round(position.left) + parentParameter.scrollLeft
    position

  _updateRegion: (position) ->
    @_region ||= @tooltipOptions.region
    @_region = @tooltipOptions.region if @tooltipOptions.persevere

    parentParameter = @_parentParameter()
    targetParameter = @_targetParameter()
    regionParameter = @_regionParameter()

    # Edge detection - flip
    if @_region == "top" && !regionParameter.top.fits
      @_region = @_availableAndFitsIn(["bottom", "left", "right"], regionParameter)
    else if @_region == "bottom" && !regionParameter.bottom.fits
      @_region = @_availableAndFitsIn(["top", "left", "right"], regionParameter)
    else if @_region == "left" && !regionParameter.left.fits
      @_region = @_availableAndFitsIn(["right", "top", "bottom"], regionParameter)
    else if @_region == "right" && !regionParameter.right.fits
      @_region = @_availableAndFitsIn(["left", "top", "bottom"], regionParameter)

    # Edge detection - squeeze
    if @_region in ["top", "bottom"] && !regionParameter.top.fits && !regionParameter.bottom.fits
      @_region = @_availableAndFitsIn(["left", "right"], regionParameter)
    else if @_region in ["left", "right"] && !regionParameter.left.fits && !regionParameter.right.fits
      @_region = @_availableAndFitsIn(["top", "bottom"], regionParameter)

    # Edge detection - rotate
    rotateOptions = switch @_region
      when "top", "bottom"
        if (parentParameter.width) - (targetParameter.left + (targetParameter.width / 2)) - @tooltipOptions.edgeOffset < @tooltipOptions.rotationOffset
          if @_region == "top" then ["left", "bottom"] else ["left", "top"]
        else if targetParameter.left + (targetParameter.width / 2) - @tooltipOptions.edgeOffset < @tooltipOptions.rotationOffset
          if @_region == "top" then ["right", "bottom"] else ["right", "top"]
      when "left", "right"
        if (parentParameter.height) - (targetParameter.top + (targetParameter.height / 2)) - @tooltipOptions.edgeOffset < @tooltipOptions.rotationOffset
          if @_region == "left" then ["top", "right"] else ["top", "left"]
        else if targetParameter.top + (targetParameter.height / 2) - @tooltipOptions.edgeOffset < @tooltipOptions.rotationOffset
          if @_region == "left" then ["bottom", "right"] else ["bottom", "left"]
    if rotateOptions
      @_region = @_availableAndFitsIn(rotateOptions, regionParameter)

@FlowTip.CoordinatorFactory =
  GetDefaultInstance: =>
    {
      CreateCoordinator: (options = {}) =>
        new @FlowTip.Coordinator(options)
    }

