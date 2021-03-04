var section = "";

//open tab in the info panel
function openSection(evt, sec) {
   section = sec;
   var i, tabcontent, tablinks
   document.getElementById("main_panel").style.visibility = "hidden";
   document.getElementById("main_panel").style.height = 0;
   tabcontent = document.getElementsByClassName("tabcontent");
   racesumchart.legend.hide();
   agesumchart.legend.hide();

   $("#county-chart_income").text("");
   for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
   }
   tablinks = document.getElementsByClassName("tablinks");
   for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
   }
   document.getElementById(sec).style.display = "block";
   evt.currentTarget.className += " active";
}



var mymap = L.map('map', {
   center: [47.33, -121.93],
   zoom: 8,
   maxZoom: 10,
   minZoom: 3,
   zoomControl: false,
   detectRetina: true
});

var grayscale = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png').addTo(mymap);
var streets = L.tileLayer('http://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png');
var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x');

counties = {};
income = {};
age = {};
medianincome = {};
data = null;
Promise.all([d3.json("assets/country_bound_data.geojson")]).then(function(datasets) {
   countyLayer = L.geoJSON(datasets[0], {
      onEachFeature: onEachFeature,
      style: {
         fillOpacity: 0.4,
         weight: 1,
         opacity: 3,
         color: '#4E4C4C',
      }
   }).addTo(mymap);
   //generate graph


   function onEachFeature(feature, layer) {
      layer.on({
         mouseover: highlightFeature,
         click: clickFeature,
         mouseout: resetHighlight
      });
   }

   //this function works when the mouse hovers over on a map feature.
   function highlightFeature(e) {
      // e indicates the current event
      var feature = e.target; //the target capture the object which the event associates with
      feature.setStyle({
         weight: 2,
         opacity: 0.8,
         color: '#e3e3e3',
         fillColor: '#00ffd9',
         fillOpacity: 0.1
      });
   }


   getSummaryDataset();


   function getSummaryDataset() {
      maindata = countyLayer;
      raceSum = {};
      ageSum = {};
      incomeSum = {};

      datasets[0].features.forEach(function(d) {

         incomeSum[d.properties.JURISDIC_2] = [d.properties.Census_County_2010_PctPoverty,
            d.properties.Census_County_2010_Income
         ];
         raceSum[d.properties.JURISDIC_2] = [d.properties.Census_County_2010_White,
            d.properties.Census_County_2010_AfricanAme, d.properties.Census_County_2010_AmericanIn,
            d.properties.Census_County_2010_AsianAlone, d.properties.Census_County_2010_SomeOtherR
         ];
         age[d.properties.JURISDIC_3] = [d.properties.Census_County_2010_M_Under5 + d.properties.Census_County_2010_F_Under5 +
            d.properties.Census_County_2010_M_5to9 + d.properties.Census_County_2010_F_5to9,
            //0-9

            d.properties.Census_County_2010_M_10to14 + d.properties.Census_County_2010_F_10to14 +
            d.properties.Census_County_2010_M_15to17 + d.properties.Census_County_2010_F_15to17,
            //10-17

            d.properties.Census_County_2010_M_18to19 + d.properties.Census_County_2010_F_18to19 +
            d.properties.Census_County_2010_M_20 + d.properties.Census_County_2010_F_20 +
            d.properties.Census_County_2010_M_21 + d.properties.Census_County_2010_F_21,
            //18-21

            d.properties.Census_County_2010_M_22to24 + d.properties.Census_County_2010_F_22to24 +
            d.properties.Census_County_2010_M_25to29 + d.properties.Census_County_2010_F_25to29,
            //22-29

            d.properties.Census_County_2010_M_30to34 + d.properties.Census_County_2010_F_30to34 +
            d.properties.Census_County_2010_M_35to39 + d.properties.Census_County_2010_F_35to39,
            //30-39

            d.properties.Census_County_2010_M_40to44 + d.properties.Census_County_2010_F_40to44 +
            d.properties.Census_County_2010_M_45to49 + d.properties.Census_County_2010_F_45to49,
            //40-49

            d.properties.Census_County_2010_M_50to54 + d.properties.Census_County_2010_F_50to54 +
            d.properties.Census_County_2010_M_55to59 + d.properties.Census_County_2010_F_55to59,
            //50-59

            d.properties.Census_County_2010_M_60to61 + d.properties.Census_County_2010_M_62to64 +
            d.properties.Census_County_2010_M_65to66 + d.properties.Census_County_2010_M_67to69 +
            d.properties.Census_County_2010_M_70to74 + d.properties.Census_County_2010_F_60to61 +
            d.properties.Census_County_2010_F_62to64 + d.properties.Census_County_2010_F_65to66 +
            d.properties.Census_County_2010_F_67to69 + d.properties.Census_County_2010_F_70to74,
            //60-74

            d.properties.Census_County_2010_Total_AGE
         ];

         medianincome[d.properties.JURISDIC_2] = d.properties.Census_County_2010_Income;

      })
      generateBar_race_sum(raceSum);
      generateBar_income_sum(incomeSum);
      generateBar_age_sum(age, "donut", "#county-chart_sum_age");

   }



   function resetHighlight(e) {
      countyLayer.resetStyle(e.target);
   }

   // 6.6 bind the onMapClick function to the mymap object.


   datasets[0].features.forEach(function(d) {
      counties[d.properties.JURISDIC_3] = [d.properties.Census_County_2010_White,
         d.properties.Census_County_2010_AfricanAme, d.properties.Census_County_2010_AmericanIn,
         d.properties.Census_County_2010_AsianAlone, d.properties.Census_County_2010_SomeOtherR
      ];
      income[d.properties.JURISDIC_2] = Math.round((d.properties.Census_County_2010_PctPoverty + Number.EPSILON) * 100) / 10000;

   })
});



