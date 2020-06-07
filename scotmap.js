
const FILE = 'Table 1 - Cumulative cases-Table 1';
const DATE_FORMAT_INPUT = 'DD/MM/YYYY'
const DATE_FORMAT_OUTPUT = 'DD-MMM-YYYY'
// TABLE COLS
var DATE = 0
var TOTAL = 15

// REGIONS
var regions = []
var regionNames = {
	'nhs_ayrshire_arran': "NHS Ayrshire & Arran",
	'nhs_borders': "NHS Borders",
	'nhs_dumfries_galloway': "NHS Dumfries & Galloway",
	'nhs_fife': "NHS Fife",
	'nhs_forth_valley': "NHS Forth Valley",
	'nhs_grampian': "NHS Grampian",
	'nhs_greater_glasgow_clyde': "NHS Greater Glasgow & Clyde",
	'nhs_highland': "NHS Highland",
	'nhs_lanarkshire': "NHS Lanarkshire",
	'nhs_lothian': "NHS Lothian",
	'nhs_orkney': "NHS Orkney",
	'nhs_shetland': "NHS Shetland",
	'nhs_tayside': "NHS Tayside",
	'nhs_western_isles_scotland': "NHS Western Isles"
}

var dates = [];
var totals = [];

const WIDTH_SVG = 1000
const HEIGHT_SVG = 1000;

const WIDTH_CHART_BOX = 200;
const HEIGHT_CHART_BOX = 100;
const PADDING_CHART_LEFT = 0;
const PADDING_CHART_TOP = 15;
const PADDING_CHART_BOTTOM = 0;
const PADDING_CHART_RIGHT = 0;
const WIDTH_CHART = WIDTH_CHART_BOX - PADDING_CHART_RIGHT - PADDING_CHART_LEFT;
const HEIGHT_CHART = HEIGHT_CHART_BOX - PADDING_CHART_TOP - PADDING_CHART_BOTTOM;

// layout
const WIDTH_LAYOUT = 3;
const WIDTH_HEIGHT = 7;
const GAP_LAYOUT = 40;	

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

const TICKMARK_GAP_Y = 10

function getLayoutX(regionName){
	return layout[cleanRegionName(regionName)][1] * (WIDTH_CHART_BOX + GAP_LAYOUT);
}
function getLayoutY(regionName){
	return layout[cleanRegionName(regionName)][0] * (HEIGHT_CHART_BOX + GAP_LAYOUT);
}
function cleanRegionName(regionName){
	var s = regionNames[regionName]
	return s
}

