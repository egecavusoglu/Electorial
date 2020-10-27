/**
 * Constructor for the Year Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function YearChart(
  electoralVoteChart,
  tileChart,
  votePercentageChart,
  electionWinners
) {
  var self = this;

  self.electoralVoteChart = electoralVoteChart;
  self.tileChart = tileChart;
  self.votePercentageChart = votePercentageChart;
  self.electionWinners = electionWinners;
  self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function () {
  var self = this;
  self.margin = { top: 10, right: 20, bottom: 30, left: 50 };
  var divyearChart = d3.select("#year-chart").classed("fullView", true);

  //Gets access to the div element created for this chart from HTML
  self.svgBounds = divyearChart.node().getBoundingClientRect();
  self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
  self.svgHeight = 100;

  //creates svg element within the div
  self.svg = divyearChart
    .append("svg")
    .attr("width", self.svgWidth)
    .attr("height", self.svgHeight);
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
YearChart.prototype.chooseClass = function (party) {
  var self = this;
  if (party == "R") {
    return "yearChart republican";
  } else if (party == "D") {
    return "yearChart democrat";
  } else if (party == "I") {
    return "yearChart independent";
  }
};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */
YearChart.prototype.update = async function () {
  var self = this;
  var clicked = null;

  //Domain definition for global color scale
  var domain = [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60];

  //Color range for global color scale
  var range = [
    "#0066CC",
    "#0080FF",
    "#3399FF",
    "#66B2FF",
    "#99ccff",
    "#CCE5FF",
    "#ffcccc",
    "#ff9999",
    "#ff6666",
    "#ff3333",
    "#FF0000",
    "#CC0000",
  ];

  //Global colorScale to be used consistently by all the charts
  self.colorScale = d3.scaleQuantile().domain(domain).range(range);

  self.electionWinners.forEach(function (d) {
    d.YEAR = +d.YEAR;
  });

  // ******* TODO: PART I *******
  // Create the chart by adding circle elements representing each election year
  //The circles should be colored based on the winning party for that year
  //HINT: Use the chooseClass method to choose the color corresponding to the winning party.
  const {
    svg,
    electionWinners,
    electoralVoteChart,
    votePercentageChart,
    tileChart,
    colorScale,
    svgWidth,
    margin,
  } = self;
  var yearScale = d3
    .scaleLinear()
    .domain([
      d3.min(electionWinners, function (d) {
        return d.YEAR;
      }),
      d3.max(electionWinners, function (d) {
        return d.YEAR;
      }),
    ])
    .range([0 + margin.left, svgWidth - margin.right]);
  //Style the chart by adding a dashed line that connects all these years.
  //HINT: Use .lineChart to style this dashed line
  svg
    .append("line")
    .attr("class", "lineChart")
    .attr("x1", margin.left)
    .attr("x2", svgWidth - margin.right)
    .attr("y1", 50)
    .attr("y2", 50);
  //HINT: Use the .yearChart class to style your circle elements

  //Clicking on any specific year should highlight that circle and  update the rest of the visualizations
  //HINT: Use .highlighted class to style the highlighted circle
  svg
    .selectAll("circle")
    .data(electionWinners)
    .enter()
    .append("circle")
    .attr("class", "yearChart")
    .attr("class", (x) => this.chooseClass(x.PARTY))
    .attr("r", 13)
    .attr("cx", (d) => yearScale(d.YEAR))
    .attr("cy", 50)
    .on("click", (d, i) => renderCharts(d.target, i));

  //   Append text information of each year right below the corresponding circle
  //HINT: Use .yeartext class to style your text elements
  svg
    .selectAll("text")
    .data(electionWinners)
    .enter()
    .append("text")
    .text((d) => d.YEAR)
    .attr("class", "yearChartText yeartext")
    .attr("x", (d) => yearScale(d.YEAR))
    .attr("y", 80);

  //Election information corresponding to that year should be loaded and passed to
  // the update methods of other visualizations
  let before = null;
  const renderCharts = async (el, i) => {
    if (before) before.classList.remove("highlighted");
    before = el;
    el.classList.add("highlighted");
    console.log(i);
    const data = await d3.csv(`data/election-results-${i.YEAR}.csv`);
    const formattedData = electoralVoteChart.update(data, colorScale);
    votePercentageChart.update(formattedData);
    tileChart.update(formattedData, colorScale);
  };

  //******* TODO: EXTRA CREDIT *******

  //Implement brush on the year chart created above.
  //Implement a call back method to handle the brush end event.
  //Call the update method of brushSelection and pass the data corresponding to brush selection.
  //HINT: Use the .brush class to style the brush.
};
