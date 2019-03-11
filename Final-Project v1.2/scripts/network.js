//the min threshold
var threshold = 10;
// load data with queue
var url1 = "./data/nodes.csv";
var url2 = "./data/newnewgold.csv"; //the dataset only draw a link when # of medals is lager than 10

var q = d3_queue.queue(1)
  .defer(d3.csv, url1)
  .defer(d3.csv, url2)
  .awaitAll(draw);

var networkcolor = ["#218868", "#FF6A6A", "#4F94CD"]; //green, red, blue
var networknodes = ["Countries", "Summer sports", "Winter sports"];
var c = d3.scaleOrdinal()
		.domain([0,1,2])
		.range(networkcolor) 
		//.range(["#FFC125", "#FF6A6A", "#4F94CD"]) //orange, red, blue
		;
function draw(error, data) {
	if (error) throw error;
	////////////////////////////////////////////////////////////////////
	///////////////////////// the control box //////////////////////////
	////////////////////////////////////////////////////////////////////
	
	var control = d3.select("body").append("div").attr("id", "control");
	control.append("svg").attr("id", "networktitle")
		.append("text")
		.attr("x", "90px")
		.attr("y", "20px")
		.text("Nation-sport Network")
		.style("font-size", "15px");

	
	////////////////////////////////// search a country/sport ///////////////////////////////
	var search = control.append("div").attr("id", "search");
	search.append("span").text("Search a country or a sport:").style("font-weight", "bold").style("color", "black");
	search.append("br")
	search.append("input").attr("type", "text").attr("id", "seinput");

	d3.select("#seinput").on("change", function() {
		var inputDom = document.getElementById("seinput");
		var text = inputDom.value;
		//如果Input值是空的显示所有的圆和线(没有进行筛选)
	    if (text == '') {
	        d3.selectAll("circle").style("opacity", 1);
	        d3.selectAll("line").style("opacity", 1);
	        d3.select("#network").selectAll('text').style("opacity", 1);
	    }
	    //否则判断判断三个元素是否等于name值，等于则显示该值
	    else {
	        var name = text;
	        //搜索所有的节点
	        d3.select("#network").selectAll('circle').each(function(d) {
	        	//输入节点id的小写等于name则显示，否则隐藏
	            if (d.id.toLowerCase()===name.toLowerCase()) {
	                d3.select("#network").selectAll("circle").style("opacity", 0.1);
	                d3.select("#network").selectAll("line").style("opacity", 0.1);
	                d3.select("#network").selectAll("text").style("opacity", 0);
	                d3.select("#network").select("#"+d.id).style("opacity", 1);
	                d3.select("#network").selectAll("."+d.id).style("opacity", 1);
			    	d3.select("#network").selectAll("."+d.id).each(function(p){
			    		if (typeof p.target !== 'undefined') {
				  			d3.select("#"+p.target.id).style("opacity",1);
							d3.select("#t"+p.target.id).style("opacity",1);
							d3.select("#"+p.source.id).style("opacity",1);
							d3.select("#t"+p.source.id).style("opacity",1);
						}
			    	})
	            }
	        });

	    }
	});

	////////////////////////////////// hide isolated nodes /////////////////////////////
	control
	  .append("div")
	  .attr("id", "check")
	  .append("input")
	  .attr("type", "checkbox")
	  .attr("id", "hidenodes");
	d3.select("#check")
	  .append("label")
	  .attr("for", "hidenodes")
	  .text("Hide the isolated nodes")
	  .style("font-weight", "bold")
	  .style("color", "black")
	  ;
	d3.select('#hidenodes')
	    .on('change', function() {
	        if(this.checked) {
	            d3.selectAll(".nolink").style("display", "none");
	        } else {
	            d3.selectAll(".nolink").style("display", "inline");
	        }
	    });

	////////////////////////////////// the user-filter slider /////////////////////////// 
	var sliderscale = d3.scaleLinear()
	    .domain([10, 100])
	    .range([0, 140])
	    .clamp(true);
	var slider = control.append("svg").attr("id", "slider")
		.append("g")
	    .attr("class", "slider")
	    .attr("transform", "translate(" + 10 + "," + 33 + ")")
	    ;
	d3.select("#slider")
		.append("text")
		.text("Filter by # of gold medals:")
		.style("font-size", "13px")
		.style("font-weight", "bold")
		.attr("transform", "translate(" + 0 + "," + 20 + ")")
		;
	slider.append("line")
	    .attr("class", "track")
	    .attr("x1", sliderscale.range()[0])
	    .attr("x2", sliderscale.range()[1])
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	    .attr("class", "track-inset")
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	    .attr("class", "track-overlay")
	    .call(d3.drag()
	        .on("start.interrupt", function() { slider.interrupt(); })
	        .on("start drag", function() { numgold(sliderscale.invert(d3.event.x)); }));
	slider.insert("g", ".track-overlay")
	    .attr("class", "ticks")
	    .attr("transform", "translate(0," + 16 + ")")
	  .selectAll("text")
	  .data(sliderscale.ticks(10))
	  .enter().append("text")
	    .attr("x", sliderscale)
	    .attr("text-anchor", "middle")
	    .text(function(d) { return d; })
	    .style("font-size", "8px");

	var handle = slider.insert("circle", ".track-overlay")
	    .attr("class", "handle")
	    .attr("r", 9);

	slider.transition() // Gratuitous intro!
	    .duration(750)
	    .tween("numgold", function() {
	      var i = d3.interpolate(10, 20);
	      return function(t) { numgold(i(t)); };
	    });
	d3.select("#slider")
		.append("text")
		.attr("id", "showthreshold")
		.style("font-size", "13px")
		.style("font-weight", "bold")
		.attr("transform", "translate(" + 0 + "," + 65 + ")")
		;

	function numgold(h) {
	  handle.attr("cx", sliderscale(h));
	  threshold = h;
	  d3.select("#showthreshold")
	  	.text("Current threshold: " + d3.format(".2r")(threshold));
	  drawNetwork(threshold);
	}

	////////////////////////////////////// the legend /////////////////////////////////////
	var legend  = control.append("svg").attr("id", "networklegend")
		// .attr("transform", "translate(" + 0 + "," + 20 + ")")
		;
	legend.selectAll("circle")
		.data(networkcolor).enter().append("circle")
		.attr("r", "8px")
		.attr("cx", "10px")
		.attr("cy", function(d,i){
			return (i*20+20) + "px";
		})
		.attr("fill", function(d){ return d; });
	legend.selectAll("text")
		.data(networknodes).enter().append("text")
		.attr("x", "25px")
		.attr("y", function(d,i){
			return (i*20+26) + "px";
		})
		.text(function(d){ return d; });
	legend.append("text")
		.style("font-size", "13px")
		.style("font-weight", "bold")
		.attr("y", "85px")
		.text("# of athletes in history:");

	legend.append("circle")
		.attr("r", Math.sqrt(25000/30))
		.attr("cx", "70px")
		.attr("cy", "120px")
		.attr("stroke", "black")
		.attr("stroke-width", "1px")
		.attr("fill", "white");
	legend.append("text")
		.style("text-anchor", "middle")
		.style("font-size", "9px")
		.attr("x", "70px")
		.attr("y", "157px")
		.text("25000");
	legend.append("circle")
		.attr("r", Math.sqrt(5000/30))
		.attr("cx", "70px")
		.attr("cy", "120px")
		.attr("stroke", "black")
		.attr("stroke-width", "1px")
		.attr("fill", "white");
	legend.append("text")
		.style("text-anchor", "middle")
		.style("font-size", "9px")
		.attr("x", "70px")
		.attr("y", "140px")
		.text("5000");
	legend.append("circle")
		.attr("r", Math.sqrt(100/30))
		.attr("cx", "70px")
		.attr("cy", "120px")
		.attr("stroke", "black")
		.attr("stroke-width", "1px")
		.attr("fill", "white");
	legend.append("text")
		.style("text-anchor", "middle")
		.style("font-size", "9px")
		.attr("x", "70px")
		.attr("y", "130px")
		.text("100");

	


	////////////////////////////////////// the main function /////////////////////////////////////
	function drawNetwork(threshold) {
		d3.select("#video").remove();
		d3.select(".parallelchart").remove(); 
		d3.select("#network").remove();
		 
		var svg = d3.select("body").append("svg")
				.attr("transform", "translate(170, 0)")
				.attr("id", "network")
				.attr("width", "88%")
				.attr("height", "100%");

		var width = 1110;
		var height = 650;
		newdata = data[1].filter(function(d){
			return d.value>=threshold;
		});
		//////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////// Draw the network ////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////
		var links = newdata.map(d => Object.create(d));
	  	var nodes = data[0].map(d => Object.create(d));

		var simulation = d3.forceSimulation(nodes)
	    .force("link", d3.forceLink(links).id(function(d) { return d.id; }))
	    .force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width /2, height / 2))
		    .force("collide", d3.forceCollide(20) )
		    ;

		// simulation.alpha(0.5);
		// simulation.velocityDecay(0.6);
		simulation.force("link")
	      .distance(200);
	    simulation.force("charge")
	      .strength(-10);

		function drag(simulation) {
		  
		  function dragstarted(d) {
		    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		    d.fx = d.x;
		    d.fy = d.y;
		  }
		  
		  function dragged(d) {
		    d.fx = d3.event.x;
		    d.fy = d3.event.y;
		  }
		  
		  function dragended(d) {
		    if (!d3.event.active) simulation.alphaTarget(0);
		    d.fx = null;
		    d.fy = null;
		  }
		  
		  return d3.drag()
		      .on("start", dragstarted)
		      .on("drag", dragged)
		      .on("end", dragended);
		}	
		var link = svg.append("g")
	      .attr("stroke", "#EDEDED")
	      .attr("stroke-opacity", 0.6)
	      .selectAll("line")
	      .data(links)
	      .enter()
	      .append("line")
	      .attr("stroke-width", function(d){
	      	return Math.sqrt(d.value)/3;
	      });

	  	var node = svg.append("g")
	      .attr("stroke", "#fff")
	      .attr("stroke-width", 1.5)
	      .selectAll("g")
	      .data(nodes)
	      .enter()
	      .append("g")
	      .attr("id", function(d){
	      	return "n-"+d.id;
	      })
	      .attr("class", "nolink");

	    node
	      .append("circle")
	      .attr("r", function(d){
	      	return Math.sqrt(d.pop/30);
	      })
	      .attr("fill", function(d){
	      	return c(d.group);
	      })
	      .attr("id", function(d){
	      	return d.id;
	      })
	      .on("mouseover", hovered)
	      .on("mouseout", unhovered)
	      .on("click", function(d){
	      	if (d.group==0) {
	      		// svg.attr("width", 0);
		      	// search.style("display", "none");
		      	d3.select("#video").remove();
		      	d3.select(".parallelchart").remove();     	
		      	d3.select(".parallelchart2").remove();     	
		      	drawCareer(d.id, "");
		      	drawParallelchart("", d.id);
	      	} else {
	      		d3.select("#video").remove();
		      	d3.select(".parallelchart").remove();  
		      	d3.select(".parallelchart2").remove();     	
	      		drawCareer("", d.id);
	      		drawParallelchart(d.id, "");
	      	}
	      	
	      })
	      .call(drag(simulation))
	      ;
	    node
	      .append("text")
	      .style("fill", function(d){
	      	return "white";
	      })
	      .style("stroke", "black")
	      .style("stroke-width", "0.6px")
	      .style("font-weight", "bold")
	      .style("text-anchor", "middle")
	      .style("font-size", "12px")
	      //.attr("translate", "transform(0, -20)")
	      .attr("class", function(d){
	      	return d.id;
	      })
	      .attr("id", function(d){
	      	return "t"+d.id;
	      })
	      .text(function(d){
	      	return d.id;
	      })
	      // .attr("fill", function(d){
	      // 	return c(d.group);
	      // })
	      // .attr("id", function(d){
	      // 	return d.id;
	      // })
	      ;
	     link
	      .attr("id", function(d,i){
	        d.id = i;
	        return "link-"+i;
	      })
	      .attr("class", function(d){
	      	return d.source.id+" "+d.target.id;
	      })
	      .attr("source", function(d){
	      	d3.select("#n-"+d.source.id).classed("nolink", false);
	      	return d.source.id;
	      })
	      .attr("target", function(d){
	      	d3.select("#n-"+d.target.id).classed("nolink", false);
	      	return d.target.id;
	      })
	      ;

	    simulation
	      .on("tick", ticked);
	    
	    function ticked() {
	    	link
		        .attr("x1", d => d.source.x)
		        .attr("y1", d => d.source.y)
		        .attr("x2", d => d.target.x)
		        .attr("y2", d => d.target.y);
	    	
		    var radius = 50;
		    var move = 30;
		    node.each(function(d,i){                
		    	d.x = d.x - radius < 0 ? radius : d.x ;                
		    	d.x = d.x + radius > width - move ? width - move - radius : d.x ;                
		    	d.y = d.y - radius < 0 ? radius : d.y ;                
		    	d.y = d.y + radius > height ? height - radius : d.y ;            
		    });
		    node.selectAll("circle")
		        .attr("cx", d => d.x)
		        .attr("cy", d => d.y);
		    node.selectAll("text")
		        .attr("x", d => d.x)
		        .attr("y", d => d.y - 3);

	    }
	    function hovered(d) {
	    	svg.selectAll("circle").style("opacity", 0.1);
	    	svg.selectAll("line").style("opacity", 0.1);
	    	node.selectAll("text").style("opacity", 0);
	    	d3.select(this).style("opacity", 1);
	    	//var chosen = d3.select(this).attr("id");
	    	// console.log(d.id);
	    	d3.selectAll("."+d.id).style("opacity", 1)
	    	d3.selectAll("."+d.id).each(function(p){
	    		if (typeof p.target !== 'undefined') {
		  			d3.select("#"+p.target.id).style("opacity",1);
					d3.select("#t"+p.target.id).style("opacity",1);
					d3.select("#"+p.source.id).style("opacity",1);
					d3.select("#t"+p.source.id).style("opacity",1);
				}
	    		
	    	})


	    }
	    function unhovered() {
	    	svg.selectAll("circle").style("opacity", 1);
	    	svg.selectAll("line").style("opacity", 1);
	    	node.selectAll("text").style("opacity", 1);
	    }
	}
	drawNetwork(threshold);
}

