import { axisBottom, axisLeft } from 'd3';

export const renderAxes = (
  vizGroup,
  xScale,
  yScale,
  innerWidth,
  innerHeight,
  xTickFormat = null,
  yTickFormat = null,
) => {
  // Add X axis using idempotent rendering with .data([null]) pattern
  const xAxisGroup = vizGroup
    .selectAll('.x-axis')
    .data([null])
    .join('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`);

  const xAxis = axisBottom(xScale);
  if (xTickFormat) {
    xAxis.tickFormat(xTickFormat);
  }
  xAxisGroup.call(xAxis);

  // Style the X axis
  xAxisGroup
    .selectAll('path, line')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none');

  // Add Y axis using idempotent rendering with .data([null]) pattern
  const yAxisGroup = vizGroup
    .selectAll('.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis');

  const yAxis = axisLeft(yScale);
  if (yTickFormat) {
    yAxis.tickFormat(yTickFormat);
  }
  yAxisGroup.call(yAxis);

  // Style the Y axis
  yAxisGroup
    .selectAll('path, line')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none');
};
