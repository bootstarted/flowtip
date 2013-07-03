$(function() {
  var started = false;
  var $container = $("#demo-container");
  var $target = $("<div />").addClass("flowtip-target").hide();
  $target.appendTo($("body"));

  var containerPos = $container.position();
  var containerParams = {
    top: containerPos.top,
    left: containerPos.left,
    width: $container.width(),
    height: $container.height()
  };

  var flowtip = null;

  var show_demo = function(options) {
    if (flowtip) {
      flowtip.hide();
      flowtip.destroy();
      flowtip = null;
    }

    options = $.extend({
      region: "top"
    }, options || {});

    update_code(options);

    flowtip = new FlowTip($.extend({
      width: 200,
      height: 80,
      persevere: false,
      appendTo: $container,
      targetOffsetFrom: "tail",
      targetOffset: 10,
      rotationOffset: 15,
      edgeOffset: 10,
      rootAlign: "center",
      rootAlignOffset: 0,
      targetAlign: "center",
      targetAlignOffset: 0
    }, options));
    flowtip.setTarget($target);
    if (started) {
      flowtip.show();
    }
  };

  var update_code = function(options) {
    var code = [];
    code.push("flowtip = new FlowTip({");
    var options_code = [];
    options_code.push("&nbsp;&nbsp;&nbsp;&nbsp;appendTo: $(...)");
    for (option in options) {
      options_code.push("&nbsp;&nbsp;&nbsp;&nbsp;" + option + ": " + options[option]);
    }
    code = code.concat(options_code.join(",<br />"));
    code.push("});");
    code.push("flowtip.setTarget(...);");
    code.push("flowtip.show();");
    $("#demo-code").html(code.join("<br />"));
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
        flowtip.show();
      }
      flowtip.reposition();
    }
  });

  $(window).resize(function() {
    if (started) {
      flowtip.reposition();
    }
  });

  $("#demo-modes a").on("click", function(event) {
    var mode = $(event.target).attr("data-demo-mode");
    if (mode == "standard") {
      show_demo();
    } else if (mode == "persevere") {
      show_demo({ persevere: true });
    } else if (mode == "edge-align") {
      show_demo({ rootAlign: "edge", rootAlignOffset: 20 });
    } else if (mode == "mixed-align") {
      show_demo({
        topRootAlign: "center", topRootAlignOffset: 0,
        rightRootAlign: "edge", rightRootAlignOffset: 20,
        bottomRootAlign: "edge", bottomRootAlignOffset: -20,
        leftRootAlign: "edge", leftRootAlignOffset: -20
      });
    } else if (mode == "target-align") {
      show_demo({ targetAlign: "center", targetAlignOffset: 10 });
    }
  });

  show_demo();
});
