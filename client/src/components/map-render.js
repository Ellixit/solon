import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MapContainer, TileLayer, GeoJSON, AttributionControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppState } from "../App";
import { availableStates, stateAbbrMap, stateConfig } from "../App"

export function USMap() {
    const svgRef = useRef();
    const { setSelectedState, serverPath } = useAppState();

    useEffect(() => {

        const svg = d3.select(svgRef.current)
            .attr('width', 1100)
            .attr('height', 630);

        // Load the US states GeoJSON data
        d3.json(`${serverPath}/geojson/us-map.json`)
            .then((data) => {
                if (!data) {
                    console.error('Failed to load GeoJSON data');
                    return;
                }

                const projection = d3.geoAlbersUsa()
                    .scale(1300)
                    .translate([590, 300]);

                const path = d3.geoPath().projection(projection);

                svg.selectAll('*').remove();

                const g = svg.append('g');

                // Draw each state
                g.selectAll('path')
                    .data(data.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('fill', d => { // Color all states beige, CT and OK are dark green
                        if (availableStates.includes(d.properties.NAME)) {
                            return '#609966';
                        }
                        return '#f1faee';
                    })
                    .attr('stroke', '#40513B')
                    .attr('stroke-width', 1)
                    .on('mouseover', function (event, d) { // States are highlighted when hovered
                        if (availableStates.includes(d.properties.NAME)) {
                            d3.select(this).attr('fill', '#40513B');
                        } else {
                            d3.select(this).attr('fill', '#9DC08B');
                        }
                    })
                    .on('mouseout', function (event, d) { // Return to original color after mouseout
                        if (availableStates.includes(d.properties.NAME)) {
                            d3.select(this).attr('fill', '#609966');
                        } else {
                            d3.select(this).attr('fill', '#f1faee');
                        }
                    })
                    .on('click', function (event, feature) { // Set selected state when valid state clicked
                        const stateName = feature.properties.NAME;
                        if (availableStates.includes(stateName)) {
                            setSelectedState(stateAbbrMap[stateName]);
                        }
                    });
            })
            .catch((error) => {
                console.error('Error loading or processing GeoJSON:', error);
            });
    }, [setSelectedState]);

    return (
        <div className='us-map-placement'>
            <svg ref={svgRef} />
        </div>
    );
}

export function StateMap() {
    const { selectedState, region, choropleth, geoid, setGeoid, setTabIndex, serverPath } = useAppState();
    const [geoData, setGeoData] = useState(null); // State to store GeoJSON data
    const [regionData, setRegionData] = useState(null); // State to store associated data
    const [loading, setLoading] = useState(true); // Loading state to indicate data fetching

    // Fetch both GeoJSON geometry and data
    const fetchData = async () => {
        setLoading(true);

        try {
            const geoPath = `${serverPath}/geojson/${selectedState}-${region}-geometry.geojson`;
            const dataPath = `${serverPath}/data/${selectedState}-${region}-data.json`;

            const geoResponse = await fetch(geoPath);
            if (!geoResponse.ok) {
                throw new Error('Failed to load GeoJSON data');
            }
            const geoJson = await geoResponse.json();

            const dataResponse = await fetch(dataPath);
            if (!dataResponse.ok) {
                throw new Error('Failed to load Region data');
            }
            const rData = await dataResponse.json();

            setGeoData(geoJson);
            setRegionData(rData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch GeoJSON data on region or choropleth change
    useEffect(() => {
        fetchData();
    }, [region, choropleth]);

    // Define center and zoom level based on state
    const getMapCenterAndZoom = () => {
        return stateConfig[selectedState].mapLocation;
    };
    const { center, zoom } = getMapCenterAndZoom();

    // Function to find the highest income bracket
    const getHighestIncomeBracket = (data) => {
        const groupedData = {
            "< $10k": data["Less than $10,000"],
            "$10k - $29k": data["$10,000 to $14,999"] + data["$15,000 to $19,999"] + data["$20,000 to $24,999"] + data["$25,000 to $29,999"],
            "$30k - $49k": data["$30,000 to $34,999"] + data["$35,000 to $39,999"] + data["$40,000 to $44,999"] + data["$45,000 to $49,999"],
            "$50k - $99k": data["$50,000 to $59,999"] + data["$60,000 to $74,999"] + data["$75,000 to $99,999"],
            "$100k - $149k": data["$100,000 to $124,999"] + data["$125,000 to $149,999"],
            "$150k - $199k": data["$150,000 to $199,999"],
            "> $200k": data["$200,000 or more"]
        };
        
        const total = Object.values(groupedData).reduce((sum, value) => sum + value, 0);
    
        let cumulativeSum = 0;
        let medianRange = null;
        
        for (let [range, count] of Object.entries(groupedData)) {
            cumulativeSum += count;
            if (cumulativeSum >= total / 2) {
                medianRange = range;
                break;
            }
        }
        
        switch (medianRange) {
            case "< $10k":
                return 9999;
            case "$10k - $29k":
                return 10001;
            case "$30k - $49k":
                return 30001;
            case "$50k - $99k":
                return 50001;
            case "$100k - $149k":
                return 100001;
            case "$150k - $199k":
                return 150001;
            case "> $200k":
                return 200001;
            default:
                return 0;
        }        
    };

    const getRacialWhiteColor = (percentRace) => {
        return percentRace > 0.95 ? '#084081' : // Dark blue
            percentRace > 0.9     ? '#0868ac' :
            percentRace > 0.85     ? '#2b8cbe' :
            percentRace > 0.8     ? '#4eb3d3' :
            percentRace > 0.75    ? '#7bccc4' :
            percentRace > 0.70    ? '#a8ddb5' :
            '#ccebc5'; // Light blue
    };
    const getRacialOtherColor = (percentRace) => {
        return percentRace > 0.3 ? '#084081' : // Dark blue
            percentRace > 0.25     ? '#0868ac' :
            percentRace > 0.2     ? '#2b8cbe' :
            percentRace > 0.15     ? '#4eb3d3' :
            percentRace > 0.10    ? '#7bccc4' :
            percentRace > 0.5    ? '#a8ddb5' :
            '#ccebc5'; // Light blue
    };

    const getElectoralColor = (bidenPercent, trumpPercent) => {
        const difference = bidenPercent - trumpPercent;
        if (difference >= 0.1) return '#084594'; // Dark Blue: Biden > 10%
        if (difference >= 0.05) return '#2682d1'; // Medium Blue: Biden 5-10%
        if (difference > 0) return '#90d2fc'; // Light Blue: Biden < 5%
        if (difference <= -0.1) return '#67000d'; // Dark Red: Trump > 10%
        if (difference <= -0.05) return '#d6181f'; // Medium Red: Trump 5-10%
        if (difference < 0) return '#fa555a'; // Light Red: Trump < 5%
        return '#5e5e5e'; // Grey: Tie or no data
    };

    const getPoliticalColor = (bidenPercent, trumpPercent, income) => {
        const difference = bidenPercent - trumpPercent;
        if (difference > 0 && income > 150000) return '#084594'; // Dark Blue: Biden | High
        if (difference > 0 && income > 50000) return '#2682d1'; // Medium Blue: Biden | Medium
        if (difference > 0) return '#90d2fc'; // Light Blue: Biden | Low
        if (difference < 0 && income > 150000) return '#67000d'; // Dark Red: Trump | High
        if (difference < 0 && income > 50000) return '#d6181f'; // Medium Red: Trump | Medium
        if (difference < 0) return '#fa555a'; // Light Red: Trump | Low
        return '#5e5e5e'; // Grey: Tie or no data
    };

    const getEconomicColor = (value) => {
        return value > 200000 ? '#00441b' : // Dark green
            value > 150000    ? '#006d2c' :
            value > 100000    ? '#31a354' :
            value > 50000     ? '#74c476' :
            value > 30000     ? '#a1d99b' :
            value > 10000     ? '#c7e9c0' :
            '#f7fcf5'; // Very light green
    };

    const getPovertyColor = (povPercent) => {
        return povPercent > 0.50 ? '#67000d' : // Dark red
            povPercent > 0.4  ? '#a50f15' :
            povPercent > 0.3  ? '#cb181d' :
            povPercent > 0.2  ? '#ef3b2c' :
            povPercent > 0.1  ? '#fb6a4a' :
            povPercent > 0.05 ? '#fc9272' :
        '#fee5d9'; // Light pink
    };

    const getDensityColor = (density) => {
        if (density === "rural") {
            return "#D6B8E6";
        } else if (density === "suburban") {
            return "#9C7FC3";
        } else if (density === "urban") {
            return "#4E217D";
        } else {
            return "#5e5e5e";
        }
    };
    

    // Determine fill color based on choropleth type
    const getFillColor = (feature) => {
        const regionFeature = regionData.find(item => item.GEOID === feature.properties.GEOID);

        if (choropleth === 'economic' && regionFeature) {
            const highestBracketMidpoint = getHighestIncomeBracket(regionFeature);
            return getEconomicColor(highestBracketMidpoint);
        } else if (choropleth === 'electoral' && regionFeature) {
            return getElectoralColor(regionFeature.BIDEN, regionFeature.TRUMP);
        } else if (choropleth === 'political' && regionFeature) {
            const highestBracketMidpoint = getHighestIncomeBracket(regionFeature);
            return getPoliticalColor(regionFeature.BIDEN, regionFeature.TRUMP, highestBracketMidpoint);
        } else if (choropleth === 'poverty' && regionFeature) {
            return getPovertyColor(regionFeature.poverty_level);
        } else if (choropleth === 'density' && regionFeature) {
            try { return getDensityColor(regionFeature.density_type); } catch { return "#5e5e5e"; }
        } else if (choropleth === 'racial-white' && regionFeature) {
            return getRacialWhiteColor(regionFeature.WHITE);
        } else if (choropleth === 'racial-black' && regionFeature) {
            return getRacialOtherColor(regionFeature.BLACK);
        } else if (choropleth === 'racial-native' && regionFeature) {
            return getRacialOtherColor(regionFeature.NATIVE);
        } else if (choropleth === 'racial-asian' && regionFeature) {
            return getRacialOtherColor(regionFeature.ASIAN);
        }
        return '#c9c9c9';
    };

    // Style function for GeoJSON layer
    const geoJSONStyle = (feature) => ({
        color: feature.properties.GEOID === geoid ? '#000000' : '#404040',
        weight: feature.properties.GEOID === geoid ? 2 : 1,
        fillColor: getFillColor(feature),
        fillOpacity: 0.8
    });

    const onEachFeature = (feature, layer) => {
        if (feature.properties.GEOID !== geoid) {
            layer.on({
                mouseover: (event) => {
                    event.target.setStyle({
                        fillOpacity: 0.1,
                    });
                },
                mouseout: (event) => {
                    event.target.setStyle({
                        fillOpacity: 0.8,
                    });
                },
                click: () => {
                    setGeoid(feature.properties.GEOID);
                    setTabIndex(0);
                }
            });
        }
    };

    return (
        <div>
            <MapContainer className='map-outline' center={center} zoom={zoom} attributionControl={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {!loading && geoData && regionData && (
                    <GeoJSON
                        key={region}
                        data={geoData}
                        style={geoJSONStyle}
                        onEachFeature={onEachFeature}
                    />
                )}
                <AttributionControl position="bottomleft" />
            </MapContainer>
        </div>
    );
}

export function ChoroplethLegend() {
    const { choropleth } = useAppState();

    const electoralRanges = [
        { range: 'Biden > 10%', color: '#084594' }, // Dark Blue
        { range: 'Biden 5% - 10%', color: '#2682d1' }, // Medium Blue
        { range: 'Biden < 5%', color: '#90d2fc' }, // Light Blue
        { range: 'Tie / No Data', color: '#5e5e5e' }, // Grey
        { range: 'Trump < 5%', color: '#fa555a' }, // Light Red
        { range: 'Trump 5% - 10%', color: '#d6181f' }, // Medium Red
        { range: 'Trump > 10%', color: '#67000d' }, // Dark Red
    ];

    const politicalRanges = [
        { range: 'Dem. | High', color: '#084594' }, // Dark Blue
        { range: 'Dem. | Medium', color: '#2682d1' }, // Medium Blue
        { range: 'Dem. | Low', color: '#90d2fc' }, // Light Blue
        { range: 'Tie / No Data', color: '#5e5e5e' }, // Grey
        { range: 'Rep. | Low', color: '#fa555a' }, // Light Red
        { range: 'Rep. | Medium', color: '#d6181f' }, // Medium Red
        { range: 'Rep. | High', color: '#67000d' }, // Dark Red
    ];

    const economicRanges = [
        { range: '> $200k', color: '#00441b' }, // Dark green
        { range: '$150k - $199k', color: '#006d2c' },
        { range: '$100k - $149k', color: '#31a354' },
        { range: '$50k - $99k', color: '#74c476' },
        { range: '$30k - $49k', color: '#a1d99b' },
        { range: '$10k - $29k', color: '#c7e9c0' },
        { range: '< $10k', color: '#f7fcf5' }, // Light green
    ];

    const povertyRanges = [
        { range: '> 50%', color: '#67000d' }, // Dark Red
        { range: '40% - 50%', color: '#a50f15' }, // Medium-Dark Red
        { range: '30% - 40%', color: '#cb181d' }, // Medium Red
        { range: '20% - 30%', color: '#ef3b2c' }, // Light Red
        { range: '10% - 20%', color: '#fb6a4a' }, // Lighter Red
        { range: '5% - 10%', color: '#fc9272' }, // Very Light Red
        { range: '< 5%', color: '#fee5d9' }, // Light Pink
    ];

    const densityRanges = [
        { range: 'Rural', color: '#D6B8E6' },
        { range: 'Suburban', color: '#9C7FC3' },
        { range: 'Urban', color: '#4E217D' },
        { range: 'No Data', color: '#5e5e5e' }
    ];

    const racialWhiteRanges = [
        { range: '> 95%', color: '#084081' }, // Dark Blue
        { range: '90% - 95%', color: '#0868ac' },
        { range: '85% - 90%', color: '#2b8cbe' },
        { range: '80% - 85%', color: '#4eb3d3' },
        { range: '75% - 80%', color: '#7bccc4' },
        { range: '70% - 75%', color: '#a8ddb5' },
        { range: '< 70%', color: '#ccebc5' }, // Light green
    ];
    const racialOtherRanges = [
        { range: '> 30%', color: '#084081' }, // Dark Blue
        { range: '25% - 30%', color: '#0868ac' },
        { range: '20% - 25%', color: '#2b8cbe' },
        { range: '15% - 20%', color: '#4eb3d3' },
        { range: '10% - 15%', color: '#7bccc4' },
        { range: '5% - 10%', color: '#a8ddb5' },
        { range: '< 5%', color: '#ccebc5' }, // Light green
    ];

    let legendData = [];
    let choroplethContext = "Legend";

    switch (choropleth) {
        case 'electoral':
            legendData = electoralRanges;
            choroplethContext = 'Vote Margin 2020';
            break;
        case 'political':
            legendData = politicalRanges;
            choroplethContext = 'Political Alignment by Income Level';
            break;
        case 'economic':
            legendData = economicRanges;
            choroplethContext = 'Median Income';
            break;
        case 'poverty':
            legendData = povertyRanges;
            choroplethContext = 'Poverty Percentage';
            break;
        case 'density':
            legendData = densityRanges;
            choroplethContext = 'Population Density';
            break;
        case 'racial-white':
            legendData = racialWhiteRanges;
            choroplethContext = '% Population White';
            break;
        case 'racial-black':
            legendData = racialOtherRanges;
            choroplethContext = '% Population Black';
            break;
        case 'racial-native':
            legendData = racialOtherRanges;
            choroplethContext = '% Population Native';
            break;
        case 'racial-asian':
            legendData = racialOtherRanges;
            choroplethContext = '% Population Asian';
            break;
    }

    return (
        <div className="choropleth-legend">
            <h1 className='choropleth-legend-heading'>Legend</h1>
            <p className='choropleth-legend-subheading'>{choroplethContext}</p>
            <ul className='choropleth-list'>
                {legendData.map((item, index) => (
                    <li key={index} className='choropleth-legend-item'>
                        <span
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: item.color,
                                display: 'inline-block',
                                marginRight: '8px',
                                border: '1px solid #000'
                            }}
                        ></span>
                        <span>{item.range}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
