// load data with queue
var url1 = "./data/nodes.csv";
var url2 = "./data/newnewgold.csv"; //the dataset only draw a link when # of medals is lager than 10

var q = d3_queue.queue(1)
  .defer(d3.csv, url1)
  //.defer(d3.json, url2)
  .defer(d3.csv, url2)
  .awaitAll(draw);


var c = d3.scaleOrdinal()
		.domain([0,1,2])
		.range(["#218868", "#FF6A6A", "#4F94CD"]) //green, red, blue
function draw(error, data) {
	if (error) throw error;

	d3.select("#network").remove();
	var svg = d3.select("body").append("svg")
			.attr("transform", "translate(100, 0)")
			.attr("id", "network")
			.attr("width", "92%")
			.attr("height", "100%");
	var width = 1210;
	var height = 650;
	
	////////////////////////////////////////////////////////////////////
	///////////////////////// the control box //////////////////////////
	////////////////////////////////////////////////////////////////////
	var control = d3.select("body").append("div").attr("id", "control");
	var search = control.append("div").attr("id", "search");
	search.append("span").text("Search a country or a sport:").style("font-weight", "bold").style("color", "black");
	search.append("br")
	search.append("input").attr("type", "text").attr("id", "seinput");
	
	d3.select("#seinput").on("change", function() {
		var inputDom = document.getElementById("seinput");
		var text = inputDom.value;
		//如果Input值是空的显示所有的圆和线(没有进行筛选)
	    if (text == '') {
	        //d3.select('#svg1 .texts').selectAll('text').classed('inactive', false);
	        svg.selectAll('circle').classed('inactive', false);
	        svg.selectAll('line').classed('inactive', false);
	        svg.selectAll('text').classed('inactive', false);
	        d3.selectAll("circle").style("opacity", 1);
	        d3.selectAll("line").style("opacity", 1);
	        svg.selectAll('text').style("opacity", 1);
	    }
	    //否则判断判断三个元素是否等于name值，等于则显示该值
	    else {
	        var name = text;
	        //搜索所有的节点
	        svg.selectAll('circle').classed('inactive', function(d) {
	        	//输入节点id的小写等于name则显示，否则隐藏
	            if (d.id.toLowerCase()===name.toLowerCase()) {
	                svg.selectAll("circle").style("opacity", 0.1);
	                svg.selectAll("line").style("opacity", 0.1);
	                svg.selectAll("text").style("opacity", 0);
	                svg.select("#"+d.id).style("opacity", 1);
	                svg.selectAll("."+d.id).style("opacity", 1);
			    	svg.selectAll("."+d.id).each(function(p){
			    		svg.select("#"+p.target.id).style("opacity",1);
			    		svg.select("#t"+p.target.id).style("opacity",1);
			    		svg.select("#"+p.source.id).style("opacity",1);
			    		svg.select("#t"+p.source.id).style("opacity",1);
			    	})

	                return false;
	            } else {
	                return true; //隐藏
	            }
	        });

	    }
	});
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

	///////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////// Draw the network /////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	var links = data[1].map(d => Object.create(d));
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
      		//svg.attr("width", 0);
	      	//search.style("display", "none");
	      	d3.select("#video").remove();
	      	d3.select(".parallelchart").remove();     	
	      	drawCareer(d.id, "");
	      	drawParallelchart("", d.id);
      	} else if (d.group==1) {
      		d3.select("#video").remove();
	      	d3.select(".parallelchart").remove();  
      		drawCareer("", d.id);
      		drawParallelchart(d.id, "");
      	}
      	
      })
      .call(drag(simulation))
      ;
    node
      .append("text")
      .style("fill", function(d){
      	return c(d.group);
      })
      .style("stroke", "#DBDBDB")
      .style("stroke-width", "0.5px")
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
    	
	    var radius = 20;
	    var move = 70;
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
    	// if (d3.selectAll("."+d.id).attr("source")==d.id) {
    	// 	var ta = d3.selectAll("."+d.id).attr("target");
    	// 	d3.select("#"+ta).style("opacity", 1);
    	// } else {
    	// 	if (d3.selectAll("."+d.id).attr("target")==d.id) {
    	// 		var so = d3.selectAll("."+d.id).attr("source");
    	// 		d3.select("#"+so).style("opacity", 1);
    	// 	}
    		
    	// }

    }
    // function highlight(edge) {
    // 	// if (id==d3.select)
    // 	console.log(edge);
    // }
    function unhovered() {
    	svg.selectAll("circle").style("opacity", 1);
    	svg.selectAll("line").style("opacity", 1);
    	node.selectAll("text").style("opacity", 1);
    }
    // invalidation.then(() => simulation.stop());
}

