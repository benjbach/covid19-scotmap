
const FILE = 'Table 1 - Cumulative cases-Table 1';
const DATE_FORMAT_INPUT = 'MM/DD/YYYY'
const DATE_FORMAT_OUTPUT = 'DD-MMM-YYYY'
// TABLE COLS
var DATE = 0
var TOTAL = 15

// REGIONS
var regions = [
	"NHS Ayrshire & Arran",
	"NHS Borders",
	"NHS Dumfries & Galloway",
	"NHS Fife",
	"NHS Forth Valley",
	"NHS Grampian",
	"NHS Greater Glasgow & Clyde",
	"NHS Highland",
	"NHS Lanarkshire",
	"NHS Lothian",
	"NHS Orkney",
	"NHS Shetland",
	"NHS Tayside",
	"NHS Western Isles"]
var dates = [];
var totals = [];

var WIDTH_SVG = 600
var HEIGHT_SVG = 600;

var WIDTH_CHART = 100;
var HEIGHT_CHART = 70;

var WIDTH_TOTALCHART = 300;
var HEIGHT_TOTALCHART = 200;

// layout
const WIDTH_LAYOUT = 3;
const WIDTH_HEIGHT = 7;
const GAP_LAYOUT = 10;	
layout = {
	'NHS Ayrshire & Arran': [5,1],
	'NHS Borders': [6,3],
	'NHS Dumfries & Galloway': [6,1],
	'NHS Fife': [4,2],
	'NHS Forth Valley': [4,1],
	'NHS Grampian': [3,2],
	'NHS Greater Glasgow & Clyde': [5,2],
	'NHS Highland': [2,1],
	'NHS Lanarkshire': [6,2],
	'NHS Lothian': [5,3],
	'NHS Orkney': [1,2],
	'NHS Shetland': [0,2],
	'NHS Tayside': [3,1],
	'NHS Western Isles': [2,0]
}

function getLayoutX(regionName){
	return layout[regionName][1] * (WIDTH_CHART + GAP_LAYOUT);
}
function getLayoutY(regionName){
	return layout[regionName][0] * (HEIGHT_CHART + GAP_LAYOUT);
}

var totalMax = 0
var regionMax = 0
var cumulativeCasesByBoard = {}
var dailyCasesByBoard = {}

const buttons = d3.selectAll('input[name="input-boardData"]');
buttons.on('change', function(d) {
	changeData(this.value)
});

function changeData(value){
	console.log('new data: '+ value);

	if(value === 'culmulativeCases'){
		setData(cumulativeCasesByBoard)
	}
	else if(value === 'newCases'){
		setData(dailyCasesByBoard)		
	}
}

d3.csv('data/'+FILE+'.csv').then(function(data) 
{ 
	// PARSE SOME DATA
	for (var i = 0; i < regions.length; i++) {
		cumulativeCasesByBoard[regions[i]] = [];
		dailyCasesByBoard[regions[i]] = [];
	}
	var row;
	var prevRow;
	for (var i = 0; i < data.length; i++) {
		row = data[i]
		for(var key in row){
			if(key == 'Date'){
				dates.push(moment(row[key], DATE_FORMAT_INPUT))
			}else 
			if (key == "Scotland"){
				var val = cleanValue(row[key])
				totals.push(val)
				totalMax = Math.max(totalMax, val)
			}else{
				var val = cleanValue(row[key])
			
				// culmulative cases
				cumulativeCasesByBoard[key].push(val)
				regionMax = Math.max(regionMax, val)

				// daily cases
				var diff = 0;
				if(prevRow){
					diff = cleanValue(row[key]) - cleanValue(prevRow[key]);
					diff = Math.max(diff, 0)
				}
				dailyCasesByBoard[key].push(diff)
			}
		}
		prevRow = row;
	}
	console.log("Dates =", dates)
	console.log("Total cases =", totals)
	console.log("culmulative by board =", cumulativeCasesByBoard)
	console.log("daily By board =", cumulativeCasesByBoard)
	console.log("---> data parsed")

	createCharts();
	setData(cumulativeCasesByBoard)
})


var chart
var bar
var barHeight = d3.scaleLinear()
	.range([0, HEIGHT_CHART-20]);
var barXPos = d3.scaleLinear()
	.range([0, WIDTH_CHART]);

var xStep = WIDTH_CHART / dates.length;
var svg;

var labelBackground
var label


function createCharts(){


	// Create bar chart for each region
	svg = d3.select("#svg-mapvis")
	    .attr("width", WIDTH_SVG)
	    .attr("height", HEIGHT_SVG);

	chart = svg.selectAll('g')
	    .data(d3.entries(cumulativeCasesByBoard))
	  	.enter().append('g')
	    	.attr("transform", function(d, i) { 
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
	labelBackground = svg.append('rect')
		.attr('visibility', 'hidden')
		.attr('class', 'valueLabelBackground')
		.attr('height', 16)
	label = svg.append("text")
		.attr('visibility', 'hidden')
		.attr('class', 'valueLabel')


	bar = chart.selectAll('bar')
		.data(function(d){
			return d.value;
		})
		.enter().append('rect')
			.attr('class','bar')
			.classed('tickmark', function(d,i){
				return dates[i].date() == 1;
			})
			.on('mouseover',function(d,i){
				d3.selectAll('.bar').classed('mouseover', false)
				bar.classed('mouseover', function(d,j){
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

}

function setData(values){
	
	// set new data for every chart and every bar
	chart.data(d3.entries(values))
	var max = 0
	for (var key in values) {
		for (var j = 0; j < values[key].length; j++) {
			max = Math.max(max, values[key][j])
		}
	}
	console.log(max)

	barHeight.domain([0, max])
	barXPos.domain([0, dates.length])

	xStep = WIDTH_CHART / dates.length;
	
	// draw bars
	bar.data(function(d){
			return d.value;
		})
			.attr('class','bar')
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
}

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