function generateBar_race_sum(data) {
   console.log("in race");
   summary = [0, 0, 0, 0, 0];
   size = 0
   for (var m in data) {
      size++;
      for (var i = 0; i < data[m].length; i++) {
         summary[i] = summary[i] + data[m][i];
      }
   }

   racesumchart = c3.generate({
      data: {
         columns: [
            ['White', summary[0]],
            ['Black', summary[1]],
            ['Native', summary[2]],
            ['Asian', summary[3]],
            ['Other', summary[4]]
         ],
         type: 'pie'
      },
      legend: {
         show: true
      },
      size: {
         width: 500,
         height: 300
      },
      label: {
         format: function(value, ratio, id) {
            return d3.format('$')(value);
         }
      },
      bindto: "#county-chart_sum_race" //bind the chart to the place holder element "county-chart"
   });
}


function generateBar_income_sum(data) {
   //画图记得在tab 方程里隐藏
   console.log("in income");
   summary = [0, 0];
   toptenPoor = generateBar_income();
   size = 0
   for (var m in data) {
      size++;
      summary[0] = summary[0] + data[m][0];
      summary[1] = summary[1] + data[m][1];
   }
   poverty = summary[0] / size;
   income_sum = summary[1] / size;

   poverty = Math.round((poverty + Number.EPSILON) * 100) / 100;
   income_sum = Math.round((income_sum + Number.EPSILON));
   generateBar_income_median_sum();
   $("#desc_subsum_income").text("The overall poverty rate for WA is " + poverty +
      "% and the median income of " + income_sum + " dollars per year for each household");

}

function generateBar_income_median_sum() {


   x = (Object.keys(medianincome));
   x.reverse();
   x.push("medianincome");
   x.reverse();
   console.log(Object.keys(medianincome));
   y = Object.values(medianincome);
   for (var m in y) {
      y[m] = y[m] - 30000;
   }
   y.reverse();
   y.push("median income:");
   y.reverse();

   bchart = c3.generate({
      size: {
         height: 400,
         width: 450
      },
      data: {
         x: 'medianincome',
         columns: [x, y], //input the x - race, y - the corresponding population.
         type: 'bar', //a bar chart
      },
      axis: {
         x: { //race
            type: 'category',
            show: false,
            tick: {
               rotate: -90,
               multiline: true,

            }
         },
         y: { //count
            show: true,
            tick: {
               format: function(d) {
                  return (d + 30000 + "$");
               }
            },
         }
      },
      legend: {
         show: false
      },
      bindto: "#county-chart_sum_income" //bind the chart to the place holder element "county-chart".
   });

}

function generateBar_age_sum(data, type, place) {
   console.log("in age");
   summary = [0, 0, 0, 0, 0, 0, 0, 0, 0];

   '0-9', "10-17", "18-21", "22-29", "30-39", "40-49", "50-59", "60-74", "above 75"
   size = 0
   for (var m in data) {
      size++;
      for (var i = 0; i < data[m].length; i++) {
         summary[i] = summary[i] + data[m][i];
      }
   }
   age75_above = summary[8] - summary[7] - summary[6] - summary[5] - summary[4] - summary[3] - summary[2] - summary[1] - summary[0];

   agesumchart = c3.generate({
      data: {
         // iris data from R
         columns: [
            ["0-9", summary[0]],
            ["10-17", summary[1]],
            ["18-21", summary[2]],
            ["22-29", summary[3]],
            ["30-39", summary[4]],
            ["40-49", summary[5]],
            ["50-59", summary[6]],
            ["60-74", summary[7]],
            ["above 75", age75_above]
         ],
         type: type
      },
      donut: {
         title: "Census 2010"
      },
      legend: {
         show: true
      },
      size: {
         width: 500,
         height: 350
      },
      label: {
         format: function(value, ratio, id) {
            return d3.format('$')(value);
         }
      },
      bindto: place //bind the chart to the place holder element "county-chart"
   });
}


