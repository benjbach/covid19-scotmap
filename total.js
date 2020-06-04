

var dates = []
var totals = []
var totalMax = 0

// d3.csv('data/'+FILE+'.csv').then(function(data) 
// { 
// 	// CREATE SMALL LINE CHART PER REGION
// 	var values = {}
// 	for (var i = 0; i < regions.length; i++) {
// 		values[regions[i]] = [];
// 	}
// 	var row;
// 	for (var i = 0; i < data.length; i++) {
// 		row = data[i]
// 		for(var key in row){
// 			if(key == 'Date'){
// 				dates.push(moment(row[key], DATE_FORMAT_INPUT))
// 			}else 
// 			if (key == "Scotland"){
// 				totals.push(row[key])
// 				totalMax = Math.max(totalMax, row[key])
// 			}
// 		}
// 	} 
// 	console.log('totals', totals)


// 		// CREATE TOTAL BARCHART
// 	var barHeightTotals = d3.scaleLinear()
// 		.domain([0, totalMax])
// 		.range([0, HEIGHT_TOTALCHART-20]);
// 	var barXPosTotals = d3.scaleLinear()
// 		.domain([0, dates.length])
// 		.range([0, WIDTH_TOTALCHART]);

// 	xStep = WIDTH_TOTALCHART / dates.length;


// 	var totalBarchart = svg.append('g')
// 	    	.attr("transform", function(d, i) { 
// 	    		return "translate("+WIDTH_CHART * 5 + ",10)"; 
// 	    	})
// 	    	.attr('height', HEIGHT_TOTALCHART)
// 	    	.attr('width', WIDTH_TOTALCHART)
// 	totalBarchart.append('rect')
// 		.attr('width', WIDTH_TOTALCHART)
// 		.attr('height', HEIGHT_TOTALCHART)
// 		.attr('class', 'chartBackground')
	
// 	var totalBars = totalBarchart.selectAll('totalBar')
// 		.data(totals)
// 		.enter().append('rect')
// 			.attr('class','totalBar')
// 			.classed('tickmark', function(d,i){
// 				return dates[i].date() == 1;
// 			})
// 			.attr('x', function(d,i){
// 				return barXPosTotals(i);
// 			})
// 			.attr('height',function(d,i){
// 				return barHeightTotals(d);
// 			})
// 			.attr('width', xStep)
// 			.attr('y', function(d,i){
// 				return HEIGHT_TOTALCHART - barHeightTotals(d);
// 			})
// 			.on('mouseover',function(d,i){
// 				d3.selectAll('.totalBar').classed('mouseover', false)
// 				totalBars.classed('mouseover', function(d,j){
// 					return i == j;
// 				})
// 				var text = dates[i].format(DATE_FORMAT_OUTPUT) + ": " + d;
// 			// 	label
// 			// 		.text(text)
// 			// 		.attr('visibility', 'visible')
// 			// 		.attr('x', getLayoutX(region) + barXPos(i))
// 			// 		.attr('y', getLayoutY(region) + HEIGHT_CHART- barHeight(d)-5)
// 			// 	labelBackground
// 			// 		.attr('visibility', 'visible')
// 			// 		.attr('x', getLayoutX(region) + barXPos(i) - text.length * 7 )
// 			// 		.attr('y', getLayoutY(region) + HEIGHT_CHART- barHeight(d)-5 -13)
// 			// 		.attr('width', text.length * 7)
// 			})
// 			.on('mouseout',function(d,i){
// 				d3.select(this).classed('mouseover', false)
// 				// labelBackground.attr('visibility', 'hidden')
// 				// label.attr('visibility', 'hidden')
// 			})	

// 	var barNewCasesTotal = totalBarchart.selectAll('barNewCasesTotal')
// 		.data(totals)
// 		.enter().append('rect')
// 			.attr('class','barNewCasesTotal')
// 			.attr('x', function(d,i){
// 				return barXPosTotals(i);
// 			})
// 			.attr('height',function(d,i,all){
// 				var diff = d3.selectAll(all).data()[i-1]
// 				if(!diff)
// 					diff = 0;
// 				return barHeight(d - diff);
// 			})
// 			.attr('width', xStep)
// 			.attr('y', function(d,i,all){
// 				var val = d3.selectAll(all).data()[i-1]
// 				if(!val)
// 					val = 0;
// 				return HEIGHT_TOTALSCHART - barHeightTotals(d - val) + 5;
// 			})
// });