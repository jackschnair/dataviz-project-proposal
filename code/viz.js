import { extent, interpolateRgb, scaleLinear, scaleOrdinal, scaleSequential, select } from 'd3';
import { renderAxes } from './axis.js';
import { renderAxisLabels } from './axisLabels.js';

export const viz = (
  selection,
  {
    data,
    xValue,
    yValue,
    r,
    fill,
    width,
    height,
    margin,
    xOffset = 0,
    yOffset = 0,
    yMarginOffset = 40, // Use this value instead of hardcoded -40 and 40
    highlightDomain = null,
    highlightMechanic = null,
    colorBy = 'domain', // 'domain', 'year', 'players', 'playtime', 'rating'
    colorScheme = 'category10', // 'category10', 'viridis', 'plasma', 'custom'
    xLabel = 'BGG Rating',
    yLabel = 'Complexity Average',
    xTickFormat = null,
    yTickFormat = null,
    xDomain = null,
    yDomain = null,
    showLegend = false, // Set to false to disable legend rendering
    title = null, // Chart title
  },
) => {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Handle empty data by providing default domains
  const finalXDomain = xDomain || (data.length > 0 ? extent(data, xValue) : [0, 10]);
  const finalYDomain = yDomain || (data.length > 0 ? extent(data, yValue) : [0, 5]);

  const xScale = scaleLinear()
    .domain(finalXDomain)
    .range([0, innerWidth]);

  const yScale = scaleLinear()
    .domain(finalYDomain)
    .range([innerHeight, 0]);

  // Color scale setup
  let colorScale;
  const getColorValue = (d) => {
    switch (colorBy) {
      case 'domain':
        return d.domains && d.domains.length > 0 ? d.domains[0] : 'Other';
      case 'domain_primary':
        // Use the most common domain in the dataset as primary
        const domainCounts = {};
        data.forEach(game => {
          if (game.domains) {
            game.domains.forEach(domain => {
              domainCounts[domain] = (domainCounts[domain] || 0) + 1;
            });
          }
        });
        const primaryDomain = Object.keys(domainCounts).reduce((a, b) => 
          domainCounts[a] > domainCounts[b] ? a : b, 'Other');
        return d.domains && d.domains.includes(primaryDomain) ? primaryDomain : 'Other';
      case 'domain_count':
        return d.domains ? d.domains.length : 0;
      case 'mechanics_count':
        return d.mechanics ? d.mechanics.length : 0;
      case 'year':
        return +d['Year Published'];
      case 'players':
        return +d['Min Players'];
      case 'playtime':
        return +d['Play Time'];
      case 'rating':
        return +d['Rating Average'].replace(',', '.');
      default:
        return 'Other';
    }
  };

  if (['domain', 'domain_primary'].includes(colorBy)) {
    // Categorical color scale for domains
    const domains = [...new Set(data.map(d => getColorValue(d)))]
      .filter(d => d !== undefined);
    const colorPalettes = {
      regular: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
      colorblind: ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#999999', '#000000', '#FFFFFF']
    };
    
    const colors = colorPalettes[colorScheme] || colorPalettes.regular;
    colorScale = scaleOrdinal()
      .domain(domains)
      .range(colors);
  } else {
    // Sequential color scale for numeric values
    const colorValues = data.map(d => getColorValue(d)).filter(v => v !== undefined);
    const colorDomain = extent(colorValues);
    
    if (colorScheme === 'regular') {
      // Standard viridis-like gradient
      const standardInterpolator = (t) => {
        const colors = ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'];
        const n = colors.length - 1;
        const i = Math.floor(t * n);
        const f = t * n - i;
        if (i >= n) return colors[n];
        if (i < 0) return colors[0];
        return interpolateRgb(colors[i], colors[i + 1])(f);
      };
      colorScale = scaleSequential(standardInterpolator)
        .domain(colorDomain);
    } else if (colorScheme === 'colorblind') {
      // Blue to red gradient (color-blind friendly, no white)
      const blueToRedInterpolator = (t) => {
        const colors = ['#2166AC', '#4393C3', '#92C5DE', '#D1E5F0', '#FDDBC7', '#F4A582', '#D6604D', '#B2182B', '#8B0000'];
        const n = colors.length - 1;
        const i = Math.floor(t * n);
        const f = t * n - i;
        if (i >= n) return colors[n];
        if (i < 0) return colors[0];
        return interpolateRgb(colors[i], colors[i + 1])(f);
      };
      colorScale = scaleSequential(blueToRedInterpolator)
        .domain(colorDomain);
    } else {
      // Standard viridis-like gradient
      const standardInterpolator = (t) => {
        const colors = ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'];
        const n = colors.length - 1;
        const i = Math.floor(t * n);
        const f = t * n - i;
        if (i >= n) return colors[n];
        if (i < 0) return colors[0];
        return interpolateRgb(colors[i], colors[i + 1])(f);
      };
      colorScale = scaleSequential(standardInterpolator)
        .domain(colorDomain);
    }
  }

  // Create a group for the entire visualization with margins applied
  const vizGroup = selection
    .selectAll('.viz-group')
    .data([null])
    .join('g')
    .attr('class', 'viz-group')
    .attr(
      'transform',
      `translate(${margin.left + xOffset}, ${margin.top + yOffset})`,
    );

  renderAxes(
    vizGroup,
    xScale,
    yScale,
    innerWidth,
    innerHeight,
    xTickFormat,
    yTickFormat,
  );
  renderAxisLabels(
    vizGroup,
    innerWidth,
    innerHeight,
    yMarginOffset,
    xLabel,
    yLabel,
  );

  // Add title if provided
  if (title) {
    vizGroup
      .selectAll('.chart-title')
      .data([null])
      .join('text')
      .attr('class', 'chart-title')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(title);
  }

  // Add color legend (only if showLegend is true)
  if (showLegend && ['domain', 'domain_primary'].includes(colorBy)) {
    const legendHeight = colorScale.domain().length * 20 + 20;
    const legendWidth = 190;
    const legendX = (innerWidth - legendWidth) / 2; // Center horizontally
    const legendY = innerHeight + yMarginOffset + 20; // Below x-axis label with some padding
    
    const legend = vizGroup
      .selectAll('.color-legend')
      .data([null])
      .join('g')
      .attr('class', 'color-legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Add background rectangle for better visibility
    const legendItems = legend
      .selectAll('.legend-item')
      .data(colorScale.domain())
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    // Add background to legend
    legend
      .insert('rect', ':first-child')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('rx', 5);

    legendItems
      .append('circle')
      .attr('r', 6)
      .attr('fill', d => colorScale(d));

    legendItems
      .append('text')
      .attr('x', 15)
      .attr('y', 4)
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text(d => d);
  } else if (showLegend && ['domain_count', 'mechanics_count'].includes(colorBy)) {
    // Add gradient legend for count-based coloring
    const legendWidth = 190;
    const legendHeight = 80;
    const legendX = (innerWidth - legendWidth) ;
    const legendY = innerHeight + yMarginOffset + 20; // Below x-axis label with some padding
    
    const legend = vizGroup
      .selectAll('.color-legend')
      .data([null])
      .join('g')
      .attr('class', 'color-legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Add background to gradient legend
    legend
      .append('rect')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('rx', 5);

    const gradient = legend
      .append('defs')
      .append('linearGradient')
      .attr('id', 'color-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    const colorDomain = extent(data.map(d => getColorValue(d)));
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const value = colorDomain[0] + (colorDomain[1] - colorDomain[0]) * (i / steps);
      gradient
        .append('stop')
        .attr('offset', `${(i / steps) * 100}%`)
        .attr('stop-color', colorScale(value));
    }

    legend
      .append('rect')
      .attr('width', 120)
      .attr('height', 15)
      .attr('fill', 'url(#color-gradient)');

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 30)
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text(`${colorBy === 'domain_count' ? 'Domains' : 'Mechanics'} Count`);

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 45)
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(`${colorDomain[0]} - ${colorDomain[1]}`);
  }

  // Create tooltip element in the document body to allow it to extend beyond chart boundaries
  const tooltip = select('body')
    .selectAll('.tooltip')
    .data([null])
    .join('div')
    .attr('class', 'tooltip')
    .style('position', 'fixed')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000)
    .style('max-width', '300px')
    .style('word-wrap', 'break-word');

  // Render normal circles first (background layer)
  const normalData = data.filter(d => {
    const shouldHighlight = 
      (highlightDomain && d.domains && d.domains.includes(highlightDomain)) ||
      (highlightMechanic && d.mechanics && d.mechanics.includes(highlightMechanic));
    return !shouldHighlight;
  });

  vizGroup
    .selectAll('circle.normal')
    .data(normalData, (d) => d.ID)
    .join(
      (enter) => enter.append('circle')
        .attr('class', 'normal')
        .attr('cx', (d) => xScale(xValue(d)))
        .attr('cy', (d) => yScale(yValue(d)))
        .attr('r', 0)
        .attr('fill', (highlightDomain || highlightMechanic) ? '#C7C7C7' : (d) => colorScale(getColorValue(d)))
        .transition()
        .duration(300)
        .attr('r', r),
      (update) => update
        .transition()
        .duration(300)
        .attr('cx', (d) => xScale(xValue(d)))
        .attr('cy', (d) => yScale(yValue(d)))
        .attr('fill', (highlightDomain || highlightMechanic) ? '#C7C7C7' : (d) => colorScale(getColorValue(d))),
      (exit) => exit
        .transition()
        .duration(200)
        .attr('r', 0)
        .remove(),
    )
    .style('cursor', 'pointer') // Add pointer cursor to indicate interactivity
    .on('mouseover', function(event, d) {
      if (tooltip) {
        const xVal = xValue(d);
        const yVal = yValue(d);
        tooltip
          .style('opacity', 1)
          .html(`${d.Name}<br>${xLabel}: ${xVal}<br>${yLabel}: ${yVal}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      }
      // Highlight point on hover
      select(this)
        .attr('r', r * 1.5)
        .style('stroke', '#333')
        .style('stroke-width', 2);
    })
    .on('mousemove', function(event) {
      if (tooltip) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      }
    })
    .on('mouseout', function() {
      if (tooltip) {
        tooltip.style('opacity', 0);
      }
      // Reset point size
      select(this)
        .attr('r', r)
        .style('stroke', 'none')
        .style('stroke-width', 0);
    });

  // Render highlighted circles on top (foreground layer)
  const highlightedData = data.filter(d => {
    const shouldHighlight = 
      (highlightDomain && d.domains && d.domains.includes(highlightDomain)) ||
      (highlightMechanic && d.mechanics && d.mechanics.includes(highlightMechanic));
    return shouldHighlight;
  });

  vizGroup
    .selectAll('circle.highlighted')
    .data(highlightedData, (d) => d.ID)
    .join(
      (enter) => enter.append('circle')
        .attr('class', 'highlighted')
        .attr('cx', (d) => xScale(xValue(d)))
        .attr('cy', (d) => yScale(yValue(d)))
        .attr('r', 0)
        .attr('fill', (d) => colorScale(getColorValue(d)))
        .transition()
        .duration(300)
        .attr('r', r),
      (update) => update
        .transition()
        .duration(300)
        .attr('cx', (d) => xScale(xValue(d)))
        .attr('cy', (d) => yScale(yValue(d)))
        .attr('fill', (d) => colorScale(getColorValue(d))),
      (exit) => exit
        .transition()
        .duration(200)
        .attr('r', 0)
        .remove(),
    )
    .style('cursor', 'pointer') // Add pointer cursor to indicate interactivity
    .on('mouseover', function(event, d) {
      if (tooltip) {
        const xVal = xValue(d);
        const yVal = yValue(d);
        tooltip
          .style('opacity', 1)
          .html(`${d.Name}<br>${xLabel}: ${xVal}<br>${yLabel}: ${yVal}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      }
      // Highlight point on hover
      select(this)
        .attr('r', r * 1.5)
        .style('stroke', '#333')
        .style('stroke-width', 2);
    })
    .on('mousemove', function(event) {
      if (tooltip) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      }
    })
    .on('mouseout', function() {
      if (tooltip) {
        tooltip.style('opacity', 0);
      }
      // Reset point size
      select(this)
        .attr('r', r)
        .style('stroke', 'none')
        .style('stroke-width', 0);
    });

  // Ensure the legend is above the scatter points
  vizGroup.selectAll('.color-legend').raise();
};

