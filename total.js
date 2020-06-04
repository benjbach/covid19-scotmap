const FILE = 'Table 1 - Cumulative cases-Table 1';
const DATE_FORMAT_INPUT = 'MM/DD/YYYY'
const DATE_FORMAT_OUTPUT = 'DD-MMM-YYYY'

// TABLE COLS
var DATE = 0
var TOTAL = 15
var dates = []
var totals = []
var totalMax = 0

var WIDTH_CHART = 300;
var HEIGHT_CHART = 200;


function cleanValue(string){
	if(string == '*') return 0;
	else{
		return parseInt(string.replace(',',''));
	}
}

var labelBackground
var label

d3.csv('data/'+FILE+'.csv').then(function(data) 
{ 
	var values = {}
	var row;
	for (var i = 0; i < data.length; i++) {
		row = data[i]
		for(var key in row){
			if(key == 'Date'){
				dates.push(moment(row[key], DATE_FORMAT_INPUT))
			}else 
			if (key == "Scotland"){
				var val = cleanValue(row[key]);
				totals.push(val)
				totalMax = Math.max(totalMax, val)
			}
		}
	} 
	console.log('totals', totals)

		// CREATE TOTAL BARCHART
	var barHeight = d3.scaleLinear()
		.domain([0, totalMax])
		.range([0, HEIGHT_CHART-20]);
	var barXPos = d3.scaleLinear()
		.domain([0, dates.length])
		.range([0, WIDTH_CHART]);

	xStep = WIDTH_CHART / dates.length;

	svg = d3.select("#svg-total-scotland")
	    .attr("width", WIDTH_CHART)
	    .attr("height", HEIGHT_CHART);

	//bar chart
	var bars = svg.append('g')
	    	.attr("transform", function(d, i) { 
	    		return "translate(0,10)"; 
	    	})
	    	.attr('height', HEIGHT_CHART)
	    	.attr('width', WIDTH_CHART)

	bars.append('rect')
		.attr('width', WIDTH_CHART)
		.attr('height', HEIGHT_CHART)
		.attr('class', 'chartBackground')

	// Tooltip on mouse over	    	
	labelBackground = svg.append('rect')
		.attr('visibility', 'hidden')
		.attr('class', 'valueLabelBackground')
		.attr('height', 16)
	label = svg.append("text")
		.attr('visibility', 'hidden')
		.attr('class', 'valueLabel')

	var totalBars = bars.selectAll('totalBar')
		.data(totals)
		.enter().append('rect')
			.attr('class','totalBar')
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
				d3.selectAll('.totalBar').classed('mouseover', false)
				totalBars.classed('mouseover', function(d,j){
					return i == j;
				})
				var text = dates[i].format(DATE_FORMAT_OUTPUT) + ": " + d;
				label
					.text(text)
					.attr('visibility', 'visible')
					.attr('x', barXPos(i))
					.attr('y', HEIGHT_CHART- barHeight(d)-5)
				labelBackground
					.attr('visibility', 'visible')
					.attr('x', barXPos(i) - text.length * 7 )
					.attr('y', HEIGHT_CHART- barHeight(d)-5 -13)
					.attr('width', text.length * 7)
			})
			.on('mouseout',function(d,i){
				d3.select(this).classed('mouseover', false)
				labelBackground.attr('visibility', 'hidden')
				label.attr('visibility', 'hidden')
			})	

	var barNewCasesTotal = bars.selectAll('barNewCasesTotal')
		.data(totals)
		.enter().append('rect')
			.attr('class','barNewCasesTotal')
			.attr('x', function(d,i){
				return barXPos(i);
			})
			.attr('height',function(d,i,all){
				var diff = d3.selectAll(all).data()[i-1]
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
});