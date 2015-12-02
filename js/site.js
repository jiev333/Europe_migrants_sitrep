/* NEXT CHANGES:
	- objectify stats generation
	- *** add shapefile for locations - Simon to update library first - need qgis to accept utf-8
	- ? add interactive tips for how to use dashboard - see intro.js library - see Simon's Nepal earthquake RC 3W
*/
 
var geojsonMarkerOptions = {
    radius: 3,
    fillColor: "#f30806",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function generateDashboard(data,geom, mig){
    var map = new lg.map('#map').geojson(geom).nameAttr('CNTRY_NAME').joinAttr('Iso_Code').zoom(3).center([53.5,20]);
	
	var resLocs = new lg.column('Response Locations');   //change this 
	
	var pplReached = new lg.column('Total people reached').label('Total RC interactions');
	
/* 	var domAppeal = new lg.column('Domestic appeal (Y/N)').domain([0,1]).axisLabels(false).valueAccessor(function(d){
        if(d=='Yes' || d== 'No'){
            return 1;
        } else {
            return null;
        }
    })
    .colorAccessor(function(d,i,max){
        if(d=='Yes'){
            return 1;
        } else {
            return 0;
        }
    })
    .colors(['#bd0026','#2E7D32']); 
	
	var appFundLocal = new lg.column('Appeal funding (local currency)').axisLabels(true); 
	
	var maxCHF = d3.max(data, function(d){
		if (!isNaN(d['Appeal funding (CHF)'])){return d['Appeal funding (CHF)'];}
	});
	var appFundCHF = new lg.column('Appeal funding (CHF)').domain([0,Math.ceil(maxCHF).toPrecision(2)]);
	*/

	
	
	var updateDates = new lg.column('Last data update').axisLabels(false)
    .scale(d3.time.scale())
 	.domain([0,Date.now()])   
    .labelAccessor(function(d){
		if (Number(d)!=0){
			var year = d.getFullYear();
			var month = d.getMonth() + 1;
			var day = d.getDate();
			return day+'/'+month+'/'+year;
		} else {
            return 'No data reported';
        }
    })
 	.valueAccessor(function(d){
        if (Number(d)!=0){
			return Number(d);
        } else {
            return null;
        } 
    }) 
    .colorAccessor(function(d,i,max){    
        if (Date.now()-Number(d)<=1.123e+9){   //updated within last 13 days = 1.123e+9ms
            return 0;
		} else if (Date.now()-Number(d)>1.123e+9){  //updated before last 13 days
			return 1;
        } 
    })
    .colors(['#2E7D32','#ff8c1a']);  
	
	
	function getGridWidth(divWidth) {
		if (divWidth<750) {
			return 750;
		} else {
			return divWidth;
		};
	};
 	var grid_width = getGridWidth($("#grid").width());
	//console.log($("#grid").width(), grid_width);
			 
			 
    var grid = new lg.grid('#grid')
        .data(data)
        .width(grid_width)
        .height(750)
        .nameAttr('Country')
        .joinAttr('ISO 3 code')
        .hWhiteSpace(10)
        .vWhiteSpace(5)
 		.columns(['Total Migrants 2015', resLocs, 'Active volunteers', 'Active staff', 'Active full-time equivalent', 'People in long-term shelter', 'People in short-term shelter', 'Distributions: Relief kits', 'Distributions: Hygiene items', 'Distributions: Food parcels', 'Distributions: Meals', 'Distributions: Water bottles', 'Distributions: Hot and cold drinks', 'Distributions: Blankets and sleeping bags', 'Distributions: Clothing', 'Provision of connectivity', 'Provision of medical care', 'Provision of first aid', 'Provision of psychosocial support', 'RFL requests', 'RFL reunifications', pplReached, updateDates]) 
        .margins({top: 165, right: 50, bottom: 20, left: 290});
	//lg.colors(['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c']);  //blue-green multi-hue
	lg.colors(['#feebe2','#fbb4b9','#f768a1','#c51b8a','#7a0177']);  //pink-purple multi-hue
	//lg.colors(['#f1eef6','#d7b5d8','#df65b0','#dd1c77','#980043']); //purple-red multi-hue
	//lg.colors(['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']); //yellow-orange-red multi-hue
    lg.init();

    $("#map").width($("#map").width());

    var migActives = L.geoJson(mig, {
	pointToLayer: function (feature, latlng) {
		return L.circleMarker(latlng, geojsonMarkerOptions);
	}
    });
    migActives.addTo(map.map()); 
}


function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(headers==true && i==0){
            keys = e;
        } else if(headers==true && i>1) {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        } else if(headers!=true){
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);

        }
    });
    return output;
}


