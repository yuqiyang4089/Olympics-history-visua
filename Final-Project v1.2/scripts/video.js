var width = 1010;
//var height = 5800;
var height = 320;
var margin = 40;
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height-margin, 0]);
var c2 = d3.scaleOrdinal().range(["#4F94CD", "#FF6A6A"]).domain(["M", "F"]);
var cname = "CHN";
var sname = "Swimming";
var k = height / width;
    // x0 = [-4.5, 4.5],
    // y0 = [-4.5 * k, 4.5 * k],
    // x = d3.scaleLinear().domain(x0).range([0, width]),
    // y = d3.scaleLinear().domain(y0).range([height, 0]);
var drawVideo = function(name, sport){
  
  if (name!="") {
    cname = name;
  };
  if (sport!="") {
    sname = sport;
  }
  // load data with queue
  var url1 = "./data/newcareertime.csv";
  var url2 = "./data/newnewnames.csv"; //the dataset only draw a link when # of medals is lager than 10

  var q = d3_queue.queue(1)
    .defer(d3.csv, url1)
    .defer(d3.csv, url2)
    .awaitAll(mydraw);
  
  function mydraw(error, data) {
    if (error) throw error;
    // Add a new svg
    //d3.select("#video").remove();
    var svg = d3.select("body").append("svg")
        .attr("id", "video")
        .attr("width", "100%")
        .attr("height", height)
        ;

    var title  = svg.append("g").attr("id", "videotitle");
    title.append("text")
      .attr("y", "20px")
      .style("font-weight", "bold")
      .text("Athlete's Career");
    title.append("text")
      .attr("y", "40px")
      .text("Country: " + cname);
    title.append("text")
      .attr("y", "60px")
      .text("Sport: " + sname);

    // Format the data
    data[0].forEach(function(d) {
      d.Year = +d.Year;
    });
    // Filter the data
    data[0] = data[0].filter(function(d){
      return d.NOC===cname;
    });
    var mytime = d3.extent(data[0], function(d) { return d.Year; });

    var x0 = d3.extent(data[0], function(d) { return d.Year; })
    x.domain(x0);

    // data[0] = data[0].filter(function(d){
    //   return d.Year===year;
    // });
    data[0] = data[0].filter(function(d){
      return d.Sport===sname;
    });
    data[1] = data[1].filter(function(d){
      return d.NOC===cname;
    });
    data[1] = data[1].filter(function(d){
      return d.Sport===sname;
    });
    

    data[1].forEach(function(d) {
      d.years = [];
      for (var i = 0; i<data[0].length; i++){
        if (d.ID==data[0][i].ID&&d.Sport==data[0][i].Sport) {
          d.years.push(data[0][i].Year)
        };
      };
    })
    // data[1] = data[1].filter(function(d){
    //   return d.years.length>=2 ;
    // })


    // Group the data
    // var sumsport = ['Basketball', 'Judo', 'Football', 'Tug-Of-War', 'Athletics', 'Swimming', 'Badminton', 'Sailing', 
    //                 'Gymnastics', 'Art Competitions', 'Handball', 'Weightlifting', 'Wrestling', 'Water Polo', 'Hockey', 
    //                 'Rowing', 'Fencing', 'Equestrianism', 'Shooting', 'Boxing', 'Taekwondo', 'Cycling', 'Diving', 
    //                 'Canoeing', 'Tennis', 'Modern Pentathlon', 'Golf', 'Softball', 'Archery', 'Volleyball', 
    //                 'Synchronized Swimming', 'Table Tennis', 'Baseball', 'Rhythmic Gymnastics', 'Rugby Sevens', 
    //                 'Trampolining', 'Beach Volleyball', 'Triathlon', 'Rugby', 'Lacrosse', 'Polo', 'Cricket', 'Ice Hockey', 
    //                 'Racquets', 'Motorboating', 'Croquet', 'Figure Skating', 'Jeu De Paume', 'Roque', 'Basque Pelota', 
    //                 'Alpinism', 'Aeronautics'];
    // var winsport = ['Speed Skating', 'Cross Country Skiing', 'Ice Hockey', 'Biathlon', 'Alpine Skiing', 'Luge', 
    //                 'Bobsleigh', 'Figure Skating', 'Nordic Combined', 'Freestyle Skiing', 'Ski Jumping', 'Curling', 
    //                 'Snowboarding', 'Short Track Speed Skating', 'Skeleton', 'Military Ski Patrol', 'Alpinism'];
    // // these sports are filtered by python
    // var summer = [[],[]];
    // for (var i = 0; i<sumsport.length; i++){
    //   summer[0][i] = data[0].filter(function(d){
    //     return d.Sport===sumsport[i];
    //   })
    //   summer[1][i] = data[1].filter(function(d){
    //     return d.Sport===sumsport[i];
    //   })
    // };
    // var winter = [[],[]];
    // for (var i = 0; i<winsport.length; i++){
    //   winter[0][i] = data[0].filter(function(d){
    //     return d.Sport===winsport[i];
    //   })
    //   winter[1][i] = data[1].filter(function(d){
    //     return d.Sport===sumsport[i];
    //   })
    // };

    //for (var i = 0; i<summer[0].length; i++) {
      var temp = 1;
      if (data[0].length!=0) {
        data[0][0].newid = 0;
        for (var j = 1; j<data[0].length; j++) {
          if (data[0][j].ID==data[0][j-1].ID) {
            data[0][j].newid = data[0][j-1].newid;
          } else {
            data[0][j].newid = temp;
            temp = temp + 1;
          }       
        }
      }

      if (data[1].length!=0) {
        for (var j = 0; j<data[1].length; j++) {          
          data[1][j].newid = j;                
        }
      }

      var y0 = [0,data[1].length];
      y.domain(y0);
    
    //};
    //console.log(summer[0][0][0]);
    // set the axises
    // set the ranges
    
    // draw points function
    //var interv = height - margin;
    var draw = function(group1, group2){
      var me = svg.append("g").attr("class", "liandci")
                  .attr("transform", "translate(230" + ", 20" + ")")
                  ;
      me
        .append("line")
        .attr("id", "timeline")
        ;
      me.selectAll(".licircle")
        .data(group1)
        .enter()
        .append("circle")
        // .attr("id", function(d) {
        //   return d.Sport + d.ID + d.Year;
        // })
        //.attr("class", )
        .attr("newid", function(d) {
          return d.newid;
        })
        .attr("class", function(d) {
          return "videocircle" + " videoci-" + d.ID +" y" + d.Year;
        })
        .attr("r", 2)
        .attr("cx", function(d) {
          // if (d.Year<1980) {
          //  console.log(d.Year);
          // };
          
          return x(d.Year);
        })
        .attr("cy", function(d) {
          return y(d.newid);
        })
        .attr("fill", function(d){
          return c2(d.Sex);
        })
        .style("opacity", 0)
        .on("click", function(d){
          hlInPara1(d);
        })
        .on('mouseover', function(d){
          showDetail1(d);
        })
        .on('mouseout', function(){
          d3.select("#videotooltip").classed("hidden", true);
        })
        ;
      me.selectAll(".li")
        .data(group2)
        .enter()
        .append("line")
        .attr("class", "li")
        .attr("id", function(d){
          return "videoli-" + d.ID;
        })
        .attr("newid", function(d){
          var theid = d3.select(".videoci-" + d.ID).attr("newid");
          d.newid = theid;
          return d.newid;
        })
        .attr("x1", function(d){
          return x(d.years[0]);
        })
        .attr("y1", function(d, i) {
          //var theid = d3.select("#" + "Basketball11992").attr("newid");
          //var theid = d3.select("#" + d.Sport + d.ID + d.years[0]).attr("newid");
          //var theid = 1;
          var theid = d3.select(".videoci-" + d.ID).attr("newid");
          //return y(d.newid/group1.length*interv);
          return y(theid);
        })
        // .attr("x2", function(d){
        //   return x(d.years[d.years.length-1]);
        // })
        .attr("x2", function(d){
          return x(d.years[0]);
        })
        .attr("y2", function(d, i) {
          //var theid = d3.select("#" + d.ID + d.years[0] + d.Sport).attr("newid");
          //var theid = 1;
          var theid = d3.select(".videoci-" + d.ID).attr("newid");
          //return y(d.newid/group1.length*interv );
          return y(theid);
        })
        .attr("stroke", function(d){
          return c2(d.Sex);
        })
        .attr("stroke-width", "1px")
        .on("click", function(d){
          hlInPara2(d);
        })
        .on('mouseover', function(d){
          showDetail2(d);
        })
        .on('mouseout', function(){
          d3.select("#p2").remove();
          d3.select("#videotooltip").classed("hidden", true);
        });
    };

    
    draw(data[0], data[1]);

    // Add the X Axis
    var newtemp = (mytime[1] - mytime[0])/4;
    var xAxis = d3.axisBottom(x).tickFormat(d3.format(".4r")).ticks(newtemp),
    yAxis = d3.axisLeft(y);
    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(230," + (height-20) + ")")
      .call(xAxis);

    // Add the Y Axis
    svg.append("g")
      .attr('class', 'axis axis--x')
      .attr("transform", "translate(230" + ", 20" + ")")
      .call(yAxis)
      ;

    //////////////////////////////////// the sort function /////////////////////////////////////
    svg
      .append("rect")
      .attr("x", "10px")
      .attr("y", "75px")
      .attr("width", "35px")
      .attr("height", "20px")
      .attr("fill", "white")
      .attr("rx", "2px")
      .attr("ry", "2px")
      .on("click", function(){
        if (notSort) {
          sortPoints();
          notSort = false;
        } else {
          unsortPoints();
        } 
      });
    var notSort = true;
    svg
      .append("text")
      .attr("id", "sorttext")
      .attr("x", "27.5px")
      .attr("y", "90px")
      .style("fill", "black")
      .style("font-size", "13px")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Sort")
      .on("click", function(){
        if (notSort) {
          sortPoints();
          notSort = false;
        } else {
          unsortPoints();
          notSort = true;
        }       
      });

    // var brush = d3.brush().on("start", brushstart).on("end", brushended),
    //   idleTimeout,
    //   idleDelay = 350;
    // d3.select(".liandci").append("g")
    //   .attr("class", "brush")
    //   .call(brush);  
  };


};

