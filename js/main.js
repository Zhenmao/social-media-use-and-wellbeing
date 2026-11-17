d3.csv("data/Wellbeing-by-Time-Spent-on-Social-Media.csv", d3.autoType).then(
  (csv) => {
    ///////////////////////////////////////////////////////////
    //// Data processing //////////////////////////////////////
    ///////////////////////////////////////////////////////////
    const data = processData(csv);

    function processData(csv) {
      return d3.rollup(
        csv,
        (v) => {
          return v.map((d) => {
            return {
              measure: d["Measure"],
              values: ["Low", "Moderate", "High"].map((use) => {
                return {
                  use,
                  value: d[use],
                };
              }),
            };
          });
        },
        (d) => d["Emotion"],
      );
    }

    ///////////////////////////////////////////////////////////
    //// Table ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    const table = d3
      .selectAll(".table-container")
      .data(data)
      .join("div")
      .attr("class", "table-container")
      .append("table")
      .attr("class", "table");

    table
      .append("thead")
      .append("tr")
      .selectChildren("th")
      .data(["Measure", "Low Use", "Moderate Use", "High Use"])
      .join("th")
      .text((d) => d);

    const tr = table
      .append("tbody")
      .selectChildren("tr")
      .data(([_, v]) => v)
      .join("tr");

    tr.append("th")
      .attr("scope", "row")
      .text((d) => d.measure);

    tr.selectChildren("td")
      .data((d) => d.values)
      .join("td")
      .append("div")
      .each(function (d) {
        unitChart(this, d.value);
      });

    ///////////////////////////////////////////////////////////
    //// Unit chart ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    function unitChart(el, value) {
      const nodeRadius = 6;
      const nodeGap = 1;
      const nodes = waffleLayout(100, nodeRadius, nodeGap);

      const container = d3.select(el).attr("class", "unit-chart");

      const svg = d3.select(el).append("svg");
      const g = svg.append("g").attr("class", "nodes");
      g.selectChildren(".node")
        .data(nodes)
        .join("rect")
        .attr("class", "node")
        .attr("data-filled", (d) => d.i < value)
        .attr("x", (d) => d.x - nodeRadius)
        .attr("y", (d) => d.y - nodeRadius)
        .attr("width", nodeRadius * 2)
        .attr("height", nodeRadius * 2);

      const bbox = g.node().getBBox();
      svg
        .attr("width", bbox.width)
        .attr("height", bbox.height)
        .attr("viewBox", [bbox.x, bbox.y, bbox.width, bbox.height]);

      container
        .append("div")
        .attr("class", "value")
        .text(value + "%");
    }

    function waffleLayout(N, nodeRadius, nodeGap) {
      const n = Math.sqrt(N);
      if (n % 1 !== 0)
        throw new Error(`${N} must be a square for waffle layout`);

      const x0 = 0;
      const y0 = (nodeRadius * 2 + nodeGap) * n - nodeGap;

      return d3.range(N).map((i) => {
        const col = i % n;
        const row = Math.floor(i / n);
        return {
          i,
          x: x0 + (nodeRadius * 2 + nodeGap) * col + nodeRadius / 2,
          y: y0 - (nodeRadius * 2 + nodeGap) * row + nodeRadius / 2,
        };
      });
    }

    function phyllotaxisLayout(N, nodeRadius, nodeGap) {
      const spiralAngle = Math.PI * (3 - Math.sqrt(5)); // golden ratio angle 137.508°
      return d3.range(N).map((i) => {
        const angle = i * spiralAngle;
        const radius = Math.sqrt(i + 0.5) * (nodeRadius + nodeGap);
        return {
          i,
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
        };
      });
    }
  },
);
