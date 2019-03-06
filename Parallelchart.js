

var Sport = "Swimming"
var Nname = "USA"
var drawParallelchart = function(sporttname,nation){
 if(sporttname != ""){
    Sport = sporttname
 } 
 if(nation !=""){
     Nname = nation
 }
 
console.log(Sport)
console.log(Nname)

var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 1260 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scalePoint().rangeRound([0, width]). padding(1),
    y = {},
    dragging = {};

var line = d3.line(),
    axis = d3.axisLeft(x),
    background,
    foreground;
var sex = d3.scaleOrdinal().domain(["M","F"]).range([0,1]);

var medal = d3.scaleOrdinal().domain(["Gold","Silver","Bronze","perfect"]).range([0,1,2,3]);

var svg = d3.select("body").append("svg").attr("class","parallelchart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("./data/parallel_non-NA.csv", function(error, data) {
  data= data.filter(function(d){return d.Sport == Sport && d.Medal!="NA"})
   
    data.forEach(function(d){
      d.Sex = sex(d.Sex)
      d.Medal = medal(d.Medal);
     })
  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    return d != "ID" && d!="Sport" && d!="NOC" &&(y[d] = d3.scaleLinear() 
        .domain(d3.extent(data, function(p) { return +p[d]; }))
        .range([height, 0]));
  })); 
  mydata = data.filter(function(d){return d.Sex==1 && d.Year==2016 && d.Medal==0&& d.Sport==Sport})

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(data)
    .enter()
    .append("path")
      .attr("d", path)
      .attr("stroke", function(d){
        if (d.NOC==Nname) {
          return "#218868";
        } else if (d.NOC=="AAA") {
          return "red";
        } else {
          return "white";
        }
      })
      .style("opacity",function(d){
        if (d.NOC!=Nname&&d.NOC!="AAA"){
          return 0.05;
        }
      });

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.drag()
        .subject(function(d) { return {x: x(d)}; })
        .on("start", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("end", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
              .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  var text_sex = (["F","M"]);
  var text_medal=(["Gold","Silver","Bronze","perfect"]);
  
  g.append("g")
      .attr("class", "axis")
      .each(function(d,i) {
        if (i==0) {
           d3.select(this).call(d3.axisLeft(y[d]).ticks(1));
          d3.select(this)
          .append("g")
          .selectAll("text")
          .data(text_sex)
          .enter()
          .append("text")
          .style("opacity", 1)
          .text(function(p){
            return p;
          })
          .attr("transform", function(p,i){
            if (i == 0 ) {
              return "translate(0, 0.5)";
            } else {
              return "translate(0,460.5)";
            }
          })
          ;
        }else if (i==4) {
          d3.select(this).call(d3.axisLeft(y[d]).ticks(26));
        } 
        else if (i==5) {
           d3.select(this).call(d3.axisLeft(y[d]).ticks(3));
           d3.select(this)
          .append("g")
          .selectAll("text")
          .data(text_medal)
          .enter()
          .append("text")
          .style("opacity", 1)
          .text(function(p){
            return p;
          })
          .attr("transform", function(p,i){
            if (i == 0 ) {
              return "translate(0, 460.5)";
            } else if(i==1) {
              return "translate(0,307.166)";
            }else if (i==2) {
              return "translate(0,153.833)";
            }
            else{
               return "translate(0,0.5)";
            }
          })
          ;
        } else {
           d3.select(this).call(d3.axisLeft(y[d]));
        };
       
        d3.select(this).attr("id",function(d){return d});
       })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });
// d3.select("#Sex").selectAll(".tick")
//        .append("text")
//        .style("text-anchor", "middle")
//        .attr("y", -9)
//        .text(function(d){return text_sex})
  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.brushY().extent([[-8, 0], [8,height]]).on("start", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
});
d3.s


function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
 
    const actives = [];
  // filter brushed extents
  svg.selectAll('.brush')
    .filter(function(d) {
      return d3.brushSelection(this);
    })
    .each(function(d) {
      actives.push({
        dimension: d,
        extent: d3.brushSelection(this)
      });
    });
  // set un-brushed foreground line disappear
  foreground.style('display', function(d) {
    return actives.every(function(active) {
      const dim = active.dimension;
      return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
    }) ? null : 'none';
  });
 } 
}
 drawParallelchart("","");
// function brush() {
//   var actives = dimensions.filter(function(p) { return d3.brushSelection(y[p]) !== null;}),
//       extents = actives.map(function(p) { return y[p].brush.extent(); });
//   foreground.style("display", function(d) {
//     return actives.every(function(p, i) {
//       return extents[i][0] <= d[p] && d[p] <= extents[i][1];
//     }) ? null : "none";
//   });
// }
//}