function isinArray(arr, obj){   
  var b = false;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == obj) {
      b = true;
      break;
    }
  }
  return b;
}
function dotheupdate(year) {
  d3.selectAll(".y" + year).transition().duration(1000).style("opacity", 1);
  
  d3.selectAll(".li").each(function(d){
    if (isinArray(d.years, year)) {
        d3.select(this).transition().duration(1000).attr("x2", function(d){ return x(year); });
    };
  });
}

function drawCareer(name, sport) {
  drawVideo(name, sport);
  var upyear = 1896;
  if(upyear<=2016) {
              dataUpdatingInterval = setInterval(function() {
                  dotheupdate(upyear);
                  upyear = upyear + 2;
              }, 300);
          } else {
              clearInterval(dataUpdatingInterval);
          };
}

function sortPoints() {
  d3.select(".liandci").selectAll(".li")
    .sort(function(a,b) {
      var alen = (a.years[(a.years.length-1)] - a.years[0]);
      var blen = (b.years[(b.years.length-1)] - b.years[0]);
      return d3.ascending(alen, blen);
    })
    .attr("y1", function(d, i) {
      return y(i);
    })
    .attr("y2", function(d, i) {
      return y(i);
    });
  d3.selectAll(".videocircle")
    .attr("cy", function(d) {
      //console.log("#videoli-"+d.ID);
      var newy = d3.select("#videoli-"+d.ID).attr("y1");
      //var newy = "10px";
      return newy;
    });
  d3.select("#sorttext").text("Unsort");
}
function unsortPoints() {
  d3.select(".liandci").selectAll(".li")
    .attr("y1", function(d) {
      return y(d.newid);
    })
    .attr("y2", function(d, i) {
      return y(d.newid);
    });
  d3.select(".liandci").selectAll(".videocircle")
    .attr("cy", function(d) {
      var newy = d3.select("#videoli-"+d.ID).attr("y1");
      return newy;
    });
  d3.select("#sorttext").text("Sort");
}

