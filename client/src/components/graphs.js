import React, {useEffect, useRef, useState} from 'react';
import { useAppState } from "../App";
import * as d3 from 'd3';

const bg_color = '#f9f9f9'

export const VoteBreakdown = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 300;
    const height = 225;
    const margin = { top: 40, right: 0, bottom: 45, left: 65 };

    const candidateData = { TRUMP: data.TRUMP, BIDEN: data.BIDEN, OTHER_vote: data.OTHER_vote };

    const candidateLabels = { TRUMP: 'Trump', BIDEN: 'Biden', OTHER_vote: 'Other' };

    const candidateColors = { TRUMP: '#ff6b6b', BIDEN: '#4d79ff', OTHER_vote: '#609966' };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', bg_color)
      .style('border', '1px solid #ccc')
      .style('padding', '10px');

    svg.selectAll('*').remove(); // Clear previous render

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Vote Breakdown');

    // Create scales
    const x = d3.scaleBand()
      .domain(Object.keys(candidateData))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(Object.values(data))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat((d) => candidateLabels[d]))
      .attr('font-size', '14px')
      .style('font-family', 'Montserrat')
      .style('color', '#333');

    // Add y-axis
     svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d * 100).toFixed(0)}%`))
    .attr('font-size', '14px')
    .style('font-family', 'Montserrat')
    .style('color', '#333');

    // Add labels to the axes
    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', '16px')
    .attr('fill', '#333')
    .style('font-family', 'Montserrat')
    .text('Candidates');

    svg.append('text')
    .attr('x', -height / 2)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('font-size', '16px')
    .attr('fill', '#333')
    .style('font-family', 'Montserrat')
    .text('Vote Percentage');

    // Add bars
    svg.selectAll('.bar')
      .data(Object.entries(candidateData))
      .join('rect')
      .attr('class', 'bar')
      .attr('x', ([key]) => x(key))
      .attr('y', ([, value]) => y(value))
      .attr('width', x.bandwidth())
      .attr('height', ([, value]) => y(0) - y(value))
      .attr('fill', ([key]) => candidateColors[key])
      .attr('opacity', 0.8);

    // Add labels on top of bars
    svg.selectAll('.label')
      .data(Object.entries(candidateData))
      .join('text')
      .attr('class', 'label')
      .attr('x', ([key]) => x(key) + x.bandwidth() / 2)
      .attr('y', ([, value]) => y(value) - 5)
      .attr('text-anchor', 'middle')
      .text(([, value]) => `${(value * 100).toFixed(1)}%`)
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .style('font-family', 'Montserrat')
      .attr('fill', 'black');

  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export const RaceBreakdown = ({ data, threshold }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 450;
    const height = 225;
    const margin = { top: 40, right: 0, bottom: 45, left: 65 };

    const raceData = {
      WHITE: data.WHITE,
      BLACK: data.BLACK,
      NATIVE: data.NATIVE,
      ASIAN: data.ASIAN,
      // NHPI: data.NHPI,
      OTHER_race: data.OTHER_race
    };

    // Aggregate races below threshold into "Other"
    Object.keys(raceData).forEach((key) => {
      if (raceData[key] < threshold) {
        raceData["OTHER_race"] += raceData[key];
        delete raceData[key];
      }
    });

    const raceLabels = {
      WHITE: 'White',
      BLACK: 'Black',
      NATIVE: 'Native',
      ASIAN: 'Asian',
      NHPI: 'NHPI',
      OTHER_race: 'Other'
    };

    const raceColors = {
      WHITE: '#ffad16',
      BLACK: '#9966ff',
      NATIVE: '#66b3ff',
      ASIAN: '#ff9999',
      NHPI: '#66cc99',
      OTHER_race: '#609966'
    };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', bg_color)
      .style('border', '1px solid #ccc')
      .style('padding', '10px');

    svg.selectAll('*').remove(); // Clear previous render

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Race Breakdown');

    // Create scales
    const x = d3.scaleBand()
      .domain(Object.keys(raceData))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(Object.values(raceData))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat((d) => raceLabels[d]))
      .attr('font-size', '14px')
      .style('font-family', 'Montserrat')
      .style('color', '#333');

    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .attr('font-size', '14px')
      .style('font-family', 'Montserrat')
      .style('color', '#333');

    // Add labels to the axes
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Race');

    svg.append('text')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Percentage');

    // Add bars
    svg.selectAll('.bar')
      .data(Object.entries(raceData))
      .join('rect')
      .attr('class', 'bar')
      .attr('x', ([key]) => x(key))
      .attr('y', ([, value]) => y(value))
      .attr('width', x.bandwidth())
      .attr('height', ([, value]) => y(0) - y(value))
      .attr('fill', ([key]) => raceColors[key])
      .attr('opacity', 0.8);

    // Add labels on top of bars
    svg.selectAll('.label')
      .data(Object.entries(raceData))
      .join('text')
      .attr('class', 'label')
      .attr('x', ([key]) => x(key) + x.bandwidth() / 2)
      .attr('y', ([, value]) => y(value) - 5)
      .attr('text-anchor', 'middle')
      .text(([, value]) => `${(value * 100).toFixed(1)}%`)
      .attr('font-size', '12px')
      .style('font-family', 'Montserrat')
      .attr('fill', 'black');

  }, [data, threshold]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export const IncomeBreakdown = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 780;
    const height = 275;
    const margin = { top: 40, right: 0, bottom: 45, left: 70 };

    const groupedData = {
      "< $10k": data["Less than $10,000"],
      "$10k - $29k": data["$10,000 to $14,999"] + data["$15,000 to $19,999"] + data["$20,000 to $24,999"] + data["$25,000 to $29,999"],
      "$30k - $49k": data["$30,000 to $34,999"] + data["$35,000 to $39,999"] + data["$40,000 to $44,999"] + data["$45,000 to $49,999"],
      "$50k - $99k": data["$50,000 to $59,999"] + data["$60,000 to $74,999"] + data["$75,000 to $99,999"],
      "$100k - $149k": data["$100,000 to $124,999"] + data["$125,000 to $149,999"],
      "$150k - $199k": data["$150,000 to $199,999"],
      "> $200k": data["$200,000 or more"]
    };

    const incomeLabels = {
        "< $10k": "< $10k",
        "$10k - $29k": "$10k - $29k",
        "$30k - $49k": "$30k - $49k",
        "$50k - $99k": "$50k - $99k",
        "$100k - $149k": "$100k - $149k",
        "$150k - $199k": "$150k - $199k",
        "> $200k": "> $200k"
    };

    const incomeColors = {
        "< $10k": '#d4f8cb',
        "$10k - $29k": '#c7e9c0',
        "$30k - $49k": '#a1d99b',
        "$50k - $99k": '#74c476',
        "$100k - $149k": '#31a354',
        "$150k - $199k": '#006d2c',
        "> $200k": '#00441b'
    };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', bg_color)
      .style('border', '1px solid #ccc')
      .style('padding', '10px');

    svg.selectAll('*').remove(); // Clear previous render

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Income Breakdown');

    // Create scales
    const x = d3.scaleBand()
      .domain(Object.keys(groupedData))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(Object.values(groupedData))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat((d) => incomeLabels[d]))
      .attr('font-size', '14px')
      .style('color', '#333')
      .selectAll("text")
      .style("text-anchor", "middle")
      .style('font-family', 'Montserrat');

    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .attr('font-size', '14px')
      .style('font-family', 'Montserrat')
      .style('color', '#333');

    // Add labels to the axes
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Income Range');

    svg.append('text')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Population Percentage');

    // Add bars
    svg.selectAll('.bar')
      .data(Object.entries(groupedData))
      .join('rect')
      .attr('class', 'bar')
      .attr('x', ([key]) => x(key))
      .attr('y', ([, value]) => y(value))
      .attr('width', x.bandwidth())
      .attr('height', ([, value]) => y(0) - y(value))
      .attr('fill', ([key]) => incomeColors[key])
      .attr('opacity', 0.7);

    // Add labels on top of bars
    svg.selectAll('.label')
      .data(Object.entries(groupedData))
      .join('text')
      .attr('class', 'label')
      .attr('x', ([key]) => x(key) + x.bandwidth() / 2)
      .attr('y', ([, value]) => y(value) - 5)
      .attr('text-anchor', 'middle')
      .text(([, value]) => `${(value * 100).toFixed(1)}%`)
      .attr('font-size', '12px')
      .style('font-family', 'Montserrat')
      .attr('fill', 'black');

  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export const BoxWhiskerMCMC = () => {
  const svgRef = useRef();

  const { selectedState, MCMCParam, boxPlotSampleData, MCMCEnactedPlan } = useAppState();

  useEffect(() => {
    const data = boxPlotSampleData[MCMCParam];

    const margin = { top: 40, right: 50, bottom: 60, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 470 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', bg_color)
      .style('border', '1px solid #ccc');

    svg.selectAll('*').remove(); // Clear previous render

    // Add title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top / 2 + 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Comparison of Current District Plan with MCMC Ensemble');

    // Find the min and max for dynamic scaling
    const yMin = d3.min(data, d => d.min);
    const yMax = d3.max(data, d => d.max);

    // Define the scales
    const x = d3.scaleBand()
      .domain(data.map((d, i) => i + 1))
      .range([0, width])
      .paddingInner(0.3)
      .paddingOuter(0.3);

    const y = d3.scaleLinear()
      .domain([yMin * 0.9, yMax * 1.1])
        .nice()
      .range([height, 0]);

    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    chartGroup.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat');

    // Add Y axis with ticks displayed as percentages
    chartGroup.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2p"))) // Display as percentages
      .selectAll("text")
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .attr('dx', '-1.5em')
      .style('font-family', 'Montserrat');

    // Add labels to the axes
    chartGroup.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text("District Index");

    chartGroup.append('text')
      .attr('x', -height / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .attr('dy', '-0.5em') // Adjust label to prevent overlap
      .style('font-family', 'Montserrat')
      .text('Group Population Percent');

    // Draw the boxes
    chartGroup.selectAll(".box")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "box")
      .attr("x", (d, i) => x(i + 1) + x.bandwidth() / 4)
      .attr("width", x.bandwidth() / 2)
      .attr("y", d => y(d.q3))
      .attr("height", d => y(d.q1) - y(d.q3))
      .attr("stroke", "black")
      .attr("fill", "#609966"); // Consistent color from your color scheme

    // Draw the median lines
    chartGroup.selectAll(".median")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "median")
      .attr("x1", (d, i) => x(i + 1) + x.bandwidth() / 4)
      .attr("x2", (d, i) => x(i + 1) + 3 * x.bandwidth() / 4)
      .attr("y1", d => y(d.med))
      .attr("y2", d => y(d.med))
      .attr("stroke", "black");

    const cdp_array = MCMCEnactedPlan[selectedState][MCMCParam];
    const cdp_data = Array.from(cdp_array.entries().map(i => [80 + i[0]*122.5, i[1]]));


    chartGroup.selectAll('.points')
      .data(cdp_data)
      .enter()
      .append('circle')
      .attr('class', 'points')
      .attr('cx', d => d[0])
      .attr('cy', d => y(d[1]))
      .attr('r', 4) // Adjust the size as needed
      .attr('fill', 'black')

    // Draw the whiskers
    chartGroup.selectAll(".whisker")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "whisker")
      .attr("x1", (d, i) => x(i + 1) + x.bandwidth() / 2)
      .attr("x2", (d, i) => x(i + 1) + x.bandwidth() / 2)
      .attr("y1", d => y(d.min))
      .attr("y2", d => y(d.max))
      .attr("stroke", "black");

    // Draw min and max lines
    chartGroup.selectAll(".min")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "min")
      .attr("x1", (d, i) => x(i + 1) + x.bandwidth() / 4)
      .attr("x2", (d, i) => x(i + 1) + 3 * x.bandwidth() / 4)
      .attr("y1", d => y(d.min))
      .attr("y2", d => y(d.min))
      .attr("stroke", "black");

    chartGroup.selectAll(".max")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "max")
      .attr("x1", (d, i) => x(i + 1) + x.bandwidth() / 4)
      .attr("x2", (d, i) => x(i + 1) + 3 * x.bandwidth() / 4)
      .attr("y1", d => y(d.max))
      .attr("y2", d => y(d.max))
      .attr("stroke", "black");

  }, [boxPlotSampleData, MCMCParam]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export const EcologicalInferenceChart = ({ data, title, xAxisLabel }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 70, bottom: 120, left: 70 };

    const groups = Object.keys(data);
    const candidates = ["Trump", "Biden"];
    const candidateColors = { "Trump": "#ff6b6b", "Biden": "#4d79ff"}

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', bg_color)
      .style('border', '1px solid #ccc')
      .style('padding', '10px');

    svg.selectAll('*').remove(); // Clear previous render

    // Create scales
    const x0 = d3.scaleBand()
      .domain(groups)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(candidates)
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text(title);

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .attr('font-size', '14px')
      .style('color', '#333')
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .attr('font-size', '14px')
      .style('font-family', 'Montserrat')
      .style('color', '#333');

    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text(xAxisLabel);

    svg.append('text')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .style('font-family', 'Montserrat')
      .text('Support Percentage');

    // Add bars with error bars
    groups.forEach(group => {
      candidates.forEach(candidate => {
        const candidateData = data[group][candidate];

        // Draw bars
        svg.append('rect')
          .attr('x', x0(group) + x1(candidate))
          .attr('y', y(candidateData.mean))
          .attr('width', x1.bandwidth())
          .attr('height', y(0) - y(candidateData.mean))
          .attr('fill', candidateColors[candidate])
          .attr('opacity', 0.8);

        // Draw error bars
        svg.append('line') // Vertical line for confidence interval
          .attr('x1', x0(group) + x1(candidate) + x1.bandwidth() / 2)
          .attr('x2', x0(group) + x1(candidate) + x1.bandwidth() / 2)
          .attr('y1', y(candidateData.ci_lower))
          .attr('y2', y(candidateData.ci_upper))
          .attr('stroke', 'black')
          .attr('stroke-width', '2px');

        svg.append('line') // Top cap of the error bar
          .attr('x1', x0(group) + x1(candidate) + x1.bandwidth() / 4)
          .attr('x2', x0(group) + x1(candidate) + 3 * x1.bandwidth() / 4)
          .attr('y1', y(candidateData.ci_upper))
          .attr('y2', y(candidateData.ci_upper))
          .attr('stroke', 'black')
          .attr('stroke-width', '2px');

        svg.append('line') // Bottom cap of the error bar
          .attr('x1', x0(group) + x1(candidate) + x1.bandwidth() / 4)
          .attr('x2', x0(group) + x1(candidate) + 3 * x1.bandwidth() / 4)
          .attr('y1', y(candidateData.ci_lower))
          .attr('y2', y(candidateData.ci_lower))
          .attr('stroke', 'black')
          .attr('stroke-width', '2px');
      });
    });

    // Add legend (key)
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 10}, ${margin.top})`);

    candidates.forEach((candidate, i) => {
      // Add colored rectangles
      legend.append('rect')
        .attr('x', 0)
        .attr('y', i * 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', candidateColors[candidate]);

      // Add text
      legend.append('text')
        .attr('x', 25)
        .attr('y', i * 20 + 12)
        .attr('font-size', '14px')
        .attr('fill', '#333')
        .style('font-family', 'Montserrat')
        .text(candidate);
    });

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export const ScatterPlot = ({combine, g1, g2}) => {
  const svgRef = useRef();

  const { selectedState, scatterParam, serverPath } = useAppState();
  const [data, setData] = useState(false);

  const labels = {
      WHITE: 'White',
      BLACK: 'Black',
      NATIVE: 'Native',
      ASIAN: 'Asian',
      NHPI: 'NHPI',
      OTHER_race: 'Other',
      '< $30k': 'population with < $30k household income',
      '$30k - $59k': 'population with $30k - $59k household income',
      '$60k - $99k': 'population with $60k - $99k household income',
      '$100k - $149k': 'population with $100k - $149k household income',
      '> $150k': '> $150k',
      dt_x: 'Region Type'
    };

  const fetchData = async () => {
    try {
      const filepath = `${serverPath}/data/${selectedState}-scatter.json`;
      const dataResponse = await fetch(filepath);
      if (!dataResponse.ok) {
        throw new Error('Failed to load Graph Region data');
      }
      const rData = await dataResponse.json();
      if (combine) {
        // Avg points and best fit lines
        const cData = {
          TRUMP: {
            points: rData[g1].TRUMP.points.map((p1, i) => [(p1[0] + rData[g2].TRUMP.points[i][0]) / 2, p1[1]]),
            coeffs_poly: rData[g1].TRUMP.coeffs_poly.map((c, i) => (c + rData[g2].TRUMP.coeffs_poly[i]) / 2),
          },
          BIDEN: {
            points: rData[g1].BIDEN.points.map((p1, i) => [(p1[0] + rData[g2].BIDEN.points[i][0]) / 2, p1[1]]),
            coeffs_poly: rData[g1].BIDEN.coeffs_poly.map((c, i) => (c + rData[g2].BIDEN.coeffs_poly[i]) / 2),
          }
        };
        setData(cData);
      } else {
        setData(rData[scatterParam]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [scatterParam, g1, g2]);

  useEffect(() => {
    if (!data) return;

    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    const width = 650;
    const height = 300;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', bg_color)
      .style('border', '1px solid #ccc');

    // Clear the previous graph
    svg.selectAll('*').remove();

    // Append main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#40513B')
      .style('font-family', 'Montserrat')
      .text('Vote Share within each Precinct');

    // Extract data
    const trumpData = data.TRUMP.points || [];
    const bidenData = data.BIDEN.points || [];
    const allPoints = [...trumpData, ...bidenData];

    // Define scales
    const xAxDomain = scatterParam === "dt_x" ? 1 : d3.max(allPoints, d => d[0]) * 1.1;
    const x = d3.scaleLinear()
      .domain([0, xAxDomain])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, Math.min(d3.max(allPoints, d => d[1]) * 1.1, 1)])
      .range([height, 0]);

    // Add axes
    if (scatterParam === "dt_x" && !combine) {
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .tickValues([0.25, 0.5, 0.75])
                .tickFormat((d) => {
                    if (d === 0.25) return 'Rural';
                    if (d === 0.5) return 'Suburban';
                    if (d === 0.75) return 'Urban';
                    return '';
                }))
            .selectAll('text')
            .style('font-family', 'Montserrat')
            .attr('font-size', '12px');
    } else {
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format('.0%'))) // Normal percentage format
            .selectAll('text')
            .style('font-family', 'Montserrat')
            .attr('font-size', '12px');
    }


    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format('.0%')))
      .selectAll('text')
      .style('font-family', 'Montserrat')
      .attr('font-size', '12px');

    // Add labels
    const xAxisLabel = combine ? 'Percent ' + `${labels[g1]} / ${g2}` : ( scatterParam === 'dt_x' ? 'Region Type' : 'Percent ' + labels[scatterParam]);
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Montserrat')
      .attr('font-size', '14px')
      .text(xAxisLabel);

    g.append('text')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .style('font-family', 'Montserrat')
      .attr('font-size', '14px')
      .text('Percent of Votes');

    // Add scatter points
    g.selectAll('.trump-point')
      .data(trumpData)
      .enter()
      .append('circle')
      .attr('class', 'trump-point')
      .attr('cx', d => x(d[0]))
      .attr('cy', d => y(d[1]))
      .attr('r', 2)
      .attr('fill', 'red')
      .attr('opacity', 0.5);

    g.selectAll('.biden-point')
      .data(bidenData)
      .enter()
      .append('circle')
      .attr('class', 'biden-point')
      .attr('cx', d => x(d[0]))
      .attr('cy', d => y(d[1]))
      .attr('r', 2)
      .attr('fill', 'blue')
      .attr('opacity', 0.5);

    // Polynomial lines
    const polynomial = (coef, x) => coef[0] * x ** 2 + coef[1] * x + coef[2];
    const filterValidPoints = data => data.filter(d => d.y >= 0 && d.y <= 1);
    const trumpLineData = filterValidPoints(d3.range(0, d3.max(allPoints, d => d[0]), 0.01).map(x => ({ x, y: polynomial(data.TRUMP.coeffs_poly, x) })));
    const bidenLineData = filterValidPoints(d3.range(0, d3.max(allPoints, d => d[0]), 0.01).map(x => ({ x, y: polynomial(data.BIDEN.coeffs_poly, x) })));

    g.append('path')
      .datum(trumpLineData)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
      );

    g.append('path')
      .datum(bidenLineData)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
      );

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 20}, 10)`);

    const legendData = [
      { color: 'red', label: 'Trump' },
      { color: 'blue', label: 'Biden' }
    ];

    legendData.forEach((d, i) => {
      legend.append('rect')
        .attr('x', 0)
        .attr('y', i * 20)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', d.color);

      legend.append('text')
        .attr('x', 15)
        .attr('y', i * 20 + 10)
        .attr('font-size', '12px')
        .style('font-family', 'Montserrat')
        .text(d.label);
    });
  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export function EnsembleLegend() {

  const legendContext = "Displayed Plans";
  const legendData = [
      { range: 'Enacted', color: '#000000' },
      { range: 'ReCom', color: '#609966' }
  ];

  return (
      <div className="ensemble-legend">
          <h1 className='ensemble-legend-heading'>Legend</h1>
          <p className='ensemble-legend-subheading'>{legendContext}</p>
          <ul className='ensemble-list'>
              {legendData.map((item, index) => (
                  <li key={index} className='ensemble-legend-item'>
                      <span
                          style={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: item.color,
                              display: 'inline-block',
                              marginRight: '8px',
                              border: '1px solid #000',
                              borderRadius: '50%'
                          }}
                      ></span>
                      <span>{item.range}</span>
                  </li>
              ))}
          </ul>
      </div>
  );
}