/**
 * Constructor for the ElectoralVoteChart
 *
 * @param brushSelection an instance of the BrushSelection class
 */
function ElectoralVoteChart() {
  var self = this;
  self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function () {
  var self = this;
  self.margin = { top: 30, right: 20, bottom: 30, left: 50 };

  //Gets access to the div element created for this chart from HTML
  var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
  self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
  self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
  self.svgHeight = 150;

  //creates svg element within the div
  self.svg = divelectoralVotes
    .append("svg")
    .attr("width", self.svgWidth)
    .attr("height", self.svgHeight);
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
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
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
const findWinnerParty = (state) => {
  const {
    D_Percentage,
    I_Percentage,
    R_Percentage,
    D_Votes,
    R_Votes,
    I_Votes,
  } = state;
  const dem = {
    pct: parseFloat(D_Percentage) ? parseFloat(D_Percentage) : 0,
    votes: parseFloat(D_Votes) ? parseFloat(D_Votes) : 0,
    party: "D",
  };
  const rep = {
    pct: parseFloat(R_Percentage) ? parseFloat(R_Percentage) : 0,
    votes: parseFloat(R_Votes) ? parseFloat(R_Votes) : 0,
    party: "R",
  };
  const ind = {
    pct: parseFloat(I_Percentage) ? parseFloat(I_Percentage) : 0,
    votes: parseFloat(I_Votes) ? parseFloat(I_Votes) : 0,
    party: "I",
  };
  const arr = [dem, rep, ind];
  arr.sort((a, b) => b.pct - a.pct);
  // state.margin = arr[0].pct - arr[1].pct;
  state.margin = parseFloat(R_Percentage) - parseFloat(D_Percentage);
  state.winner = arr[0].party;
  state.results = arr;
  return arr[0].party;
};

ElectoralVoteChart.prototype.update = function (electionResult, colorScale) {
  var self = this;

  // ******* TODO: PART II *******
  //Group the states based on the winning party for the state;
  //then sort them based on the margin of victory
  const indps = electionResult
    .filter((i) => findWinnerParty(i) === "I")
    .sort((a, b) => Math.abs(b.margin) - Math.abs(a.margin));
  const reps = electionResult
    .filter((i) => findWinnerParty(i) === "R")
    .sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin));
  const dems = electionResult
    .filter((i) => findWinnerParty(i) === "D")
    .sort((a, b) => Math.abs(b.margin) - Math.abs(a.margin));
  //Create the stacked bar chart.
  //Use the global color scale to color code the rectangles.
  //HINT: Use .electoralVotes class to style your bars.
  const { svg, svgWidth, margin } = self;
  const maxRange = svgWidth - margin.left - margin.right;
  const minRange = 0;
  const totalEv = d3.sum(electionResult, (d) => parseFloat(d.Total_EV));
  const elecScale = d3
    .scaleLinear()
    .domain([0, totalEv])
    .range([minRange, maxRange]);
  let xOffset = {};
  let offset = margin.left;
  const h = 50;
  const y = 50;
  const indTotal = d3.sum(indps, (d) => d.Total_EV); // Total independent EVs
  const demTotal = d3.sum(dems, (d) => d.Total_EV); // Total independent EVs
  const repTotal = d3.sum(reps, (d) => d.Total_EV); // Total independent EVs
  const concatData = indps.concat(dems, reps); // Concat data back after filtering and sorting
  const el = svg.selectAll("rect").data(concatData); // Selection variable
  let textPositions = [indps.length > 0 ? offset : null, null, null];
  const textValues = [indTotal, demTotal, repTotal];
  const textPartyDic = ["independent", "democrat", "republican"];
  // Enter Section
  el.enter()
    .append("rect")
    .attr("class", (d) => `electoralVotes`)
    .attr("width", (d) => {
      offset += elecScale(parseFloat(d.Total_EV));
      const width = elecScale(+d.Total_EV);
      xOffset[d.Abbreviation] = offset - width;
      return width;
    })
    .attr("height", h)
    .attr("x", (d, i) => {
      const x = xOffset[d.Abbreviation];
      if (i == indps.length) {
        textPositions[1] = x;
      } else if (i == concatData.length - 1) {
        textPositions[2] = x;
      }
      return x;
    })
    .attr("y", y)
    .attr("fill", (d) => {
      return d.winner != "I" ? colorScale(d.margin) : "#45ad6a";
    });

  // Update section
  el.attr("class", (d) => `electoralVotes`)
    .attr("width", (d) => {
      offset += elecScale(parseFloat(d.Total_EV));
      const width = elecScale(+d.Total_EV);
      xOffset[d.Abbreviation] = offset - width;
      return width;
    })
    .attr("height", h)
    .attr("x", (d, i) => {
      const x = xOffset[d.Abbreviation];
      if (i == indps.length) {
        textPositions[1] = x;
      } else if (i == concatData.length - 1) {
        textPositions[2] = x;
      }
      return x;
    })
    .attr("y", y)
    .attr("fill", (d) => {
      return d.winner != "I" ? colorScale(d.margin) : "#45ad6a";
    });

  // Exit Section
  el.exit().remove();

  //Display total count of electoral votes won by the Democrat and Republican party
  //on top of the corresponding groups of bars.
  //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
  // chooseClass to get a color based on the party wherever necessary
  const textSelection = svg.selectAll("text").data(textPositions);
  textSelection
    .enter()
    .append("text")
    .text((d, i) => (textValues[i] ? textValues[i] : null))
    .attr("class", (d, i) => `electoralVoteText ${textPartyDic[i]}`)
    .attr("fill", "black")
    .attr("x", (d, i) => textPositions[i])
    .attr("y", y - 10);

  textSelection
    .text((d, i) => (textValues[i] ? textValues[i] : null))
    .attr("class", (d, i) => `electoralVoteText ${textPartyDic[i]}`)
    .attr("fill", "black")
    .attr("x", (d, i) => textPositions[i])
    .attr("y", y - 10);

  textSelection.exit().remove();
  //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
  //HINT: Use .middlePoint class to style this bar.
  const midBarPosition = (textPositions[1] + maxRange) / 2;
  const midBarSelection = svg.selectAll(".middlePoint").data(concatData);
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
  //Just above this, display the text mentioning the total number of electoral votes required
  // to win the elections throughout the country
  //HINT: Use .electoralVotesNote class to style this text element
  midBarSelection
    .enter()
    .append("text")
    .text("Electoral Vote (270 needed to win)")
    .attr("class", "electoralVotesNote")
    .attr("y", y - 20)
    .attr("x", midBarPosition);
  //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

  //******* TODO: PART V *******
  //Implement brush on the bar chart created above.
  //Implement a call back method to handle the brush end event.
  //Call the update method of brushSelection and pass the data corresponding to brush selection.
  //HINT: Use the .brush class to style the brush.

  return concatData;
};