function hlInPara1(d) {
  //console.log("I try to highlight!");
  d3.selectAll(".ath-" + d.ID).select(".year-" + d.Year)
    .attr("stroke", "red");
}
function hlInPara2(d) {
  d3.selectAll(".ath-" + d.ID)
    .attr("stroke", "red");
}

function showDetail1(d) {
  var xPosition = d3.event.pageX + 10 + 'px';
  var yPosition = d3.event.pageY - 10 + 'px'; 
  d3.select("#videotooltip")
    .style("left", function(){
      if ((d3.event.pageX + 150)>1260) {
        return d3.event.pageX - 180 + 'px';
      } else {
        return xPosition;
      }
    })
    .style("top", yPosition)
    .classed("hidden", false)
    .select("p")
    .text("Athlete: " + d.Name);
}
function showDetail2(d) {
  var xPosition = d3.event.pageX + 10 + 'px';
  var yPosition = d3.event.pageY - 10 + 'px'; 
  d3.select("#videotooltip")
    .style("left", function(){
      if ((d3.event.pageX + 150)>1260) {
        return d3.event.pageX - 180 + 'px';
      } else {
        return xPosition;
      }
    })
    .style("top", yPosition)
    .classed("hidden", false)
    .select("p")
    .text("Athlete: " + d.Name);
  d3.select("#videotooltip").append("p").attr("id", "p2").text("Years of entry: " + d.years);
}
d3.select("body").append("div")
  .attr("id", "videotooltip")
  .attr("class", "hidden")
  .append("p");

// function brushstart() {
//   d3.event.sourceEvent.stopPropagation();
// }

// function brushended() {
//   var s = d3.event.selection;
//   console.log(s);
//   if (!s) {
//     if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
//     x.domain(x0);
//     y.domain(y0);
//   } else {
//     x.domain([s[0].Year, s[1].Year].map(x.invert, x));
//     //y.domain([s[1][1], s[0][1]].map(y.invert, y));
//     svg.select(".brush").call(brush.move, null);
//   }
//   zoom();
// }

// function idled() {
//   idleTimeout = null;
// }

// function zoom() {
//   var t = svg.transition().duration(750);
//   svg.select(".axis--x").transition(t).call(xAxis);
//   svg.select(".axis--y").transition(t).call(yAxis);
//   d3.select(".liandci").selectAll(".li")
//     .attr("x1", function(d) { return x(d.years[0]);})
//     .attr("y1", function(d, i) {
//       return y(i);
//     })
//     .attr("x2", function(d) { return x(d.years[(d.years.length-1)]); })
//     .attr("y2", function(d, i) {
//       return y(i);
//     });
//   d3.select(".liandci").selectAll(".licircle")
//     .attr("cx", function(d) { return x(d.Year); })
//     .attr("cy", function(d) {
//       var newy = d3.select("#videoli-"+d.ID).attr("y1");
//       return newy;
//     });
// }

// drawCareer("", "");
