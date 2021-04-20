import * as d3 from "d3";
import * as topojson from "topojson-client";
const chilejson = require("./chile-regions.json");
const d3Composite = require("d3-composite-projections");
import { latLongRegions } from "./regions";
import { stats1, stats2, stats3, stats4, stats5, stats6, ResultEntry } from "./stats";


// set the affected color scale
const color = d3
  .scaleThreshold<number, string>()
  .domain([0, 10, 20, 50, 100, 200, 300, 600, 3000])
  .range([
    "#FFFFF",
    "#e1ecb4",
    "#d2e290",
    "#c3da6e",
    "#c6d686",
    "#A6D480",
    "#77BB79",
    "#49A173",
    "#006358",
  ]);


const assignCountryBackgroundColor = (comunidad: string,
                                      stats: ResultEntry[]) => {
  const item = stats.find(
    (item) => item.name === comunidad
  );
  return item ? color(item.value) : color(0);
};
  

const maxAffected = stats1.reduce(
  (max, item) => (item.value > max ? item.value : max),
  0
);

const affectedRadiusScale = d3
  .scaleLinear()
  .domain([0, <any>maxAffected])
  .range([1, 30]); // 30 pixel max radius, we could calculate it relative to width and height

const calculateRadiusBasedOnAffectedCases = (
  comunidad: string,
  dataset: ResultEntry[]
) => {
  const entry = dataset.find((item) => item.name === comunidad);

  return entry ? (affectedRadiusScale(entry.value)+0) : 0;
};

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");


const aProjection = d3
  .geoMercator()
  // Let's make the map bigger to fit in our resolution
  .scale(830)
  // Let's center the map
  .translate([1500, -240]);

const geoPath = d3.geoPath().projection(aProjection);

const geojson = topojson.feature(
  chilejson,
  chilejson.objects.Regiones_Clean
);

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any);
 

const updateChart = (stat: ResultEntry[]) => {
  console.log("updating")
  svg.selectAll("path").remove();
  svg.selectAll("circle").remove();
  svg.selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any)
  .style("fill", function (d: any) {
    return assignCountryBackgroundColor(d.properties.Region, stat);
  });
  svg
    .selectAll("circle")
    .data(latLongRegions)
    .enter()
    .append("circle")
    .attr("class", "affected-marker")
    .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name, stat))
    .attr("cx", (d) => aProjection([d.long, d.lat])[0])
    .attr("cy", (d) => aProjection([d.long, d.lat])[1])
    .attr("d", geoPath as any)
    .on("mouseover", function (d, i) {
      d3.select(this).attr("class", "selected-marker");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).attr("class", "affected-marker");
    });
};


// Buttons and changing data series
document
  .getElementById("14 April 2021")
  .addEventListener("click", function handleResults() {
    updateChart(stats1);
  });

document
  .getElementById("15 April 2021")
  .addEventListener("click", function handleResults() {
    updateChart(stats2);
  });

document
.getElementById("16 April 2021")
.addEventListener("click", function handleResults() {
  updateChart(stats3);
});

document
.getElementById("17 April 2021")
.addEventListener("click", function handleResults() {
  updateChart(stats4);
});

document
.getElementById("18 April 2021")
.addEventListener("click", function handleResults() {
  updateChart(stats5);
});

document
.getElementById("19 April 2021")
.addEventListener("click", function handleResults() {
  updateChart(stats6);
});
