var width = 1180;
//var height = 5800;
var height = 320;
var margin = 40;
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height-margin, 0]).domain([0,(height-margin)]);
var cname = "USA";
var sname = "Football";
var drawVideo = function(name, sport){
  
  if (name!="") {
    cname = name;
  };
  if (sport!="") {
    sname = sport;
  }
  // load data with queue
  var url1 = "./data/newcareertime.csv";
  var url2 = "./data/newnames.csv"; //the dataset only draw a link when # of medals is lager than 10

  var q = d3_queue.queue(1)
    .defer(d3.csv, url1)
    //.defer(d3.json, url2)
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

    // Format the data
    data[0].forEach(function(d) {
      d.Year = +d.Year;
    });
    // Filter the data
    data[0] = data[0].filter(function(d){
      return d.NOC===cname;
    });
    var mytime = d3.extent(data[0], function(d) { return d.Year; });

    x.domain(d3.extent(data[0], function(d) { return d.Year; }));

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
    data[1] = data[1].filter(function(d){
      return d.years.length>=2 ;
    })

    // console.log(data[0]);
    // console.log(data[1]);
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
      
    //};
    //console.log(summer[0][0][0]);
    // set the axises
    // set the ranges
    
    // draw points function
    var interv = height - margin;
    var draw = function(group1, group2){
      var me = svg.append("g").attr("class", "liandci")
                  .attr("transform", "translate(60" + ", 20" + ")")
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
          return "licircle"+d.ID + " y"+d.Year;
        })
        .attr("r", 2)
        .attr("cx", function(d) {
          // if (d.Year<1980) {
          //  console.log(d.Year);
          // };
          
          return x(d.Year);
        })
        .attr("cy", function(d) {
          return y(d.newid/group1.length*interv);
        })
        .style("fill", "white")
        .style("opacity", 0)
        // .on('mouseover', function (d){
        //   newX =  parseFloat(d3.select(this).attr('cx')) + 10;
        //   newY =  parseFloat(d3.select(this).attr('cy')) ;          
        //   tooltip
        //     .attr('x', newX)
        //     .attr('y', newY)
        //     .text(f(d.total))
        //     .transition().duration(200)
        //     .style('opacity', 1);
        // })
        // .on('mouseout', function(){
        //   tooltip.transition().duration(200)
        //     .style("opacity", 0);
        // })
        ;
      me.selectAll(".li")
        .data(group2)
        .enter()
        .append("line")
        .attr("class", "li")
        .attr("x1", function(d){
          return x(d.years[0]);
        })
        .attr("y1", function(d) {
          //var theid = d3.select("#" + "Basketball11992").attr("newid");
          //var theid = d3.select("#" + d.Sport + d.ID + d.years[0]).attr("newid");
          //var theid = 1;
          var theid = d3.select(".licircle" + d.ID).attr("newid");
          return y(theid/group1.length*interv);
        })
        // .attr("x2", function(d){
        //   return x(d.years[d.years.length-1]);
        // })
        .attr("x2", function(d){
          return x(d.years[0]);
        })
        .attr("y2", function(d) {
          //var theid = d3.select("#" + d.ID + d.years[0] + d.Sport).attr("newid");
          //var theid = 1;
          var theid = d3.select(".licircle" + d.ID).attr("newid");
          return y(theid/group1.length*interv );
        })
        .attr("stroke", "white")
        .attr("stroke-width", "1px");
    };

    
    draw(data[0], data[1]);

    // Add the X Axis
    var newtemp = (mytime[1] - mytime[0])/4;
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(60," + (height-20) + ")")
      .call(
        d3.axisBottom(x).tickFormat(d3.format(".4r")).ticks(newtemp)
      );

    // Add the Y Axis
    svg.append("g")
      .attr('class', 'axis')
      .attr("transform", "translate(60" + ", 20" + ")")
      .call(d3.axisLeft(y))

      ;
  
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