new L.Control.Zoom({
   position: 'bottomright'
}).addTo(mymap);

var parksTile = L.tileLayer('tiles/parks/{z}/{x}/{y}.png', {
   maxZoom: 11,
   minZoom: 6,
   attribution: 'Generated by Fred Zhao'
});
// Add the park map.

var highwayTile = L.tileLayer('tiles/highway/{z}/{x}/{y}.png', {
   maxZoom: 11,
   minZoom: 6,
   attribution: 'Generated by Fred Zhao',
});


var baseLayers = {
   'Grayscale': grayscale,
   'Streets': streets,
   'Satellite': satellite
};


var overlays = {
   'Parks Viewing sights': parksTile,
   'State Highway': highwayTile
}

L.control.layers(baseLayers, overlays, {
   collapsed: false,
   position: 'topright'
}).addTo(mymap);


function sortJsObject(obj) {
   items = Object.keys(obj).map(function(key) {
      return [key, obj[key]];
   });
   items.sort(function(first, second) {
      return second[1] - first[1];
   });
   sorted_obj = {}
   $.each(items, function(k, v) {
      use_key = v[0]
      use_value = v[1]
      sorted_obj[use_key] = use_value
   })
   return (sorted_obj)
}
// 7.3 execute the sortJsObject function


mymap.on('click', onMapClick);
// when click on any place on the map expect the counties layer, the text on the sidebar will be reset to the total number of WA.
function onMapClick(e) {
   $("#placename").text("Washington state");
   racesumchart.legend.show();
   agesumchart.legend.show();
   document.getElementById("main_panel").style.visibility = "visible";
   document.getElementById("main_panel").style.height = "inherit";
   tabcontent = document.getElementsByClassName("tabcontent");
   tabcontent[0].style.display = "none";
   tabcontent[1].style.display = "none";
   tabcontent[2].style.display = "none";
   tabcontent = document.getElementsByClassName("tabcontent");
   for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
   }
   tablinks = document.getElementsByClassName("tablinks");
   for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
   }
}


function clickFeature(e) {
   if (section == "Race") {
      console.log("in race");
      L.DomEvent.stopPropagation(e);
      countyname = e.target.feature.properties.JURISDIC_3;
      population = e.target.feature.properties.Census_County_2010_Total_AGE;
      $("#placename_race").text("County Name: " + countyname);
      $("#desc_race").text(countyname + "'s total population is " + population + ". below shows its racial distribution");
      generateBar_race(countyname);


   } else if (section == "Income") {
      console.log("in income");
      L.DomEvent.stopPropagation(e);
      countyname = e.target.feature.properties.JURISDIC_3;
      $("#placename_income").text("County Name: " + countyname);
      averageIncome = e.target.feature.properties.Census_County_2010_Income;
      rank = generateBar_income(countyname);
      rank_median = generateBar_income_median(countyname);
      $("#chart_des_income").text("The above graph shows 10 counties nearby " + countyname + " in the poverty rank and median income rank, both from high to low");
      $("#desc_income").text(countyname + "'s median income is " + averageIncome + ", the poverty rate rank is " + rank + " in the washington state (The lower the rank means it has the lower poverty rate), with a median income ranked " + rank_median + " in the washington state");


   } else if (section == "Age") {
      L.DomEvent.stopPropagation(e);
      countyname = e.target.feature.properties.JURISDIC_3;
      generateBar_age(countyname);
      $("#placename_age").text("County Name: " + countyname);

      $("#desc_age").text("The graph abvoe shows the population of different age group, we can see the whole structure of the population age");

   }
}

function generateBar_race(countyname) {
   x = ["White", "Black", "Native", "Asian", "Other"];
   x.reverse();
   x.push("race");
   x.reverse();

   y = Object.values(counties[countyname]);
   y.reverse();
   y.push("Population:");
   y.reverse();

   chart = c3.generate({
      size: {
         height: 350,
         width: 400
      },
      data: {
         x: 'race',
         columns: [x, y], //input the x - race, y - the corresponding population.
         type: 'bar', //a bar chart
      },
      axis: {
         x: { //race
            type: 'category',
            tick: {
               rotate: -60,
               multiline: false
            }
         },
         y: { //count
            show: true,
            tick: {},
         }
      },
      legend: {
         show: false
      },
      bindto: "#county-chart_race" //bind the chart to the place holder element "county-chart".
   });
}


