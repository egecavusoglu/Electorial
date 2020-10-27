/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart() {
  var self = this;
  self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function () {
  var self = this;
  self.margin = { top: 30, right: 20, bottom: 30, left: 50 };
  var divvotesPercentage = d3
    .select("#votes-percentage")
    .classed("content", true);

  //Gets access to the div element created for this chart from HTML
  self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
  self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
  self.svgHeight = 200;

  //creates svg element within the div
  self.svg = divvotesPercentage
    .append("svg")
    .attr("width", self.svgWidth)
    .attr("height", self.svgHeight);
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
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
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
  var self = this;
  var text = "<ul>";
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

  return text;
};

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function (electionResult) {
  var self = this;

  // Variables setup
  const { svg, svgWidth, margin } = self;
  // Calculating the Percentages.
  console.log(electionResult);
  const demTotal = d3.sum(electionResult, (d) => +d.D_Votes);
  const indTotal = d3.sum(electionResult, (d) => +d.I_Votes);
  const repTotal = d3.sum(electionResult, (d) => +d.R_Votes);
  const totalVotes = demTotal + indTotal + repTotal;
  const indPct = ((indTotal / totalVotes) * 100).toFixed(2);
  const demPct = ((demTotal / totalVotes) * 100).toFixed(2);
  const repPct = ((repTotal / totalVotes) * 100).toFixed(2);

  //for reference:https://github.com/Caged/d3-tip
  //Use this tool tip element to handle any hover over the chart
  const tip = d3
    .tip()
    .attr("class", "d3-tip")
    .direction("s")
    .offset(function () {
      return [0, 0];
    })
    .html(function (d, i) {
      /* populate data in the following format
       * tooltip_data = {
       * "result":[
       * {"nominee": D_Nominee_prop,"votecount": D_Votes_Total,"percentage": D_PopularPercentage,"party":"D"} ,
       * {"nominee": R_Nominee_prop,"votecount": R_Votes_Total,"percentage": R_PopularPercentage,"party":"R"} ,
       * {"nominee": I_Nominee_prop,"votecount": I_Votes_Total,"percentage": I_PopularPercentage,"party":"I"}
       * ]
       * }
       * pass this as an argument to the tooltip_render function then,
       * return the HTML content returned from that method.
       * */

      tooltip_data = {
        result: [
          {
            nominee: electionResult[0].D_Nominee,
            votecount: demTotal,
            percentage: demPct,
            party: "D",
          },
          {
            nominee: electionResult[0].R_Nominee,
            votecount: repTotal,
            percentage: repPct,
            party: "R",
          },
          {
            nominee: electionResult[0].I_Nominee,
            votecount: indTotal,
            percentage: indPct,
            party: "I",
          },
        ],
      };
      return self.tooltip_render(tooltip_data);
    });

  // ******* TODO: PART III *******

  //Create the stacked bar chart.
  //Use the global color scale to color code the rectangles.
  //HINT: Use .votesPercentage class to style your bars.
  const maxRange = svgWidth - margin.left - margin.right;

  const pctScale = d3.scaleLinear().domain([0, 100]).range([0, maxRange]);

  const percentages = [indPct, demPct, repPct];
  const partyClassDic = ["independent", "democrat", "republican"];
  const candidates = [
    electionResult[0].I_Nominee,
    electionResult[0].D_Nominee,
    electionResult[0].R_Nominee,
  ];
  const widths = [pctScale(indPct), pctScale(demPct), pctScale(repPct)];
  console.log(widths);
  let xPositions = [0, widths[0], widths[0] + widths[1]];
  let offset = margin.left;

  xPositions = xPositions.map((d) => d + offset);
  console.log(xPositions);
  const h = 50;
  const y = 50;
  const selection = svg.selectAll("rect").data(percentages);
  svg.call(tip);
  selection
    .enter()
    .append("rect")
    .attr("class", (d, i) => `votesPercentage ${partyClassDic[i]}`)
    .attr("x", (d, i) => xPositions[i])
    .attr("height", h)
    .attr("y", y)
    .attr("width", (d, i) => widths[i])
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);
  selection
    .attr("class", (d, i) => `votesPercentage ${partyClassDic[i]}`)
    .attr("x", (d, i) => xPositions[i])
    .attr("height", h)
    .attr("y", y)
    .attr("width", (d, i) => widths[i])
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  selection.exit().remove();
  //Display the total percentage of votes won by each party
  //on top of the corresponding groups of bars.
  //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
  // chooseClass to get a color based on the party wherever necessary
  const labelSelection = svg.selectAll(".label").data(percentages);
  labelSelection
    .enter()
    .append("text")
    .text((d, i) => `${candidates[i]} ${d}%`)
    .attr("class", (d, i) => `label ${partyClassDic[i]}`)
    .attr("y", y - 25)
    .attr("x", (d, i) => {
      if (i == 0) {
        return xPositions[i] + 5;
      } else if (i == 1) {
        return (xPositions[1] + xPositions[2]) / 2;
      } else if (i == 2) {
        return maxRange;
      }
    });
  labelSelection
    .text((d, i) => `${candidates[i]} ${d}%`)
    .attr("class", (d, i) => `label ${partyClassDic[i]}`)
    .attr("y", y - 25)
    .attr("x", (d, i) => {
      if (i == 0) {
        return xPositions[i] + 5;
      } else if (i == 1) {
        return (xPositions[1] + xPositions[2]) / 2;
      } else if (i == 2) {
        return maxRange;
      }
    }); //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
  //HINT: Use .middlePoint class to style this bar.
  const midBarPosition = (xPositions[1] + maxRange) / 2;
  const midBarSelection = svg.selectAll(".middlePoint").data(percentages);
  midBarSelection
    .enter()
    .append("rect")
    .attr("class", "middlePoint")
    .attr("fill", "black")
    .attr("height", h + 20)
    .attr("width", 5)
    .attr("y", y - 10)
    .attr("x", midBarPosition);
  midBarSelection
    .append("rect")
    .attr("class", "middlePoint")
    .attr("fill", "black")
    .attr("height", h + 20)
    .attr("width", 5)
    .attr("y", y - 10)
    .attr("x", (d) => (textPositions[1] + maxRange) / 2);
  midBarSelection.exit().remove();

  //Just above this, display the text mentioning details about this mark on top of this bar
  //HINT: Use .votesPercentageNote class to style this text element
  d3.select("#pctLabel").remove();
  svg
    .append("text")
    .text("Popular Vote (50%)")
    .attr("id", "pctLabel")
    .attr("class", "votesPercentageNote")
    .attr("y", y + h + 30)
    .attr("x", midBarPosition);

  //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
  //then, vote percentage and number of votes won by each party.

  //HINT: Use the chooseClass method to style your elements based on party wherever necessary.
};
