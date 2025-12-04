export const renderAxisLabels = (
  vizGroup,
  innerWidth,
  innerHeight,
  yMarginOffset,
  xLabelText = 'BGG Rating',
  yLabelText = 'Complexity Average',
) => {
  // Add X axis label
  vizGroup
    .selectAll('.x-axis-label')
    .data([null])
    .join('text')
    .attr('class', 'x-axis-label')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + yMarginOffset)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-family', 'sans-serif')
    .text(xLabelText);

  // Add Y axis label with improved rendering
  vizGroup
    .selectAll('.y-axis-label')
    .data([null])
    .join('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerHeight / 2)
    .attr('y', -yMarginOffset)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-family', 'sans-serif')
    .text(yLabelText);
};
