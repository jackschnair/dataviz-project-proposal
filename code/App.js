import { dsv, extent, interpolateRgb, scaleOrdinal, scaleSequential, select } from 'd3';
import {
  createElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { barChart, sparkline, viz } from './viz.js';

const controlsWidth = 300;
const defaultWidth = 960;
const defaultHeight = 750;
const margin = { top: 50, right: 50, bottom: 60, left: 60 }; // Increased right margin to prevent cutoff

// Top 5 domains from the dataset
const DOMAINS = [
  'Strategy Games',
  'Thematic Games', 
  'Family Games',
  'Wargames',
  'Customizable Games'
];

// Top 10 mechanics from the dataset
const MECHANICS = [
  'Hand Management',
  'Variable Player Powers',
  'Dice Rolling',
  'Card Drafting',
  'Worker Placement',
  'Set Collection',
  'Solo / Solitaire Game',
  'Area Majority / Influence',
  'Modular Board',
  'Cooperative Game'
];

const App = () => {
  const svgRef = useRef();
  const legendSvgRef = useRef();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState(new Set(DOMAINS));
  const [selectedMechanics, setSelectedMechanics] = useState(new Set(MECHANICS));
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const [hoveredMechanic, setHoveredMechanic] = useState(null);
  const [colorBy, setColorBy] = useState('domain');
  const [colorScheme, setColorScheme] = useState('regular');
  const [chartType, setChartType] = useState('scatter'); // 'scatter' | 'sparkline' | 'bar'
  const [xAxisField, setXAxisField] = useState('rating'); // 'rating' | 'rank' | 'complexity' | 'users' | 'year' | 'min_players' | 'max_players' | 'play_time' | 'min_age'
  const [yAxisField, setYAxisField] = useState('complexity'); // 'rating' | 'rank' | 'complexity' | 'users' | 'year' | 'min_players' | 'max_players' | 'play_time' | 'min_age'
  const [dimensions, setDimensions] = useState({ width: defaultWidth, height: defaultHeight });
  const [isLoading, setIsLoading] = useState(true);

  // Calculate responsive dimensions based on window size
  useEffect(() => {
    const calculateDimensions = () => {
      const spacingBetween = 10; // Space between chart and controls panel
      const availableWidth = window.innerWidth - controlsWidth - spacingBetween;
      const availableHeight = window.innerHeight;
      
      // Maintain aspect ratio but ensure it fits in available space
      const aspectRatio = defaultWidth / defaultHeight;
      let width = availableWidth;
      let height = width / aspectRatio;
      
      // If height is too large, scale down based on height
      if (height > availableHeight) {
        height = availableHeight;
        width = height * aspectRatio;
      }
      
      // Ensure minimum dimensions
      const minWidth = 400;
      const minHeight = 300;
      if (width < minWidth) {
        width = minWidth;
        height = width / aspectRatio;
      }
      if (height < minHeight) {
        height = minHeight;
        width = height * aspectRatio;
      }
      
      setDimensions({ width: Math.floor(width), height: Math.floor(height) });
    };

    // Calculate initial dimensions
    calculateDimensions();

    // Recalculate on window resize
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    dsv(';', 'data.csv').then((loadedData) => {
      const formattedData = loadedData.map((d, i) => ({
        ...d,
        bgg_rating: +d['Rating Average'].replace(',', '.'),
        bgg_rank: +d['BGG Rank'],
        complexity_average: +d[
          'Complexity Average'
        ].replace(',', '.'),
        users_rated: +d['Users Rated'],
        year_published: +d['Year Published'],
        min_players: +d['Min Players'],
        max_players: +d['Max Players'],
        play_time: +d['Play Time'],
        min_age: +d['Min Age'],
        domains: d.Domains ? d.Domains.split(', ').map(d => d.trim()) : [],
        mechanics: d.Mechanics ? d.Mechanics.split(', ').map(m => m.trim()) : []
      }));
      const filteredByYear = formattedData.filter(d => d.year_published >= 1995);
      setData(filteredByYear);
      setIsLoading(false);
    });
  }, []);

  // Filter data based on selected domains and mechanics
  useEffect(() => {
    if (data.length > 0) {
      const filtered = data.filter(game => {
        // If both domains and mechanics are empty, don't show any games
        if (selectedDomains.size === 0 && selectedMechanics.size === 0) return false;
        
        // If all domains are selected, show all games (regardless of mechanics)
        if (selectedDomains.size === DOMAINS.length) return true;
        
        // If all mechanics are selected, show all games (regardless of domains)
        if (selectedMechanics.size === MECHANICS.length) return true;
        
        // Check domain filtering
        const hasSelectedDomain = selectedDomains.size === 0 || 
          game.domains.some(domain => selectedDomains.has(domain));
        
        // Check mechanics filtering
        const hasSelectedMechanic = selectedMechanics.size === 0 || 
          game.mechanics.some(mechanic => selectedMechanics.has(mechanic));
        
        // Game must match both domain and mechanics criteria
        return hasSelectedDomain && hasSelectedMechanic;
      });
      
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [data, selectedDomains, selectedMechanics]);

  useEffect(() => {
    if (data.length > 0) {
      const svg = select(svgRef.current);
      
      // Clear previous visualization
      svg.selectAll('*').remove();

      const xValue = (d) => {
        switch (xAxisField) {
          case 'rating':
            return d.bgg_rating;
          case 'rank':
            return d.bgg_rank;
          case 'users':
            return d.users_rated;
          case 'year':
            return d.year_published;
          case 'min_players':
            return d.min_players;
          case 'max_players':
            return d.max_players;
          case 'play_time':
            return d.play_time;
          case 'min_age':
            return d.min_age;
          case 'complexity':
          default:
            return d.complexity_average;
        }
      };
      const xLabel =
        xAxisField === 'rating' ? 'BGG Rating' :
        xAxisField === 'rank' ? 'BGG Rank' :
        xAxisField === 'users' ? 'Users Rated' :
        xAxisField === 'year' ? 'Year Published' :
        xAxisField === 'min_players' ? 'Min Players' :
        xAxisField === 'max_players' ? 'Max Players' :
        xAxisField === 'play_time' ? 'Play Time (minutes)' :
        xAxisField === 'min_age' ? 'Min Age' :
        'Complexity Average';

      const yValue = (d) => {
        switch (yAxisField) {
          case 'rating':
            return d.bgg_rating;
          case 'rank':
            return d.bgg_rank;
          case 'users':
            return d.users_rated;
          case 'year':
            return d.year_published;
          case 'min_players':
            return d.min_players;
          case 'max_players':
            return d.max_players;
          case 'play_time':
            return d.play_time;
          case 'min_age':
            return d.min_age;
          case 'complexity':
          default:
            return d.complexity_average;
        }
      };
      const yLabel =
        yAxisField === 'rating' ? 'BGG Rating' :
        yAxisField === 'rank' ? 'BGG Rank' :
        yAxisField === 'users' ? 'Users Rated' :
        yAxisField === 'year' ? 'Year Published' :
        yAxisField === 'min_players' ? 'Min Players' :
        yAxisField === 'max_players' ? 'Max Players' :
        yAxisField === 'play_time' ? 'Play Time (minutes)' :
        yAxisField === 'min_age' ? 'Min Age' :
        'Complexity Average';

      // Filter out games based on field-specific rules
      let displayData = filteredData;
      
      // Filter out games with max_players > 20 when max_players is selected on either axis
      if (xAxisField === 'max_players' || yAxisField === 'max_players') {
        displayData = displayData.filter(d => d.max_players <= 20);
      }
      
      // Filter out games with play_time > 300 when play_time is selected on either axis
      if (xAxisField === 'play_time' || yAxisField === 'play_time') {
        displayData = displayData.filter(d => d.play_time <= 300);
      }

      // Calculate custom xDomain for max_players, min_players, and min_age to start at 0
      let customXDomain = null;
      if (xAxisField === 'max_players' && displayData.length > 0) {
        const maxValue = Math.max(...displayData.map(d => xValue(d)));
        customXDomain = [0, maxValue];
      } else if (xAxisField === 'min_players' && displayData.length > 0) {
        const maxValue = Math.max(...displayData.map(d => xValue(d)));
        customXDomain = [0, maxValue];
      } else if (xAxisField === 'min_age' && displayData.length > 0) {
        const maxValue = Math.max(...displayData.map(d => xValue(d)));
        customXDomain = [0, maxValue];
      }

      // Calculate chart title based on chart type
      let chartTitle = null;
      if (chartType === 'scatter') {
        chartTitle = `${xLabel} vs ${yLabel} - Scatter Plot`;
      } else if (chartType === 'sparkline') {
        chartTitle = `${xLabel} - Sparkline`;
      } else if (chartType === 'bar') {
        chartTitle = `${xLabel} - Bar Chart`;
      }

      // Always render the visualization with axes, even if no data
      if (chartType === 'sparkline') {
        sparkline(svg, {
          data: displayData, // This will be empty array if no filters match
          width: dimensions.width,
          height: dimensions.height,
          margin,
          xValue,
          yValue,
          xLabel,
          yLabel: 'Count', // Always use Count for sparkline (number of entries per year)
          xDomain: customXDomain,
          title: chartTitle,
        });
      } else if (chartType === 'bar') {
        // For bar charts with Year Published, set domain to start at 1994
        let barXDomain = customXDomain;
        if (xAxisField === 'year' && !customXDomain && displayData.length > 0) {
          const maxYear = Math.max(...displayData.map(d => xValue(d)));
          barXDomain = [1994, maxYear];
        }
        barChart(svg, {
          data: displayData, // This will be empty array if no filters match
          width: dimensions.width,
          height: dimensions.height,
          margin,
          xValue,
          yValue,
          xLabel,
          yLabel: 'Count', // Always use Count for bar chart (number of entries per year)
          xDomain: barXDomain,
          title: chartTitle,
        });
      } else {
        viz(svg, {
          data: displayData, // This will be empty array if no filters match
          width: dimensions.width,
          height: dimensions.height,
          margin,
          xValue,
          yValue,
          r: 8,
          fill: 'black',
          highlightDomain: hoveredDomain,
          highlightMechanic: hoveredMechanic,
          colorBy: colorBy,
          colorScheme: colorScheme,
          xLabel,
          yLabel,
          xDomain: customXDomain,
          showLegend: false, // Legend is now in the controls panel
          title: chartTitle,
        });
      }
    }
  }, [filteredData, data, hoveredDomain, hoveredMechanic, colorBy, colorScheme, xAxisField, yAxisField, chartType, dimensions]);

  const handleDomainToggle = (domain) => {
    const newSelectedDomains = new Set(selectedDomains);
    if (newSelectedDomains.has(domain)) {
      newSelectedDomains.delete(domain);
    } else {
      newSelectedDomains.add(domain);
    }
    setSelectedDomains(newSelectedDomains);
  };

  const handleMechanicToggle = (mechanic) => {
    const newSelectedMechanics = new Set(selectedMechanics);
    if (newSelectedMechanics.has(mechanic)) {
      newSelectedMechanics.delete(mechanic);
    } else {
      newSelectedMechanics.add(mechanic);
    }
    setSelectedMechanics(newSelectedMechanics);
  };

  const handleAllDomainsToggle = () => {
    if (selectedDomains.size === DOMAINS.length) {
      // All are selected, so deselect all
      setSelectedDomains(new Set());
    } else {
      // Not all are selected, so select all
      setSelectedDomains(new Set(DOMAINS));
    }
  };

  const handleAllMechanicsToggle = () => {
    if (selectedMechanics.size === MECHANICS.length) {
      // All are selected, so deselect all
      setSelectedMechanics(new Set());
    } else {
      // Not all are selected, so select all
      setSelectedMechanics(new Set(MECHANICS));
    }
  };

  const handleDomainHover = (domain) => {
    setHoveredDomain(domain);
  };

  const handleDomainLeave = () => {
    setHoveredDomain(null);
  };

  const handleMechanicHover = (mechanic) => {
    setHoveredMechanic(mechanic);
  };

  const handleMechanicLeave = () => {
    setHoveredMechanic(null);
  };

  const handleChartTypeChange = (newChartType) => {
    setChartType(newChartType);
    if (newChartType === 'sparkline' || newChartType === 'bar') {
      setXAxisField('year');
      setYAxisField('users');
    } else if (newChartType === 'scatter') {
      // Reset to default axes for scatter plot
      setXAxisField('rating'); // BGG Rating
      setYAxisField('complexity'); // Complexity Average
    }
  };

  const handleReset = () => {
    setSelectedDomains(new Set(DOMAINS));
    setSelectedMechanics(new Set(MECHANICS));
    setColorBy('domain');
    setColorScheme('regular');
    setChartType('scatter');
    setXAxisField('rating');
    setYAxisField('complexity');
  };

  const handleExport = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Convert SVG to PNG using canvas
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svg.viewBox.baseVal.width || svg.width.baseVal.value;
      canvas.height = svg.viewBox.baseVal.height || svg.height.baseVal.value;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boardgame-chart-${chartType}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    };
    img.src = svgUrl;
  };

  // Helper function to build color scale (same logic as in viz.js)
  const buildColorScale = (data, colorBy, colorScheme) => {
    const getColorValue = (d) => {
      switch (colorBy) {
        case 'domain':
          return d.domains && d.domains.length > 0 ? d.domains[0] : 'Other';
        case 'domain_primary':
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
        default:
          return 'Other';
      }
    };

    if (['domain', 'domain_primary'].includes(colorBy)) {
      const domains = [...new Set(data.map(d => getColorValue(d)))]
        .filter(d => d !== undefined);
      const colorPalettes = {
        regular: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
        colorblind: ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#999999', '#000000', '#FFFFFF']
      };
      const colors = colorPalettes[colorScheme] || colorPalettes.regular;
      return {
        type: 'ordinal',
        scale: scaleOrdinal().domain(domains).range(colors),
        domain: domains
      };
    } else {
      const colorValues = data.map(d => getColorValue(d)).filter(v => v !== undefined);
      const colorDomain = extent(colorValues);
      
      let interpolator;
      if (colorScheme === 'regular') {
        interpolator = (t) => {
          const colors = ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'];
          const n = colors.length - 1;
          const i = Math.floor(t * n);
          const f = t * n - i;
          if (i >= n) return colors[n];
          if (i < 0) return colors[0];
          return interpolateRgb(colors[i], colors[i + 1])(f);
        };
      } else {
        interpolator = (t) => {
          const colors = ['#2166AC', '#4393C3', '#92C5DE', '#D1E5F0', '#FDDBC7', '#F4A582', '#D6604D', '#B2182B', '#8B0000'];
          const n = colors.length - 1;
          const i = Math.floor(t * n);
          const f = t * n - i;
          if (i >= n) return colors[n];
          if (i < 0) return colors[0];
          return interpolateRgb(colors[i], colors[i + 1])(f);
        };
      }
      return {
        type: 'sequential',
        scale: scaleSequential(interpolator).domain(colorDomain),
        domain: colorDomain,
        getColorValue
      };
    }
  };

  // Render legend component
  const renderLegend = () => {
    if (chartType !== 'scatter' || filteredData.length === 0) return null;

    const colorScaleInfo = buildColorScale(filteredData, colorBy, colorScheme);
    
    if (['domain', 'domain_primary'].includes(colorBy)) {
      // Categorical legend
      return createElement('div', {
        key: 'legend',
        style: {
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }
      }, [
        createElement('h3', {
          key: 'legend-title',
          style: { margin: '0 0 10px 0', fontSize: '14px', color: '#333', fontWeight: 'bold' }
        }, 'Color Legend'),
        ...colorScaleInfo.domain.map((domain, i) =>
          createElement('div', {
            key: `legend-item-${i}`,
            style: {
              display: 'flex',
              alignItems: 'center',
              marginBottom: '6px',
              fontSize: '12px'
            }
          }, [
            createElement('div', {
              key: `legend-color-${i}`,
              style: {
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: colorScaleInfo.scale(domain),
                marginRight: '8px',
                flexShrink: 0
              }
            }),
            createElement('span', { key: `legend-label-${i}` }, domain)
          ])
        )
      ]);
    } else if (['domain_count', 'mechanics_count'].includes(colorBy)) {
      // Gradient legend - will be rendered via useEffect
      return createElement('div', {
        key: 'legend',
        style: {
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }
      }, [
        createElement('h3', {
          key: 'legend-title',
          style: { margin: '0 0 10px 0', fontSize: '14px', color: '#333', fontWeight: 'bold' }
        }, 'Color Legend'),
        createElement('svg', {
          key: 'legend-svg',
          ref: legendSvgRef,
          style: { display: 'block' }
        })
      ]);
    }
    
    return null;
  };

  // Render gradient legend for count-based coloring
  useEffect(() => {
    if (legendSvgRef.current && chartType === 'scatter' && filteredData.length > 0) {
      const colorScaleInfo = buildColorScale(filteredData, colorBy, colorScheme);
      
      if (['domain_count', 'mechanics_count'].includes(colorBy)) {
        const svg = select(legendSvgRef.current);
        svg.selectAll('*').remove();
        
        const svgWidth = 260;
        const svgHeight = 60;
        
        svg.attr('width', svgWidth).attr('height', svgHeight);
        
        const gradient = svg.append('defs')
          .append('linearGradient')
          .attr('id', 'legend-gradient')
          .attr('x1', '0%')
          .attr('x2', '100%')
          .attr('y1', '0%')
          .attr('y2', '0%');
        
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
          const value = colorScaleInfo.domain[0] + (colorScaleInfo.domain[1] - colorScaleInfo.domain[0]) * (i / steps);
          gradient.append('stop')
            .attr('offset', `${(i / steps) * 100}%`)
            .attr('stop-color', colorScaleInfo.scale(value));
        }
        
        svg.append('rect')
          .attr('x', 10)
          .attr('y', 10)
          .attr('width', 240)
          .attr('height', 15)
          .attr('fill', 'url(#legend-gradient)')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1);
        
        svg.append('text')
          .attr('x', 10)
          .attr('y', 35)
          .attr('font-size', '12px')
          .attr('fill', '#333')
          .text(`${colorBy === 'domain_count' ? 'Domains' : 'Mechanics'} Count`);
        
        svg.append('text')
          .attr('x', 10)
          .attr('y', 50)
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .text(`${colorScaleInfo.domain[0]} - ${colorScaleInfo.domain[1]}`);
      }
    }
  }, [colorBy, colorScheme, filteredData, chartType]);

  const hasData = filteredData.length > 0 && !isLoading;

  return createElement('div', { style: { display: 'flex', height: '100vh' } }, [
    createElement('div', {
      key: 'chart-container',
      style: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    }, [
      createElement('svg', {
        key: 'chart',
        ref: svgRef,
        width: dimensions.width,
        height: dimensions.height,
        style: { display: 'block', marginRight: '10px' }
      }),
      // Loading indicator
      ...(isLoading ? [
        createElement('div', {
          key: 'loading',
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '16px',
            color: '#333'
          }
        }, 'Loading data...')
      ] : []),
      // Empty state message
      ...(!isLoading && !hasData ? [
        createElement('div', {
          key: 'empty-state',
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '300px'
          }
        }, [
          createElement('div', {
            key: 'empty-icon',
            style: { fontSize: '48px', marginBottom: '10px' }
          }, '📊'),
          createElement('div', {
            key: 'empty-title',
            style: { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }
          }, 'No data matches your filters'),
          createElement('div', {
            key: 'empty-message',
            style: { fontSize: '14px', color: '#666' }
          }, 'Try adjusting your domain or mechanics filters to see more games.')
        ])
      ] : [])
    ]),
    createElement('div', {
      key: 'controls',
      style: {
        width: `${controlsWidth}px`,
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderLeft: '1px solid #ddd',
        overflowY: 'auto',
        flexShrink: 0
      }
    }, [
      // Action buttons
      createElement('div', {
        key: 'action-buttons',
        style: {
          display: 'flex',
          gap: '8px',
          marginBottom: '20px'
        }
      }, [
        createElement('button', {
          key: 'reset-btn',
          onClick: handleReset,
          style: {
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        }, 'Reset'),
        createElement('button', {
          key: 'export-btn',
          onClick: handleExport,
          disabled: !hasData,
          style: {
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: hasData ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: hasData ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }
        }, 'Export PNG')
      ]),
      renderLegend(),
      createElement('h3', { key: 'chart-type-title', style: { margin: '0 0 15px 0', fontSize: '16px', color: '#333' } }, 'Chart Type'),
      createElement('select', {
        key: 'chart-type-select',
        value: chartType,
        onChange: (e) => handleChartTypeChange(e.target.value),
        style: {
          width: '100%',
          padding: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontWeight: 'bold'
        }
      }, [
        createElement('option', { key: 'scatter', value: 'scatter' }, 'Scatter Plot'),
        createElement('option', { key: 'sparkline', value: 'sparkline' }, 'Sparkline'),
        createElement('option', { key: 'bar', value: 'bar' }, 'Bar Chart'),
      ]),
      createElement('hr', { key: 'chart-type-divider', style: { margin: '0 0 20px 0', border: 'none', borderTop: '1px solid #ddd' } }),
      createElement('h3', { key: 'xaxis-title', style: { margin: '0 0 15px 0', fontSize: '16px', color: '#333' } }, 'Fields:'),
      // Only show Y Axis for scatter plots
      ...(chartType === 'scatter' ? [
        createElement('label', { key: 'yaxis-label', style: { display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' } }, 'Y Axis:'),
        createElement('select', {
          key: 'yaxis-select',
          value: yAxisField,
          onChange: (e) => setYAxisField(e.target.value),
          style: {
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }
        }, [
          createElement('option', { 
            key: 'y-rating', 
            value: 'rating',
            disabled: xAxisField === 'rating' || chartType === 'sparkline' || chartType === 'bar',
            style: (xAxisField === 'rating' || chartType === 'sparkline' || chartType === 'bar') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'BGG Rating'),
          createElement('option', { 
            key: 'y-rank', 
            value: 'rank',
            disabled: xAxisField === 'rank' || chartType === 'sparkline' || chartType === 'bar',
            style: (xAxisField === 'rank' || chartType === 'sparkline' || chartType === 'bar') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'BGG Rank'),
          createElement('option', { 
            key: 'y-complexity', 
            value: 'complexity',
            disabled: xAxisField === 'complexity' || chartType === 'sparkline' || chartType === 'bar',
            style: (xAxisField === 'complexity' || chartType === 'sparkline' || chartType === 'bar') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'Complexity Average'),
          createElement('option', { 
            key: 'y-users', 
            value: 'users',
            disabled: xAxisField === 'users' || chartType === 'sparkline' || chartType === 'bar',
            style: (xAxisField === 'users' || chartType === 'sparkline' || chartType === 'bar') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'Users Rated'),
          createElement('option', { 
            key: 'y-year', 
            value: 'year',
            disabled: xAxisField === 'year' || chartType === 'scatter',
            style: (xAxisField === 'year' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'Year Published'),
          createElement('option', { 
            key: 'y-min-players', 
            value: 'min_players',
            disabled: xAxisField === 'min_players' || chartType === 'scatter',
            style: (xAxisField === 'min_players' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'Min Players'),
          createElement('option', { 
            key: 'y-max-players', 
            value: 'max_players',
            disabled: xAxisField === 'max_players' || chartType === 'scatter',
            style: (xAxisField === 'max_players' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'Max Players'),
          createElement('option', { 
            key: 'y-play-time', 
            value: 'play_time',
            disabled: xAxisField === 'play_time' || chartType === 'scatter',
            style: (xAxisField === 'play_time' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'Play Time (minutes)'),
          createElement('option', { 
            key: 'y-min-age', 
            value: 'min_age',
            disabled: xAxisField === 'min_age' || chartType === 'scatter',
            style: (xAxisField === 'min_age' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
          }, 'Min Age'),
        ])
      ] : []),
      createElement('label', { key: 'xaxis-label', style: { display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' } }, 'X Axis:'),
      createElement('select', {
        key: 'xaxis-select',
        value: xAxisField,
        onChange: (e) => setXAxisField(e.target.value),
        style: {
          width: '100%',
          padding: '8px',
          marginBottom: '15px',
          fontSize: '13px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }
      }, [
        createElement('option', { 
          key: 'x-rating', 
          value: 'rating',
          disabled: yAxisField === 'rating' || chartType === 'sparkline' || chartType === 'bar',
          style: (yAxisField === 'rating' || chartType === 'sparkline' || chartType === 'bar') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'BGG Rating'),
        createElement('option', { 
          key: 'x-rank', 
          value: 'rank',
          disabled: yAxisField === 'rank' || chartType === 'sparkline' || chartType === 'bar',
          style: (yAxisField === 'rank' || chartType === 'sparkline' || chartType === 'bar') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'BGG Rank'),
        createElement('option', { 
          key: 'x-complexity', 
          value: 'complexity',
          disabled: yAxisField === 'complexity' || chartType === 'sparkline' || chartType === 'bar',
          style: (yAxisField === 'complexity' || chartType === 'sparkline' || chartType === 'bar') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'Complexity Average'),
        createElement('option', { 
          key: 'x-users', 
          value: 'users',
          disabled: yAxisField === 'users' || chartType === 'sparkline' || chartType === 'bar',
          style: (yAxisField === 'users' || chartType === 'sparkline' || chartType === 'bar') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'Users Rated'),
        createElement('option', { 
          key: 'x-year', 
          value: 'year',
          disabled: yAxisField === 'year' || chartType === 'scatter',
          style: (yAxisField === 'year' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'Year Published'),
        createElement('option', { 
          key: 'x-min-players', 
          value: 'min_players',
          disabled: yAxisField === 'min_players' || chartType === 'scatter',
          style: (yAxisField === 'min_players' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'Min Players'),
        createElement('option', { 
          key: 'x-max-players', 
          value: 'max_players',
          disabled: yAxisField === 'max_players' || chartType === 'scatter',
          style: (yAxisField === 'max_players' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'Max Players'),
        createElement('option', { 
          key: 'x-play-time', 
          value: 'play_time',
          disabled: yAxisField === 'play_time' || chartType === 'scatter',
          style: (yAxisField === 'play_time' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'Play Time (minutes)'),
        createElement('option', { 
          key: 'x-min-age', 
          value: 'min_age',
          disabled: yAxisField === 'min_age' || chartType === 'scatter',
          style: (yAxisField === 'min_age' || chartType === 'scatter') ? { color: '#999', backgroundColor: '#f0f0f0' } : {}
        }, 'Min Age'),
      ]),
      // Only show domain filter for scatter plots
      ...(chartType === 'scatter' ? [
        createElement('hr', { key: 'fields-divider', style: { margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' } }),
        createElement('h3', { key: 'domain-title', style: { margin: '0 0 15px 0', fontSize: '16px', color: '#333' } }, 'Filter by Domain'),
        createElement('div', { key: 'domain-checkboxes' }, [
          // All domains checkbox
          createElement('label', {
            key: 'all-domains',
            style: { 
              display: 'block', 
              marginBottom: '12px', 
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: '1px solid #ccc',
              paddingBottom: '8px'
            }
          }, [
            createElement('input', {
              key: 'all-domains-checkbox',
              type: 'checkbox',
              checked: selectedDomains.size === DOMAINS.length,
              onChange: handleAllDomainsToggle,
              style: { marginRight: '8px' }
            }),
            createElement('span', { key: 'all-domains-label' }, `All Domains (${selectedDomains.size}/${DOMAINS.length})`)
          ]),
          // Individual domain checkboxes
          ...DOMAINS.map(domain => 
            createElement('label', {
              key: domain,
              style: { 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '13px',
                cursor: 'pointer',
                marginLeft: '20px'
              },
              onMouseEnter: () => handleDomainHover(domain),
              onMouseLeave: handleDomainLeave
            }, [
              createElement('input', {
                key: `domain-${domain}`,
                type: 'checkbox',
                checked: selectedDomains.has(domain),
                onChange: () => handleDomainToggle(domain),
                style: { marginRight: '8px' }
              }),
              createElement('span', { key: `domain-label-${domain}` }, `${domain} (${data.filter(game => game.domains && game.domains.includes(domain)).length})`)
            ])
          )
        ])
      ] : []),
      // Only show mechanics filter for scatter plots
      ...(chartType === 'scatter' ? [
        createElement('hr', { key: 'divider', style: { margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' } }),
        createElement('h3', { key: 'mechanics-title', style: { margin: '0 0 15px 0', fontSize: '16px', color: '#333' } }, 'Filter by Mechanics'),
        createElement('div', { key: 'mechanics-checkboxes' }, [
          // All mechanics checkbox
          createElement('label', {
            key: 'all-mechanics',
            style: { 
              display: 'block', 
              marginBottom: '12px', 
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: '1px solid #ccc',
              paddingBottom: '8px'
            }
          }, [
            createElement('input', {
              key: 'all-mechanics-checkbox',
              type: 'checkbox',
              checked: selectedMechanics.size === MECHANICS.length,
              onChange: handleAllMechanicsToggle,
              style: { marginRight: '8px' }
            }),
            createElement('span', { key: 'all-mechanics-label' }, `All Mechanics (${selectedMechanics.size}/${MECHANICS.length})`)
          ]),
          // Individual mechanics checkboxes
          ...MECHANICS.map(mechanic => 
            createElement('label', {
              key: mechanic,
              style: { 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '13px',
                cursor: 'pointer',
                marginLeft: '20px'
              },
              onMouseEnter: () => handleMechanicHover(mechanic),
              onMouseLeave: handleMechanicLeave
            }, [
              createElement('input', {
                key: `mechanic-${mechanic}`,
                type: 'checkbox',
                checked: selectedMechanics.has(mechanic),
                onChange: () => handleMechanicToggle(mechanic),
                style: { marginRight: '8px' }
              }),
              createElement('span', { key: `mechanic-label-${mechanic}` }, `${mechanic} (${data.filter(game => game.mechanics && game.mechanics.includes(mechanic)).length})`)
            ])
          )
        ])
      ] : []),
      // Only show color mapping for scatter plots
      ...(chartType === 'scatter' ? [
        createElement('hr', { key: 'color-divider', style: { margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' } }),
        createElement('h3', { key: 'color-title', style: { margin: '0 0 15px 0', fontSize: '16px', color: '#333' } }, 'Color Mapping'),
        createElement('div', { key: 'color-controls' }, [
          createElement('label', {
            key: 'color-by-label',
            style: { 
              display: 'block', 
              marginBottom: '10px', 
              fontSize: '14px',
              fontWeight: 'bold'
            }
          }, 'Color by:'),
          createElement('select', {
            key: 'color-by-select',
            value: colorBy,
            onChange: (e) => setColorBy(e.target.value),
            style: { 
              width: '100%', 
              padding: '8px', 
              marginBottom: '15px',
              fontSize: '13px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }
          }, [
            createElement('option', { key: 'domain-option', value: 'domain' }, 'Domain (First)'),
            createElement('option', { key: 'domain-primary-option', value: 'domain_primary' }, 'Domain (Primary)'),
            createElement('option', { key: 'domain-count-option', value: 'domain_count' }, 'Domain Count'),
            createElement('option', { key: 'mechanics-count-option', value: 'mechanics_count' }, 'Mechanics Count')
          ]),
          createElement('label', {
            key: 'color-scheme-label',
            style: { 
              display: 'block', 
              marginBottom: '10px', 
              fontSize: '14px',
              fontWeight: 'bold'
            }
          }, 'Color Scheme:'),
          createElement('select', {
            key: 'color-scheme-select',
            value: colorScheme,
            onChange: (e) => setColorScheme(e.target.value),
            style: { 
              width: '100%', 
              padding: '8px', 
              marginBottom: '15px',
              fontSize: '13px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }
          }, [
            createElement('option', { key: 'regular-option', value: 'regular' }, 'Regular'),
            createElement('option', { key: 'colorblind-option', value: 'colorblind' }, 'Color Blind Friendly')
          ])
        ])
      ] : [])
    ])
  ]);
};

export { App };

