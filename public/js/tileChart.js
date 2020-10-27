/**
 * Constructor for the TileChart
 */
function TileChart() {
  var self = this;
  self.init();
}

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function () {
  var self = this;

  //Gets access to the div element created for this chart and legend element from HTML
  var divTileChart = d3.select("#tiles").classed("content", true);
  var legend = d3.select("#legend").classed("content", true);
  self.margin = { top: 30, right: 20, bottom: 30, left: 50 };

  var svgBounds = divTileChart.node().getBoundingClientRect();
  self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
  self.svgHeight = self.svgWidth / 2;
  var legendHeight = 150;

  //creates svg elements within the div
  self.legendSvg = legend
    .append("svg")
    .attr("width", self.svgWidth)
    .attr("height", legendHeight)
    .attr("transform", "translate(" + self.margin.left + ",0)");

  self.svg = divTileChart
    .append("svg")
    .attr("width", self.svgWidth)
    .attr("height", self.svgHeight)
    .attr("transform", "translate(" + self.margin.left + ",0)")
    .style("bgcolor", "green");
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
  var self = this;
  if (party == "R") {
    return "republican";
  } else if (party == "D") {
    return "democrat";
  } else if (party == "I") {
    return "independent";
  }
};

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
  var self = this;
  var text =
    "<h2 class =" +
    self.chooseClass(tooltip_data.winner) +
    " >" +
    tooltip_data.state +
    "</h2>";
  text += "Electoral Votes: " + tooltip_data.electoralVotes;
  text += "<ul>";
  tooltip_data.result.forEach(function (row) {
    text +=
      "<li class = " +
      self.chooseClass(row.party) +
      ">" +
      row.nominee +
      ":\t\t" +
      row.votecount +
      "(" +
      row.percentage +
      "%)" +
      "</li>";
  });
  text += "</ul>";
  return text;
};

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function (electionResult, colorScale) {
  var self = this;
  const width = self.svgWidth / 12;
  const height = self.svgHeight / 8;
  const coordinatesDic = {
    AK: [0, 0],
    ME: [11, 0],
    VT: [10, 1],
    NH: [11, 1],
    WA: [1, 2],
    ID: [2, 2],
    MT: [3, 2],
    ND: [4, 2],
    MN: [5, 2],
    IL: [6, 2],
    WI: [7, 2],
    MI: [8, 2],
    NY: [9, 2],
    RI: [10, 2],
    MA: [11, 2],
    OR: [1, 3],
    NV: [2, 3],
    WY: [3, 3],
    SD: [4, 3],
    IA: [5, 3],
    IN: [6, 3],
    OH: [7, 3],
    PA: [8, 3],
    NJ: [9, 3],
    CT: [10, 3],
    CA: [1, 4],
    UT: [2, 4],
    CO: [3, 4],
    NE: [4, 4],
    MO: [5, 4],
    KY: [6, 4],
    WV: [7, 4],
    VA: [8, 4],
    MD: [9, 4],
    DC: [10, 4],
    AZ: [2, 5],
    NM: [3, 5],
    KS: [4, 5],
    AR: [5, 5],
    TN: [6, 5],
    NC: [7, 5],
    SC: [8, 5],
    DE: [9, 5],
    OK: [4, 6],
    LA: [5, 6],
    MS: [6, 6],
    AL: [7, 6],
    GA: [8, 6],
    HI: [1, 7],
    TX: [4, 7],
    FL: [9, 7],
  };
  //Calculates the maximum number of columns to be laid out on the svg
  self.maxColumns = d3.max(electionResult, function (d) {
    return parseInt(d["Space"]);
  });

  //Calculates the maximum number of rows to be laid out on the svg
  self.maxRows = d3.max(electionResult, function (d) {
    return parseInt(d["Row"]);
  });
  //for reference:https://github.com/Caged/d3-tip
  //Use this tool tip element to handle any hover over the chart
  tip = d3
    .tip()
    .attr("class", "d3-tip")
    .direction("se")
    .offset(function () {
      return [0, 0];
    })
    .html(function (e, d) {
      /* populate data in the following format
       * tooltip_data = {
       * "state": State,
       * "winner":d.State_Winner
       * "electoralVotes" : Total_EV
       * "result":[
       * {"nominee": D_Nominee_prop,"votecount": D_Votes,"percentage": D_Percentage,"party":"D"} ,
       * {"nominee": R_Nominee_prop,"votecount": R_Votes,"percentage": R_Percentage,"party":"R"} ,
       * {"nominee": I_Nominee_prop,"votecount": I_Votes,"percentage": I_Percentage,"party":"I"}
       * ]
       * }
       * pass this as an argument to the tooltip_render function then,
       * return the HTML content returned from that method.
       * */
      tooltip_data = {
        state: d.State,
        winner: d.winner,
        electoralVotes: d.Total_EV,
        result: [
          {
            nominee: d.D_Nominee,
            votecount: d.D_Votes,
            percentage: d.D_Percentage,
            party: "D",
          },
          {
            nominee: d.R_Nominee,
            votecount: d.R_Votes,
            percentage: d.R_Percentage,
            party: "R",
          },
          {
            nominee: d.I_Nominee,
            votecount: d.I_Votes,
            percentage: d.I_Percentage,
            party: "I",
          },
        ],
      };
      return self.tooltip_render(tooltip_data);
    });

  //Creates a legend element and assigns a scale that needs to be visualized

  var legendQuantile = d3
    .legendColor()
    .shapeWidth(120)
    .cells(10)
    .orient("horizontal")
    .scale(colorScale);
  self.legendSvg
    .append("g")
    .attr("class", "legendQuantile")
    .call(legendQuantile);
  // ******* TODO: PART IV *******
  //Tansform the legend element to appear in the center and make a call to this element for it to display.
  // self.legendSvg.call(legendQuantile);
  // 8 Rows 12 Cols
  //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.
  const mapSelection = self.svg.selectAll("g rect text").data(electionResult);
  self.svg.call(tip);
  const group = mapSelection
    .enter()
    .append("g")
    .on("mouseover", (event, d) => tip.show(event, d))
    .on("mouseout", tip.hide);
  mapSelection
    .on("mouseover", (event, d) => tip.show(event, d))
    .on("mouseout", tip.hide);
  mapSelection.exit().remove();
  group
    .append("rect")
    .attr("class", "tile")
    .attr("height", height)
    .attr("width", width)
    .attr("fill", (d) => {
      return d.winner != "I" ? colorScale(d.margin) : "#45ad6a";
    })
    .attr("x", ({ Abbreviation }) => coordinatesDic[Abbreviation][0] * width)
    .attr("y", ({ Abbreviation }) => coordinatesDic[Abbreviation][1] * height);
  group
    .attr("class", "tile")
    .attr("height", height)
    .attr("width", width)
    .attr("fill", (d) => {
      return d.winner != "I" ? colorScale(d.margin) : "#45ad6a";
    })
    .attr("x", ({ Abbreviation }) => coordinatesDic[Abbreviation][0] * width)
    .attr("y", ({ Abbreviation }) => coordinatesDic[Abbreviation][1] * height);
  //Display the state abbreviation and number of electoral votes on each of these rectangles
  group
    .append("text")
    .text(({ Abbreviation }) => Abbreviation)
    .attr("class", "tilestext")
    .attr(
      "x",
      ({ Abbreviation }) => coordinatesDic[Abbreviation][0] * width + width / 2
    )
    .attr(
      "y",
      ({ Abbreviation }) =>
        coordinatesDic[Abbreviation][1] * height + height / 2
    );
  group
    .append("text")
    .text(({ Total_EV }) => Total_EV)
    .attr("class", "tilestext smaller")
    .attr(
      "x",
      ({ Abbreviation }) => coordinatesDic[Abbreviation][0] * width + width / 2
    )
    .attr(
      "y",
      ({ Abbreviation }) =>
        coordinatesDic[Abbreviation][1] * height + height / 2 + 25
    );

  //Use global color scale to color code the tiles.

  //HINT: Use .tile class to style your tiles;
  // .tilestext to style the text corresponding to tiles

  //Call the tool tip on hover over the tiles to display stateName, count of electoral votes
  //then, vote percentage and number of votes won by each party.
  //HINT: Use the .republican, .democrat and .independent classes to style your elements.
};
