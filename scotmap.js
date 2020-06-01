
const FILE = 'Table 1 - Cumulative cases-Table 1';
const DATE_FORMAT_INPUT = 'MM/DD/YYYY'
const DATE_FORMAT_OUTPUT = 'DD-MMM-YYYY'
// TABLE COLS
var DATE = 0
var TOTAL = 15

// REGIONS
var regions = [
	"Ayrshire & Arran",
	"Borders",
	"Dumfries & Galloway",
	"Fife",
	"Forth Valley",
	"Grampian",
	"Greater Glasgow & Clyde",
	"Highland",
	"Lanarkshire",
	"Lothian",
	"Orkney",
	"Shetland",
	"Tayside",
	"Western Isles"]
var dates = [];
var totals = [];

var WIDTH_SVG = 900
var HEIGHT_SVG = 900;

var WIDTH_CHART = 200;
var HEIGHT_CHART = 100;

// layout
const WIDTH_LAYOUT = 3;
const WIDTH_HEIGHT = 7;
const GAP_LAYOUT = 10;	
layout = {
	'Ayrshire & Arran': [5,1],
	'Borders': [6,3],
	'Dumfries & Galloway': [6,1],
	'Fife': [4,2],
	'Forth Valley': [4,1],
	'Grampian': [3,2],
	'Greater Glasgow & Clyde': [5,2],
	'Highland': [2,1],
	'Lanarkshire': [6,2],
	'Lothian': [5,3],
	'Orkney': [1,2],
	'Shetland': [0,2],
	'Tayside': [3,1],
	'Western Isles': [2,0]
}

function getLayoutX(regionName){
	regionName = regionName.replace('NHS ','')
	return layout[regionName][1] * (WIDTH_CHART + GAP_LAYOUT);
}
function getLayoutY(regionName){
	return layout[regionName][0] * (HEIGHT_CHART + GAP_LAYOUT);
}


