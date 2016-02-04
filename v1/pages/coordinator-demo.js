$(function() {
  var started = false;
  var $container = $("#demo-container");
  var $root = $(".flowtip.with-coordinator");
  var $tail = $(".flowtip.with-coordinator .flowtip-tail");
  var $target = $("<div />").addClass("flowtip-target").hide();
  $target.appendTo($("body"));

  var containerPos = $container.position();
  var containerParams = {
    top: containerPos.top,
    left: containerPos.left,
    width: $container.width(),
    height: $container.height()
  };

  // var flowtip = null;
  var coordinator = null;

  var show_demo = function(options) {
    coordinator = FlowTip.CoordinatorFactory.GetDefaultInstance().CreateCoordinator({
      tooltipOptions: {
        targetOffsetFrom: "tail",
        targetOffset: 10,
        rotationOffset: 15,
        edgeOffset: 10
      },
      tooltipRoot: $root,
      tooltipTail: $tail,
      tooltipParent: $container,
      tooltipTargetType: "element",
      tooltipTarget: $target
    });
  };

  var update_position = function() {
    var position = coordinator.calculatePosition();
    $root[0].style.top = position.top + "px";
    $root[0].style.left = position.left + "px";

    if (position.tail) {
      $tail[0].style.display = "block";
      $tail[0].style.top = position.tail.top + "px";
      $tail[0].style.left = position.tail.left + "px";
      $tail[0].style.width = position.tail.width + "px";
      $tail[0].style.height = position.tail.height + "px";
    } else {
      $tail[0].style.display = "none";
    }
  };

  $("body").mousemove(function(event) {
    if (event.pageX > containerParams.left &&
        event.pageX < containerParams.left + containerParams.width &&
        event.pageY > containerParams.top &&
        event.pageY < containerParams.top + containerParams.height)
    {
      $target[0].style.top = (event.pageY - 9) + "px";
      $target[0].style.left = (event.pageX - 9) + "px";
      if (!started) {
        started = true;
        $target.show();
      }
      update_position();
    }
  });

  $(window).resize(function() {
    if (started) {
      update_position();
    }
  });

  show_demo();
});