export const sparkline = (
  selection,
  {
    data,
    xValue,
    yValue,
    width,
    height,
    margin,
    xOffset = 0,
    yOffset = 0,
    yMarginOffset = 40,
    xLabel = 'Year Published',
    yLabel = 'Count',
    xTickFormat = null,
    yTickFormat = null,
    xDomain = null,
    yDomain = null,
    title = null, // Chart title
  },
) => {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Aggregate data by x-axis value (typically year) - count entries per year
  const aggregatedData = {};
  data.forEach(d => {
    const x = xValue(d);
    if (x !== null && x !== undefined) {
      if (!aggregatedData[x]) {
        aggregatedData[x] = {
          x: x,
          count: 0
        };
      }
      aggregatedData[x].count += 1;
    }
  });

  // Create line data with count for each x-value
  const lineData = Object.values(aggregatedData)
    .map(d => ({
      x: d.x,
      y: d.count
    }))
    .sort((a, b) => a.x - b.x);

  // Handle empty data by providing default domains
  const finalXDomain = xDomain || (lineData.length > 0 
    ? [Math.min(...lineData.map(d => d.x)), Math.max(...lineData.map(d => d.x))]
    : [0, 10]);
  const finalYDomain = yDomain || (lineData.length > 0
    ? [0, Math.max(...lineData.map(d => d.y))]
    : [0, 5]);

  const xScale = scaleLinear()
    .domain(finalXDomain)
    .range([0, innerWidth]);

  const yScale = scaleLinear()
    .domain(finalYDomain)
    .range([innerHeight, 0]);

  // Create a group for the entire visualization with margins applied
  const vizGroup = selection
    .selectAll('.viz-group')
    .data([null])
    .join('g')
    .attr('class', 'viz-group')
    .attr(
      'transform',
      `translate(${margin.left + xOffset}, ${margin.top + yOffset})`,
    );

  renderAxes(
    vizGroup,
    xScale,
    yScale,
    innerWidth,
    innerHeight,
    xTickFormat,
    yTickFormat,
  );
  renderAxisLabels(
    vizGroup,
    innerWidth,
    innerHeight,
    yMarginOffset,
    xLabel,
    yLabel,
  );

  // Add title if provided
  if (title) {
    vizGroup
      .selectAll('.chart-title')
      .data([null])
      .join('text')
      .attr('class', 'chart-title')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(title);
  }

  // Create tooltip element in the document body to allow it to extend beyond chart boundaries
  const tooltip = select('body')
    .selectAll('.tooltip-sparkline')
    .data([null])
    .join('div')
    .attr('class', 'tooltip-sparkline')
    .style('position', 'fixed')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000)
    .style('max-width', '300px')
    .style('word-wrap', 'break-word');

  // Create line generator manually (no d3-shape dependency)
  const lineGenerator = (data) => {
    if (data.length === 0) return '';
    let path = `M ${xScale(data[0].x)} ${yScale(data[0].y)}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(data[i].x)} ${yScale(data[i].y)}`;
    }
    return path;
  };

  // Create area generator manually (fills under the line)
  const areaGenerator = (data) => {
    if (data.length === 0) return '';
    // Start at the first point
    let path = `M ${xScale(data[0].x)} ${yScale(data[0].y)}`;
    // Draw line to each subsequent point
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(data[i].x)} ${yScale(data[i].y)}`;
    }
    // Draw down to the x-axis (innerHeight is the bottom of the chart)
    path += ` L ${xScale(data[data.length - 1].x)} ${innerHeight}`;
    // Draw back to the starting point along the x-axis
    path += ` L ${xScale(data[0].x)} ${innerHeight}`;
    // Close the path
    path += ' Z';
    return path;
  };

  // Render the sparkline
  if (lineData.length > 0) {
    // Add filled area under the sparkline (render first so line appears on top)
    vizGroup
      .selectAll('.sparkline-area')
      .data([lineData])
      .join('path')
      .attr('class', 'sparkline-area')
      .attr('d', (d) => areaGenerator(d))
      .attr('fill', '#8BC3E8') // Lighter blue (#1f77b4 -> #8BC3E8)
      .attr('opacity', 0.5) // Add some transparency
      .attr('stroke', 'none');

    // Add the sparkline path on top
    vizGroup
      .selectAll('.sparkline-path')
      .data([lineData])
      .join('path')
      .attr('class', 'sparkline-path')
      .attr('d', (d) => lineGenerator(d))
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2);

    // Add circles for data points with tooltips
    vizGroup
      .selectAll('.sparkline-point')
      .data(lineData)
      .join('circle')
      .attr('class', 'sparkline-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 4)
      .attr('fill', '#1f77b4')
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        if (tooltip) {
          tooltip
            .style('opacity', 1)
            .html(`Year: ${d.x}<br>Count: ${d.y}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }
      })
      .on('mousemove', function(event) {
        if (tooltip) {
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }
      })
      .on('mouseout', function() {
        if (tooltip) {
          tooltip.style('opacity', 0);
        }
      });
  }
};