d3.csv('data/'+FILE+'.csv').then(function(data) 
{ 

	var totalMax = 0
	var regionMax = 0

	// CREATE SMALL LINE CHART PER REGION
	var values = {}
	for (var i = 0; i < regions.length; i++) {
		values[regions[i]] = [];
	}
	var row;
	for (var i = 0; i < data.length; i++) {
		row = data[i]
		for(var key in row){
			if(key == 'Date'){
				dates.push(moment(row[key], DATE_FORMAT_INPUT))
			}else 
			if (key == "Scotland"){
				totals.push(row[key])
				totalMax = Math.max(totalMax, row[key])
			}else{
				var vals = cleanValue(row[key])
				key = key.replace('NHS ','')
				values[key].push(vals)
				regionMax = Math.max(regionMax, vals)
			}
		}
	}
	console.log("Dates =", dates)
	console.log("Total cases =", totals)
	console.log("By region =", values)


	// Create bar chart for each region
	var svg = d3.select("#svg-mapvis")
	    .attr("width", WIDTH_SVG)
	    .attr("height", HEIGHT_SVG);

	var chart = svg.selectAll('g')
	    .data(d3.entries(values))
	  	.enter().append('g')
	    	.attr("transform", function(d, i) { 
	    		// console.log('print', i, d)
	    		return "translate("+getLayoutX(d.key)+"," + getLayoutY(d.key) + ")"; 
	    	})
	    	.attr('height', HEIGHT_CHART)
	    	.attr('width', WIDTH_CHART)

	// chart background and frame
	chart.append('rect')
		.attr('width', WIDTH_CHART)
		.attr('height', HEIGHT_CHART)
		.attr('class', 'chartBackground')

    // draw region labels
	chart.append('text')
		.attr('class', 'regionLabel')
		.attr('x', 2)
		.attr('y', 12)
		.text(function(d,i){
			return d.key + ' (' + Math.max(...d.value)+ ')';
		})
		.call(wrap, WIDTH_CHART);


	// Tooltip on mouse over	    	
	var labelBackground = svg.append('rect')
		.attr('visibility', 'hidden')
		.attr('class', 'valueLabelBackground')
		.attr('height', 16)
	var label = svg.append("text")
		.attr('visibility', 'hidden')
		.attr('class', 'valueLabel')

    // Draw bars
	var xStep = WIDTH_CHART / dates.length;
	console.log(xStep);

	var barHeight = d3.scaleLinear()
		.domain([0, regionMax])
		.range([0, HEIGHT_CHART-20]);
	var barXPos = d3.scaleLinear()
		.domain([0, dates.length])
		.range([0, WIDTH_CHART]);

	// draw bars
	var barCulmulativeCases = chart.selectAll('barCulmulativeCases')
		.data(function(d){
			return d.value;
		})
		.enter().append('rect')
			.attr('class','barCulmulativeCases')
			.classed('tickmark', function(d,i){
				return dates[i].date() == 1;
			})
			.attr('x', function(d,i){
				return barXPos(i);
			})
			.attr('height',function(d,i){
				return barHeight(d);
			})
			.attr('width', xStep)
			.attr('y', function(d,i){
				return HEIGHT_CHART - barHeight(d);
			})
			.on('mouseover',function(d,i){
				d3.selectAll('.barCulmulativeCases').classed('mouseover', false)
				barCulmulativeCases.classed('mouseover', function(d,j){
						return i == j;
					})
				var region = d3.select(this.parentNode).datum().key;
				var text = dates[i].format(DATE_FORMAT_OUTPUT) + ": " + d;
				label
					.text(text)
					.attr('visibility', 'visible')
					.attr('x', getLayoutX(region) + barXPos(i))
					.attr('y', getLayoutY(region) + HEIGHT_CHART- barHeight(d)-5)
				labelBackground
					.attr('visibility', 'visible')
					.attr('x', getLayoutX(region) + barXPos(i) - text.length * 7 )
					.attr('y', getLayoutY(region) + HEIGHT_CHART- barHeight(d)-5 -13)
					.attr('width', text.length * 7)
			})
			.on('mouseout',function(d,i){
				d3.select(this).classed('mouseover', false)
				labelBackground.attr('visibility', 'hidden')
				label.attr('visibility', 'hidden')
			})	

	var barNewCases = chart.selectAll('barNewCases')
		.data(function(d){
			return d.value;
		})
		.enter().append('rect')
			.attr('class','barNewCases')
			.attr('x', function(d,i){
				return barXPos(i);
			})
			.attr('height',function(d,i,all){
				var diff = d3.selectAll(all).data()[i-1]
				console.log(diff)
				if(!diff)
					diff = 0;
				return barHeight(d - diff);
			})
			.attr('width', xStep)
			.attr('y', function(d,i,all){
				var val = d3.selectAll(all).data()[i-1]
				if(!val)
					val = 0;
				return HEIGHT_CHART - barHeight(d - val) + 5;
			})
			// .on('mouseover',function(d,i){
			// 	d3.selectAll('.barCulmulativeCases').classed('mouseover', false)
			// 	barCulmulativeCases.classed('mouseover', function(d,j){
			// 			return i == j;
			// 		})
			// 	var region = d3.select(this.parentNode).datum().key;
			// 	var text = dates[i].format(DATE_FORMAT_OUTPUT) + ": " + d;
			// 	label
			// 		.text(text)
			// 		.attr('visibility', 'visible')
			// 		.attr('x', getLayoutX(region) + barXPos(i))
			// 		.attr('y', getLayoutY(region) + HEIGHT_CHART- barHeight(d)-5)
			// 	labelBackground
			// 		.attr('visibility', 'visible')
			// 		.attr('x', getLayoutX(region) + barXPos(i) - text.length * 7 )
			// 		.attr('y', getLayoutY(region) + HEIGHT_CHART- barHeight(d)-5 -13)
			// 		.attr('width', text.length * 7)
			// })
			// .on('mouseout',function(d,i){
			// 	d3.select(this).classed('mouseover', false)
			// 	labelBackground.attr('visibility', 'hidden')
			// 	label.attr('visibility', 'hidden')
			// })	

})

function cleanValue(string){
	if(string == '*') return 0;
	else{
		return parseInt(string.replace(',',''));
	}
}

function wrap(text, width) {
	text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1, // ems
	        y = text.attr("y"),
	        dy = 0, // dunno why...
	        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

	    while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		}
    }
  });
}