function generateStats(id,data){
	var formatComma = d3.format(",.0f");
	var formatPerc = d3.format(",.1%");
	totalPplReached = 0;
	totalVols = 0;
	totalFoodDists = 0;
	totalMeds = 0;
	totalTextiles = 0;
	totalConnectivity = 0;
	
	for(var i = 0; i < data.length; i++) {
 		numPplReached = parseInt(data[i]["Total people reached"]);
		numVols = parseInt(data[i]["Active volunteers"]);
		numFoodParc = parseInt(data[i]["Distributions: Food parcels"]);
		numMeals = parseInt(data[i]["Distributions: Meals"]);
		numMedCare = parseInt(data[i]["Provision of medical care"]);
		numFirstAid = parseInt(data[i]["Provision of first aid"]); 
		numPSS = parseInt(data[i]["Provision of psychosocial support"]);
		numClothing = parseInt(data[i]["Distributions: Clothing"]); 
		numBlanketsSlBags = parseInt(data[i]["Distributions: Blankets and sleeping bags"]); 
		numConnect = parseInt(data[i]["Provision of connectivity"]);
		if (!isNaN(numPplReached)) {totalPplReached += numPplReached;};
		if (!isNaN(numVols)) {totalVols += numVols;}; 
		if (!isNaN(numFoodParc)) {totalFoodDists += numFoodParc;}; 
		if (!isNaN(numMeals)) {totalFoodDists += numMeals;}; 
		if (!isNaN(numMedCare)) {totalMeds += numMedCare;};
		if (!isNaN(numFirstAid)) {totalMeds += numFirstAid;}; 
		if (!isNaN(numPSS)) {totalMeds += numPSS;}; 	
		if (!isNaN(numClothing)) {totalTextiles += numClothing;}; 
		if (!isNaN(numBlanketsSlBags)) {totalTextiles += numBlanketsSlBags;}; 
		if (!isNaN(numConnect)) {totalConnectivity += numConnect;};
	}; 
	
	var html = '';
	html = html + '<table class="stats_table">';
	html = html + '<tr><td class="stat_title">Total RC interactions</td><td class="stat">' + formatComma(totalPplReached) + '</td>';
	html = html + '<tr><td class="stat_title">Volunteers Mobilised</td><td class="stat">' + formatComma(totalVols) + '</td>';
	html = html + '<tr><td class="stat_title">Total Food Distributions</td><td class="stat">' + formatComma(totalFoodDists) + '</td>';
	html = html + '<tr><td class="stat_title">Total Health Services</td><td class="stat">' + formatComma(totalMeds) + '</td>';
	html = html + '<tr><td class="stat_title">Total Textiles Provided</td><td class="stat">' + formatComma(totalTextiles) + '</td>';
	html = html + '<tr><td class="stat_title">Total Connectivity</td><td class="stat">' + formatComma(totalConnectivity) + '</td>';
	html = html + '</table>';
	$(id).html(html);
	
}

/*
function stickydiv(){
    var window_top = $(window).scrollTop();
    var div_top = $('#sticky-anchor').offset().top;
    if (window_top > div_top){
        $('#map-container').addClass('sticky');
    }
    else{
        $('#map-container').removeClass('sticky');
    }
};

$(window).scroll(function(){
    stickydiv();
}); 
*/

//load data

// WITH THE FORCE...
var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?filter01=replace-map&replace-map-url01=https%3A//docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub%3Fgid%3D493036357%26single%3Dtrue%26output%3Dcsv&filter02=merge&merge-url02=https%3A//docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&merge-tags02=%23country%2Bcode&merge-keys02=%23country-code&force=on&url=https%3A//docs.google.com/spreadsheets/d/17UV2Zqkz6YDWIEgzT16_XCMLE7_VXjo7U-Wme01fnXQ/edit%3Fusp%3Ddrive_web',
    dataType: 'json',
});  

// WITHOUT THE FORCE...
/* var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'http://proxy.hxlstandard.org/data.json?filter01=replace-map&replace-map-url01=https%3A//docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub%3Fgid%3D493036357%26single%3Dtrue%26output%3Dcsv&filter02=merge&merge-url02=https%3A//docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&merge-tags02=%23country%2Bcode&merge-keys02=%23country-code&url=https%3A//docs.google.com/spreadsheets/d/17UV2Zqkz6YDWIEgzT16_XCMLE7_VXjo7U-Wme01fnXQ/edit%3Fusp%3Ddrive_web',
    dataType: 'json',
});  */


//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: 'data/geom.json', 
    dataType: 'json',
});

var migActiveCall = $.ajax({ 
    type: 'GET', 
    url: 'data/mig_active_locs_geojson.json', 
    dataType: 'json',
});

//when both ready construct dashboard

$.when(dataCall, geomCall, migActiveCall).then(function(dataArgs, geomArgs, mig){
    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    //console.log(geom);
    var data = hxlProxyToJSON(dataArgs[0],true);
    //console.log(data);
	var dateFormat = d3.time.format("%d %b %Y");
    data.forEach(function(d){
        d['Last data update'] = dateFormat.parse(d['Last data update']);
    });
    generateDashboard(data,geom,mig);
	generateStats("#key_stats",data);
	
});

