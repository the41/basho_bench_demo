function statsSourceUrl(target, opts) {
  opts = opts || {};
  from = opts.from || "-2seconds";
  type = opts.type || "gauge"
  func = opts.func || "";

  open = "";
  close = "";
  if(func !== "") { open = "("; close = ")"; }

  if(type === "gauge") {
    type = "stats.gauges.";
  }
  else if(type === "counter") {
    type = "stats_counts.";
    type = "stats.";
  }

  return location.protocol + '//' + location.host + "/render/?from=" + from + "&format=json&noCache=true&_salt=1352477600.709&target=" + func + open + type + target + close;
}

  var description;
  description = {
    "Throughput": {
      source: statsSourceUrl("node_*.test.*_throughput", {"func": "sumSeries"}),
      refresh_interval: 1000,
      GaugeLabel: {
        parent: "#hero-two",
        title: "Throughput",
        unit: "req/s"
      }
    },
    "Latency": {
      source: statsSourceUrl("node_*.test.*_latency", {"func": "averageSeries"}),
      refresh_interval: 4000,
      GaugeGadget: {
        parent: "#hero-two",
        title: "LATENCY",
        to: 20
      }
    },
    "Errors": {
      source: statsSourceUrl("node_*.test.error_count", {"func": "sumSeries"}),
      refresh_interval: 1000,
      GaugeLabel: {
        parent: "#hero-four",
        title: "Error Count",
        value_format: "02d",
      }
    },
    "Object Count": {
      source: statsSourceUrl("cluster.riak.object_count"),
      refresh_interval: 1000,
      GaugeLabel: {
        parent: "#hero-three",
        title: "Object Count",
        value_format: ",02d",
      }
    },
    "Completion": {
      source: statsSourceUrl("cluster.test.completion"),
      refresh_interval: 1000,
      GaugeGadget: {
        parent: "#hero-three",
        title: "Complete",
        to: 100
      }
    },
    "Cluster Throughput": {
      source: statsSourceUrl("node_*.test.*_throughput", {"from": "-2minutes", "func": "sumSeries"}),
      refresh_interval: 2000,
      TimeSeries: {
        parent: "#cluster-throughput",
        title: "Cluster Throughput",
        num_labels: 0,
      },
    },
    "Cluster Latency": {
      source: statsSourceUrl("node_*.test.read_latency, node_*.test.write_latency", {"from": "-2minutes", "func": "averageSeries"}),
      refresh_interval: 2000,
      TimeSeries: {                
        parent: "#cluster-latency",            
        title: "Cluster Latency",
      },                                  
    },
    "Vnode Gets": {
      source: statsSourceUrl("node_*.riak.vnode_gets", {"from": "-5minutes"}),
      refresh_interval: 2000,
      TimeSeries: {
        parent: "#objects-per-node",
        title: "Vnode Gets",
      },                 
    }, 
    "Read Repairs": {
      source: statsSourceUrl("node_*.riak.read_repairs", {"from": "-2minutes"}),
      refresh_interval: 2000,
      TimeSeries: {
        parent: "#handoffs",
        title: "Read Repairs",
      },                 
    }, 

     "node_1":{source: statsSourceUrl("node_1.test.*_throughput", {"from": "-2minutes"}), refresh_interval: 2000, TimeSeries:{parent: "#g1-1", title: "node_1"}}, "node_3":{source: statsSourceUrl("node_3.test.*_throughput", {"from": "-2minutes"}), refresh_interval: 2000, TimeSeries:{parent: "#g1-2", title: "node_3"}}, "node_2":{source: statsSourceUrl("node_2.test.*_throughput", {"from": "-2minutes"}), refresh_interval: 2000, TimeSeries:{parent: "#g1-3", title: "node_2"}}, "node_4":{source: statsSourceUrl("node_4.test.*_throughput", {"from": "-2minutes"}), refresh_interval: 2000, TimeSeries:{parent: "#g2-1", title: "node_4"}},
  };


  var g = new Graphene;
(function() {
  g.build(description);


}).call(this);

$(document).ready(function(){
  $('#start-button').click(function(){
    $.get('/cgi-bin/write.sh');                                                                                                                                                                                                              
    $('#start-button').attr("disabled", true);
    return false;
  });                                                                                                                                                                                                                                        
  $('#verify-button').click(function(){
    $.get('/cgi-bin/verify.sh');                                                                                                                                                                                                             
    $('#verify-button').attr("disabled", true);
    return false;
  });                                                                                                                                                                                                                                        
  $('#delete-button').click(function(){
    $.get('/cgi-bin/delete.sh');                                                                                                                                                                                                             
    $('#delete-button').attr("disabled", true);
    return false;
  });                                                                                                                                                                                                                                        
  $('#reset-button').click(function(){
    $.get('/cgi-bin/stop.sh');                                                                                                                                                                                                               
    $('#start-button').attr("disabled", false);
    $('#verify-button').attr("disabled", false);
    $('#delete-button').attr("disabled", false);
    return false;
  });
  $("#stats-button").click(function() {
    $("#stats-modal").dialog("open");
  });

  //Adjust height of overlay to fill screen when page loads
  $("#dim").css("height", $(document).height());

  //When the link that triggers the message is clicked fade in overlay/msgbox
  $(".btn-orange").click(function(){
    $("#dim").fadeIn().delay(3000).fadeOut();
    return false;
  });

  $("#tabs").tabs({
    active: 0,
    heightStyle: "auto",
  });

  $("#stats-modal").dialog({
    autoOpen: false,
    width: 1010,
    modal: true,
  });

  // Swap the modal titlebar for the tabs interface
  $("#ui-tab-dialog-close").append($("a.ui-dialog-titlebar-close"));
  $("#stats-modal").addClass("ui-tabs").prepend($("#tab_buttons"))
  $('.ui-dialog-titlebar').remove();
  $('#tabs').addClass('ui-dialog-titlebar');
  
});

//Adjust height of overlay to fill screen when browser gets resized
$(window).bind("resize", function(){
  $("#dim").css("height", $(window).height());
});
