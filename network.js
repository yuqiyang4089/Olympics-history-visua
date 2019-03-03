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
		.range(["black", "red", "blue"])
function draw(error, data) {
	if (error) throw error;

	d3.select("#network").remove();
	var svg = d3.select("body").append("svg")
			.attr("id", "network")
			.attr("width", "100%")
			.attr("height", "100%");
	var width = 1260;
	var height = 650;
	
	var search = d3.select("body").append("div").attr("id", "search");
	search.append("span").text("Search a country or a sport:");
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
	        d3.selectAll("circle").style("opacity", 1);
	        d3.selectAll("line").style("opacity", 1);
	    }
	    //否则判断判断三个元素是否等于name值，等于则显示该值
	    else {
	        var name = text;
	        //搜索所有的节点
	        svg.selectAll('circle').classed('inactive', function(d) {
	        	//输入节点id的小写等于name则显示，否则隐藏
	            if (d.id.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
	                d3.selectAll("circle").style("opacity", 0.1);
	                d3.selectAll("line").style("opacity", 0.1);
	                d3.select("#"+d.id).style("opacity", 1);
	                d3.selectAll("."+d.id).style("opacity", 1);
			    	d3.selectAll("."+d.id).each(function(p){
			    		d3.select("#"+p.target.id).style("opacity",1);
			    		d3.select("#"+p.source.id).style("opacity",1);
			    	})

	                return false;
	            } else {
	                return true; //隐藏
	            }
	        });
	        // //搜索texts
	        // d3.select('#svg1 .texts').selectAll('text').attr('class', function(d) {
	        //     if (d.id.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
	        //         return '';
	        //     } else {
	        //         return 'inactive';
	        //     }
	        // });
	        // //搜索links
	        // svg.selectAll('line').classed('inactive', function(d) {
	        // 	//输入节点id的小写等于name则显示，否则隐藏
	        //     if (d.id.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
	        //         return false;
	        //     } else {
	        //         return true; //隐藏
	        //     }
	        // });
	    }
	    
	    //d3.selectAll(".inactive").style("opacity", 0.1);
	});


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
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", function(d){
      	return Math.sqrt(d.value)/3;
      });

    link
      .attr("id", function(d,i){
        d.id = i;
        return "link-"+i;
      })
      .attr("class", function(d){
      	return d.source.id+" "+d.target.id;
      })
      .attr("source", function(d){
      	return d.source.id;
      })
      .attr("target", function(d){
      	return d.target.id;
      })
      ;

  	var node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .enter()
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
      	svg.attr("width", 0);
      	search.style("display", "none");
      	drawCareer(d.id, "Summer");
      })
      .call(drag(simulation))
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
	    node.each(function(d,i){                
	    	d.x = d.x - radius < 0 ? radius : d.x ;                
	    	d.x = d.x + radius > width ? width - radius : d.x ;                
	    	d.y = d.y - radius < 0 ? radius : d.y ;                
	    	d.y = d.y + radius > height ? height - radius : d.y ;            
	    });
	    node
	        .attr("cx", d => d.x)
	        .attr("cy", d => d.y);

    }
    function hovered(d) {
    	d3.selectAll("circle").style("opacity", 0.1);
    	d3.selectAll("line").style("opacity", 0.1);
    	d3.select(this).style("opacity", 1);
    	//var chosen = d3.select(this).attr("id");
    	// console.log(d.id);
    	d3.selectAll("."+d.id).style("opacity", 1)
    	d3.selectAll("."+d.id).each(function(p){
    		d3.select("#"+p.target.id).style("opacity",1);
    		d3.select("#"+p.source.id).style("opacity",1);
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
    	d3.selectAll("circle").style("opacity", 1);
    	d3.selectAll("line").style("opacity", 1);
    }
    // invalidation.then(() => simulation.stop());
}