export const barChart = (
  selection,
  {
    data,
    xValue,
    yValue,
    width,
    height,
    margin,
    xOffset = 0,
    yOffset = 0,
    yMarginOffset = 40,
    xLabel = 'Year Published',
    yLabel = 'Count',
    xTickFormat = null,
    yTickFormat = null,
    xDomain = null,
    yDomain = null,
    title = null, // Chart title
  },
) => {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Aggregate data by x-axis value (typically year) - count entries per year
  const aggregatedData = {};
  data.forEach(d => {
    const x = xValue(d);
    if (x !== null && x !== undefined) {
      if (!aggregatedData[x]) {
        aggregatedData[x] = {
          x: x,
          count: 0
        };
      }
      aggregatedData[x].count += 1;
    }
  });

  // Create bar data with count for each x-value
  const barData = Object.values(aggregatedData)
    .map(d => ({
      x: d.x,
      y: d.count
    }))
    .sort((a, b) => a.x - b.x);

  // Handle empty data by providing default domains
  // For x-axis, ensure domain starts appropriately to prevent bars from extending past y-axis
  let finalXDomain = xDomain || (barData.length > 0 
    ? [Math.min(...barData.map(d => d.x)), Math.max(...barData.map(d => d.x))]
    : [0, 10]);
  
  // If custom domain is provided (e.g., starting at 1994 for Year Published), use it
  // Otherwise, ensure domain starts at 0 to prevent bars from extending past y-axis
  if (!xDomain && finalXDomain[0] > 0) {
    // Start domain at 0 to ensure first bar doesn't extend past y-axis
    // (unless a custom domain was provided, which is handled above)
    finalXDomain = [0, finalXDomain[1]];
  } else if (!xDomain && finalXDomain[0] < 0) {
    // If domain starts below 0, keep it as is (negative values are valid)
    // But we'll clamp bar positions to not go below 0
  }
  
  const finalYDomain = yDomain || (barData.length > 0
    ? [0, Math.max(...barData.map(d => d.y))]
    : [0, 5]);

  const xScale = scaleLinear()
    .domain(finalXDomain)
    .range([0, innerWidth]);

  const yScale = scaleLinear()
    .domain(finalYDomain)
    .range([innerHeight, 0]);

  // Create a group for the entire visualization with margins applied
  const vizGroup = selection
    .selectAll('.viz-group')
    .data([null])
    .join('g')
    .attr('class', 'viz-group')
    .attr(
      'transform',
      `translate(${margin.left + xOffset}, ${margin.top + yOffset})`,
    );

  renderAxes(
    vizGroup,
    xScale,
    yScale,
    innerWidth,
    innerHeight,
    xTickFormat,
    yTickFormat,
  );
  renderAxisLabels(
    vizGroup,
    innerWidth,
    innerHeight,
    yMarginOffset,
    xLabel,
    yLabel,
  );

  // Add title if provided
  if (title) {
    vizGroup
      .selectAll('.chart-title')
      .data([null])
      .join('text')
      .attr('class', 'chart-title')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(title);
  }

  // Create tooltip element in the document body to allow it to extend beyond chart boundaries
  const tooltip = select('body')
    .selectAll('.tooltip-bar')
    .data([null])
    .join('div')
    .attr('class', 'tooltip-bar')
    .style('position', 'fixed')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000)
    .style('max-width', '300px')
    .style('word-wrap', 'break-word');

  // Calculate bar width based on minimum spacing between consecutive x values
  let barWidth = 10; // Default width
  if (barData.length > 0) {
    if (barData.length === 1) {
      // Single bar: use a reasonable width
      barWidth = Math.max(1, innerWidth * 0.1);
    } else {
      // Calculate minimum spacing between consecutive x values
      const spacings = [];
      for (let i = 1; i < barData.length; i++) {
        const spacing = xScale(barData[i].x) - xScale(barData[i - 1].x);
        if (spacing > 0) {
          spacings.push(spacing);
        }
      }
      
      if (spacings.length > 0) {
        const minSpacing = Math.min(...spacings);
        // Use 80% of minimum spacing to prevent overlap
        barWidth = Math.max(1, minSpacing * 0.8);
      } else {
        // Fallback: use equal spacing based on number of bars
        barWidth = Math.max(1, (innerWidth / barData.length) * 0.8);
      }
    }
  }

  // Render the bars
  if (barData.length > 0) {
    vizGroup
      .selectAll('.bar')
      .data(barData)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => Math.max(0, xScale(d.x) - barWidth / 2)) // Clamp to prevent extending past y-axis
      .attr('y', d => yScale(d.y))
      .attr('width', barWidth)
      .attr('height', d => innerHeight - yScale(d.y))
      .attr('fill', '#1f77b4')
      .attr('stroke', '#0d5a8a')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        if (tooltip) {
          tooltip
            .style('opacity', 1)
            .html(`${xLabel}: ${d.x}<br>${yLabel}: ${d.y}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }
        // Highlight bar on hover
        select(this)
          .attr('fill', '#3a9bd4')
          .attr('stroke-width', 2);
      })
      .on('mousemove', function(event) {
        if (tooltip) {
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }
      })
      .on('mouseout', function() {
        if (tooltip) {
          tooltip.style('opacity', 0);
        }
        // Reset bar appearance
        select(this)
          .attr('fill', '#1f77b4')
          .attr('stroke-width', 1);
      });
  }
};