function generateBar_income(countyname) {
   income_sorted = sortJsObject(income);
   count = 0;
   rank = 0;
   for (var m in income_sorted) {
      count++;
      if (countyname == m + " County") {
         rank = count;
      }
   }
   console.log("income rank" + rank);
   originalrank = rank;
   valuechange = false;
   if (rank <= 5) {
      rank = 5;
      valuechange = true;
   } else if (rank >= 34) {
      rank = 34;
      valuechange = true;
   }
   x = Object.keys(income_sorted).slice(rank - 5, rank + 5);
   x.reverse();
   x.push("income");
   x.reverse();

   y = Object.values(income_sorted).slice(rank - 5, rank + 5);
   y.reverse();
   y.push("poverty rate:");
   y.reverse();

   bchart = c3.generate({
      size: {
         height: 351,
         width: 400
      },
      data: {
         x: 'income',
         columns: [x, y], //input the x - race, y - the corresponding population.
         type: 'bar', //a bar chart
         color: function(inColor, data) {
            var colors = ['#FABF62', '#ACB6DD'];
            if (valuechange == false) {
               if (data.index == 4) {
                  return colors[1];
               }
            } else {
               if (originalrank >= 34) {
                  colorindex = 10 - (39 - originalrank) - 1;
                  if (data.index == colorindex) {
                     return colors[1];
                  }
               } else {
                  if (data.index == originalrank - 1) {
                     return colors[1];
                  }
               }
            }
            return inColor;
         }
      },
      axis: {
         x: {
            type: 'category',
            tick: {
               rotate: -60,
               multiline: false

            }
         },
         y: { //count
            show: true,
            tick: {
               format: function(d) {
                  return (Math.round((d + Number.EPSILON) * 10000) / 100 + "%");;
               }
            },
         }
      },
      legend: {
         show: false
      },
      bindto: "#county-chart_income" //bind the chart to the place holder element "county-chart".
   });
   return originalrank;
}


function generateBar_income_median(countyname) {
   median_income_sorted = sortJsObject(medianincome);
   count = 0;
   rank_median = 0;
   for (var m in median_income_sorted) {
      count++;
      if (countyname == m + " County") {
         rank_median = count;
      }
   }
   valuechange = false;
   originalrank_median = rank_median;
   if (rank_median <= 5) {
      rank_median = 5
      valuechange = true;
   } else if (rank_median >= 34) {
      rank_median = 34
      valuechange = true;
   }
   x = Object.keys(median_income_sorted).slice(rank_median - 5, rank_median + 5);
   x.reverse();
   x.push("medianincome");
   x.reverse();

   y = Object.values(median_income_sorted).slice(rank_median - 5, rank_median + 5);
   y.reverse();
   y.push("median income:");
   y.reverse();

   bchart = c3.generate({
      size: {
         height: 351,
         width: 400
      },
      data: {
         x: 'medianincome',
         columns: [x, y], //input the x - race, y - the corresponding population.
         type: 'bar', //a bar chart
         color: function(inColor, data) {
            var colors = ['#FABF62', '#ACB6DD'];
            if (valuechange == false) {
               if (data.index == 4) {
                  return colors[1];
               }
            } else {
               if (originalrank_median >= 34) {
                  colorindex = 10 - (39 - originalrank_median) - 1;
                  if (data.index == colorindex) {
                     return colors[1];
                  }
               } else {
                  if (data.index == originalrank_median - 1) {
                     return colors[1];
                  }
               }
            }
            return inColor;
         }
      },
      axis: {
         x: { //race
            type: 'category',
            tick: {
               rotate: -60,
               multiline: false

            }
         },
         y: { //count
            show: true,
            tick: {
               format: function(d) {
                  return (d + "$");
               }
            },
         }
      },
      legend: {
         show: false
      },
      bindto: "#county-chart_income_median" //bind the chart to the place holder element "county-chart".
   });
   return originalrank_median;
}






summary = [];
age75_above = 0;

function generateBar_age(countyname) {
   console.log(countyname);
   summary = age[countyname];
   console.log(summary);
   age75_above = summary[8] - summary[7] - summary[6] - summary[5] - summary[4] - summary[3] - summary[2] - summary[1] - summary[0];

   bchart = c3.generate({
      size: {
         height: 400,
         width: 440
      },
      data: {

         x: 'x',
         columns: [
            ['x', '0-9', "10-17", "18-21", "22-29", "30-39", "40-49", "50-59", "60-74", "above 75"],
            ['population', summary[0], summary[1], summary[2], summary[3], summary[4], summary[5], summary[6], summary[7], age75_above]
         ],

         type: 'bar', //a bar chart
      },

      axis: {
         rotated: true,
         x: { //race
            type: 'category',
            tick: {
               rotate: -60,
               multiline: false

            }
         },
         y: { //count
            show: true,

            tick: {
               rotate: -60

            },
         },
         label: {
            format: function(value, ratio, id) {
               return d3.format('$')(value);
            }
         },
      },
      legend: {
         show: false
      },
      bindto: "#county-chart_age" //bind the chart to the place holder element "county-chart".
   });
}