var totalMax = 0
var regionMax = 0
var chartMax =0;
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
d3.json('http://vis.scrc.uk/api/v1/scotland/cumulative').then(function(data) 
{ 

	// get regions
	var firstRow = data[0];
	for (var key in firstRow){
		if(key != 'date' && key != 'scotland'){
			regions.push(key)
			cumulativeCasesByBoard[key] = []
			dailyCasesByBoard[key] = [];
		}
	}

	// parse data
	var row;
	var prevRow;
	for (var i = 0; i < data.length; i++) {
		row = data[i]
		for(var key in row){
			if(key == 'date'){
				dates.push(moment(row[key], DATE_FORMAT_INPUT))
			}else 
			if (key == "scotland")
			{
				var val = cleanValue(row[key])
				totals.push(val)
				totalMax = Math.max(totalMax, val)
			}
			else
			{// some nhs board..
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

	// 	
	var decimals = regionMax.toString().length;
	var offset = Math.pow(10, decimals-1) 
	var v = regionMax + offset;
	v = v / offset
	v = Math.trunc(v);
	chartMax = v * offset
	console.log('chartMax', chartMax)


	console.log("Dates =", dates)
	console.log("Total cases =", totals)
	console.log("culmulative by board =", cumulativeCasesByBoard)
	console.log("daily By board =", cumulativeCasesByBoard)
	console.log("---> data parsed")



	initCharts();
	setData(cumulativeCasesByBoard)

})


var chart, chartBox
var bar
var barHeight = d3.scaleLinear()
	.range([0, HEIGHT_CHART]);
var barXPos = d3.scaleLinear()
	.range([0, WIDTH_CHART]);

var xStep = WIDTH_CHART / dates.length;
var svg;

var labelBackground
var label


function initCharts(){

	// Create bar chart for each region
	svg = d3.select("#svg-mapvis")
	    .attr("width", WIDTH_SVG)
	    .attr("height", HEIGHT_SVG);

	chartBox = svg.selectAll('g')
	  	.data(d3.entries(cumulativeCasesByBoard))
	  	.enter().append('g')
	  		.attr('class', 'chartBox')
	    	.attr("transform", function(d, i) { 
	    		return "translate("+getLayoutX(d.key)+"," + getLayoutY(d.key) + ")"; 
	    	})
	    	.attr('height', HEIGHT_CHART_BOX)
	    	.attr('width', WIDTH_CHART_BOX)
	
	// chart background and frame
	chartBox.append('rect')
		.attr('width', WIDTH_CHART_BOX)
		.attr('height', HEIGHT_CHART_BOX)
		.attr('class', 'chartBoxBackground')

	chart = chartBox
	    .append('g')
	    	.attr("transform", function() { 
	    		return "translate(" + PADDING_CHART_LEFT +"," + PADDING_CHART_TOP + ")"; 
	    	})
	    	.attr('height', HEIGHT_CHART)
	    	.attr('width', WIDTH_CHART)

	// chart background and frame
	chart.append('rect')
		.attr('width', WIDTH_CHART)
		.attr('height', HEIGHT_CHART)
		.attr('class', 'chartBackground')

    // draw region labels
	chartBox.append('text')
		.attr('class', 'regionLabel')
		.attr('x', 0)
		.attr('y', 10)
		.text(function(d,i){
			return cleanRegionName(d.key);
		})
		.call(wrap, WIDTH_CHART);

	chartBox.append('text')
		.attr('class', 'regionCurrentValue')
		.attr('x', WIDTH_CHART_BOX)
		.attr('y', 10)
		.style('text-anchor', 'end')
		.text(function(d,i){
			return Math.max(...d.value);
		})



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
					.attr('y', getLayoutY(region) + HEIGHT_CHART - barHeight(d) + 13)
				labelBackground
					.attr('visibility', 'visible')
					.attr('x', getLayoutX(region) + barXPos(i) - text.length * 7 )
					.attr('y', getLayoutY(region) + HEIGHT_CHART- barHeight(d))
					.attr('width', text.length * 7)
			})
			.on('mouseout',function(d,i){
				d3.select(this).classed('mouseover', false)
				labelBackground.attr('visibility', 'hidden')
				label.attr('visibility', 'hidden')
			})

	chart.each(createXLabels, this)
}


function createXLabels(d){

	var chart = d3.select(this);
	// console.log('dates.length-1', dates.length-1)
	// // one per week
	// var start = dates[0]
	// var end = dates[dates.length-1]
	// var numWeeks = end.diff(start, 'weeks')
	// console.log('num weeks', numWeeks)
	// timeTickMark.domain([])
	
	chart.selectAll('line')
		.data(dates)
		.enter()
		.append('line')
			.attr('x1', function(d,i){
				return i * WIDTH_CHART / dates.length + 4;
			})
			.attr('y1', HEIGHT_CHART)
			.attr('x2', function(d,i){
				return i * WIDTH_CHART / dates.length + 4;
			})
			.attr('y2', HEIGHT_CHART + 4)
			.attr('class', 'tickmark')
			.attr('visibility', function(d){
				if(d.date() == 1)
					return 'visible'
				return 'hidden'; 
			})

	chart.selectAll('.timeTickmarkLabel')
		.data(dates)
		.enter()
		.append('text')
			.text(function(d){
				return d.format('MMM')
			})
			.attr('class', 'timeTickmarkLabel')
			.attr('x', function(d,i){
				return i * WIDTH_CHART / dates.length + 3;
			})
			.attr('visibility', function(d){
				if(d.date() == 1)
					return 'visible'
				return 'hidden'; 
			})
			.attr('y', HEIGHT_CHART + 15)
}

function createYLabels(d){
	var chart = d3.select(this);

	chart.selectAll('.axisLabel').remove()

	chart.append('line')
		.attr('x1', -5)
		.attr('y1', 0)
		.attr('x2', 0)
		.attr('y2', 0)
		.attr('class', 'tickmark')

	chart.append('text')
		.attr('x', -7)
		.attr('y', 3)
		.text(chartMax)
		.attr('class', 'axisLabel')
		.style('text-anchor', 'end')
	
	chart.append('line')
		.attr('x1', -5)
		.attr('y1', HEIGHT_CHART)
		.attr('x2', 0)
		.attr('y2', HEIGHT_CHART)
		.attr('class', 'tickmark')

	chart.append('text')
		.attr('x', -7)
		.attr('y', HEIGHT_CHART+3)
		.text(0)
		.attr('class', 'axisLabel')
		.style('text-anchor', 'end')
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

	var decimals = max.toString().length;
	var offset = Math.pow(10, decimals-1)
	var v =max + offset;
	v = v / offset
	v = Math.trunc(v);
	chartMax = v * offset


	barHeight.domain([0, chartMax])
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

		// CHART LABELS
	chart.each(createYLabels, this)
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




