import { StateMap, ChoroplethLegend } from "./map-render";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { IncomeBreakdown, RaceBreakdown, VoteBreakdown, BoxWhiskerMCMC, EcologicalInferenceChart, ScatterPlot, EnsembleLegend } from "./graphs"
import 'react-tabs/style/react-tabs.css';
import { useAppState } from "../App";
import { useEffect, useState } from "react";
import { ei_sample_data_race, ei_sample_data_income, scatter_data } from "./sample_data"; // WILL BE REMOVED IN THE FUTURE

export function StatePage() {
    const { geoid, region, setRegion, setGraphRegion, choropleth, setChoropleth } = useAppState();
    const [isDropdownMode, setIsDropdownMode] = useState(false);

    const racialOptions = [
        { value: "racial-white", label: "Racial - White" },
        { value: "racial-black", label: "Racial - Black" },
        { value: "racial-native", label: "Racial - Native" },
        { value: "racial-asian", label: "Racial - Asian" },
    ];

    const allOptions = [
        { value: "none", label: "None" },
        { value: "electoral", label: "Electoral" },
        { value: "political", label: "Political" },
        { value: "economic", label: "Economic" },
        { value: "poverty", label: "Poverty" },
        { value: "density", label: "Density" },
        ...racialOptions,
      ];


    useEffect(() => {
        const handleKeyPress = (event) => {
          if (event.key === '[') {
            setIsDropdownMode((prevMode) => !prevMode);
          }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
      }, []);

    useEffect(() => {
        if (geoid === "state") {
            setGraphRegion("state")
        } else if (region === "district") {
            setGraphRegion("district")
        } else if (region === "precinct") {
            setGraphRegion("precinct")
        }
    }, [geoid])

    return (
        <div className='state-page-container'>

            <div className='state-data-column'>
                <StateOverview></StateOverview>
                <StateGraphs></StateGraphs>
            </div>

            <div className="state-map-panel">
                <div className='state-map-display'>
                    <div>
                    <p className="map-flavor-text">
                        {`Click a ${region === 'district' ? 'District' : 'Precinct'} to View Details`}
                    </p>
                    </div>
                    <StateMap />
                    <div className='region-button-container'>
                        <button onClick={() => setRegion("district")} className={region === "district" ? 'map-button-selected' : 'map-button-default'}>
                            District
                        </button>
                        <button onClick={() => setRegion("precinct")} className={region === "precinct" ? 'map-button-selected' : 'map-button-default'}>
                            Precinct
                        </button>
                    </div>
                </div>
                <div className="choropleth-controls">
                      {isDropdownMode ? (
                        // Dropdown mode
                          <div className="choropleth-button-container">
                             <div style={{marginBottom:"8px"}}>Select Choropleth:</div>
                        <select
                          value={choropleth}
                          onChange={(e) => {
                            const value = e.target.value;
                             setChoropleth(value);
                          }}
                          className="ei-select"
                        >
                          {allOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                              </div>
                      ) : (
                        // Button mode
                        <div className="choropleth-button-container">
                          <button
                            onClick={() => setChoropleth("none")}
                            className={choropleth === "none" ? 'map-button-selected' : 'map-button-default'}
                          >
                            None
                          </button>
                          <button
                            onClick={() => setChoropleth("electoral")}
                            className={choropleth === "electoral" ? 'map-button-selected' : 'map-button-default'}
                          >
                            Electoral
                          </button>
                          <button
                            onClick={() => setChoropleth("political")}
                            className={choropleth === "political" ? 'map-button-selected' : 'map-button-default'}
                          >
                            Political
                          </button>
                          <button
                            onClick={() => setChoropleth("economic")}
                            className={choropleth === "economic" ? 'map-button-selected' : 'map-button-default'}
                          >
                            Economic
                          </button>
                          <button
                            onClick={() => setChoropleth("poverty")}
                            className={choropleth === "poverty" ? 'map-button-selected' : 'map-button-default'}
                          >
                            Poverty
                          </button>
                          <button
                            onClick={() => setChoropleth("density")}
                            className={choropleth === "density" ? 'map-button-selected' : 'map-button-default'}
                          >
                            Density
                          </button>
                          <div className="dropdown-container">
                            <button
                              onClick={() => setChoropleth("racial")}
                              className={choropleth.startsWith("racial") ? 'map-button-selected' : 'map-button-default'}
                            >
                              Racial
                            </button>
                            {choropleth.startsWith("racial") && (
                              <div className="racial-menu">
                                {racialOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => setChoropleth(option.value)}
                                    className={choropleth === option.value ? 'racial-button-selected' : 'racial-button-default'}
                                  >
                                    {option.label.split(" - ")[1]}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {(choropleth === "none" || choropleth === "racial") ? null : <ChoroplethLegend />}
                    </div>
            </div>
        </div>
    );
}

export function StateOverview() {
    const { setGeoid, setRegion, selectedState, setBoxPlotSampleData, setMCMCEnactedPlan, setEiBarData, serverPath } = useAppState();
    const [ stateStatistics, setStateStatistics ] = useState();
    const [ districtTable, setDistrictTable ] = useState();

    const handleTableClick = (option) => {
        setGeoid(option);
        setRegion('district');
        document.getElementById("districtDetails").close();
    }

    useEffect(() => {
        const boxplotPath = `${serverPath}/data/boxplot-output-${selectedState}.json`;
        const boxplotPath2 = `${serverPath}/data/mcmc-current-plan.json`;
        const eiBarPath = `${serverPath}/data/ei_bar.json`;
        const statsPath = `${serverPath}/data/state-statistics.json`;
        const districtsPath = `/data/district-details.json`;

        fetch(boxplotPath)
            .then(response => response.json())
            .then(data => {
                setBoxPlotSampleData(data);
            })
            .catch(error => {
                console.error('Error fetching boxplot sample data:', error);
            });
        fetch(boxplotPath2)
            .then(response => response.json())
            .then(data => {
                setMCMCEnactedPlan(data);
            })
            .catch(error => {
                console.error('Error fetching boxplot2 sample data:', error);
            });
        fetch(eiBarPath)
            .then(response => response.json())
            .then(data => {
                setEiBarData(data[selectedState]);
            })
            .catch(error => {
                console.error('Error fetching state statistics:', error);
            });
        fetch(statsPath)
            .then(response => response.json())
            .then(data => {
                setStateStatistics(data[selectedState]);
            })
            .catch(error => {
                console.error('Error fetching state statistics:', error);
            });
        fetch(districtsPath)
            .then(response => response.json())
            .then(data => {
                setDistrictTable(data[selectedState]);
            })
            .catch(error => {
                console.error('Error fetching district details:', error);
            });
    }, []);

    if (!stateStatistics) {
        return <div>Loading...</div>;
    }

    return (
        <div className="state-overview">
            <dialog id="cdPlan"><div className="state-drawing-process"><span className="popup-style">{stateStatistics.drawingProcess}</span></div><br />
                <button onClick={() => {document.getElementById("cdPlan").close()}} className="map-button-default"> Close </button>
            </dialog>
            <dialog id="districtDetails">
                <div className="state-drawing-process">
                    <span className="popup-style">
                    {districtTable ? (
                        <span>
                            <h1 className="graph-region-header"> District Details </h1>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Number</th>
                                        <th>Representative</th>
                                        <th>Rep. Party</th>
                                        <th>Rep. Race</th>
                                        <th>Avg. HH Income</th>
                                        <th>Poverty</th>
                                        <th>% Rural</th>
                                        <th>% Suburb</th>
                                        <th>% Urban</th>
                                        <th>Vote Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {Object.keys(districtTable).map((key) => (
                                    <tr key={key}>
                                        <td onClick={() => handleTableClick(districtTable[key].geoid)} className="districtDetailsNumber"> {districtTable[key].number} </td>
                                        <td>{districtTable[key].representative}</td>
                                        <td>{districtTable[key].repParty}</td>
                                        <td>{districtTable[key].repRace}</td>
                                        <td>{districtTable[key].ahi}</td>
                                        <td>{districtTable[key].poverty}</td>
                                        <td>{districtTable[key].rural}</td>
                                        <td>{districtTable[key].suburban}</td>
                                        <td>{districtTable[key].urban}</td>
                                        <td className="districtDetailsCentered">{districtTable[key].vote}</td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                            <p className="districtDetailsText"> Click district number to display district plan </p>
                        </span>
                    ) : ( <p>Loading data...</p>) }
                    </span>
                </div><br />
                <button onClick={() => {document.getElementById("districtDetails").close()}} className="map-button-default"> Close </button>
            </dialog>
            <div className="state-overview-header">
                <div style={{ flexGrow: 1 }}></div> {/* Empty div to balance flex on the right side */}
            </div>
            <br />
            <div className="state-overview-internal">
                <div className="state-statistic-title">Total Population:</div>
                <div className="state-statistic">{stateStatistics.totalPop}</div>
                <div className="state-statistic-title">Political Lean:</div>
                <div className="state-statistic">{stateStatistics.politicalLean}</div>
                <div className="state-statistic-title">Percent Rural:</div>
                <div className="state-statistic">{stateStatistics.percentRural}</div>
                <div className="state-statistic-title">Drawing Process:</div>
                <div className="state-statistic">
                    <a id="viewcdplan" onClick={(e) => { e.preventDefault(); showCDPlan(); }} href="#">View🔎</a>
                </div>
                <div className="state-statistic-title">Voting Age Pop:</div>
                <div className="state-statistic">{stateStatistics.votingPop}</div>
                <div className="state-statistic-title">Median Income:</div>
                <div className="state-statistic">{stateStatistics.medianIncome}</div>
                <div className="state-statistic-title">Percent Suburb:</div>
                <div className="state-statistic">{stateStatistics.percentSuburb}</div>
                <div className="state-statistic-title">Districts:</div>
                <div className="state-statistic">{stateStatistics.districts}</div>
                <div className="state-statistic-title">Pop. Density:</div>
                <div className="state-statistic">{stateStatistics.popDensity}</div>
                <div className="state-statistic-title">Poverty Rate:</div>
                <div className="state-statistic">{stateStatistics.povertyRate}</div>
                <div className="state-statistic-title">Percent Urban:</div>
                <div className="state-statistic">{stateStatistics.percentUrban}</div>
                <div className="state-statistic-title">Precincts:</div>
                <div className="state-statistic">{stateStatistics.precincts}</div>
            </div>
            <p id="planinfo">5,000 district plan ensemble at 8% population threshold</p>
        </div>
    )
}

export function StateGraphs() {
    const { selectedState, region, graphRegion, setGraphRegion, geoid, setGeoid, eiParam, setEiParam, tabIndex, setTabIndex, serverPath,
            eiBarData } = useAppState();
    const [regionData, setRegionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regionName, setRegionName] = useState();
    const [voteData, setVoteData] = useState();
    const [raceData, setRaceData] = useState();
    const [incomeData, setIncomeData] = useState();
    const [eiBar, setEiBar] = useState(true);
    const [selectedGroup1, setSelectedGroup1] = useState('White');
    const [selectedGroup2, setSelectedGroup2] = useState('Black');
    const [scatterToggle, setScatterToggle] = useState(true);
    const [selectedRacialGroup, setSelectedRacialGroup] = useState('WHITE');
    const [selectedIncomeGroup, setSelectedIncomeGroup] = useState('< $30k');
    const [precinctTable, setPrecinctTable] = useState();

    const categoryLabels = {
        WHITE: 'White',
        BLACK: 'Black',
        NATIVE: 'Native',
        ASIAN: 'Asian',
        OTHER_race: 'Other Race',
        '< $30k': '< $30k',
        '$30k - $59k': '$30k - $59k',
        '$60k - $99k': '$60k - $99k',
        '$100k - $149k': '$100k - $149k',
        '> $150k': '> $150k'
    };

    const handlePrecinctToggle = () => {
        document.getElementById("precinctDetails").close();
    }

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    
    const percentify = (decimal) => {
        return (parseFloat(decimal) * 100).toFixed(3) + '%';
    }

    const fetchData = async () => {
        setLoading(true);

        try {
            const filepath = `${serverPath}/data/${selectedState}-${graphRegion}-data.json`;

            const dataResponse = await fetch(filepath);
            if (!dataResponse.ok) {
                throw new Error('Failed to load Graph Region data');
            }
            const rData = await dataResponse.json();
            setRegionData(rData);
            const precinctFetch = await fetch(`/data/precinct-details.json`)
            const precinctTableData = await precinctFetch.json()
            setPrecinctTable(precinctTableData[selectedState])
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data for graphs
    useEffect(() => {
        fetchData();
        setTabIndex(0);
    }, [selectedState, graphRegion]);

    // Set graph data every time geoid changes
    useEffect(() => {
        if (loading || !regionData || regionData.length === 0) return;

        let currentRegionData;

        if (graphRegion === 'state') {
            currentRegionData = regionData[0];
        } else {
            currentRegionData = regionData.find(item => item.GEOID === geoid);
        }

        // Check if `currentRegionData` exists before attempting to set data
        if (currentRegionData) {
            // Set the data for vote breakdown
            setVoteData({
                TRUMP: currentRegionData.TRUMP,
                BIDEN: currentRegionData.BIDEN,
                OTHER_vote: currentRegionData.OTHER_vote,
            });

            // Set the data for race breakdown
            setRaceData({
                WHITE: currentRegionData.WHITE,
                BLACK: currentRegionData.BLACK,
                NATIVE: currentRegionData.NATIVE,
                ASIAN: currentRegionData.ASIAN,
                OTHER_race: currentRegionData.OTHER_race,
            });

            // Set the data for income breakdown
            setIncomeData({
                'Less than $10,000': currentRegionData['Less than $10,000'],
                '$10,000 to $14,999': currentRegionData['$10,000 to $14,999'],
                '$15,000 to $19,999': currentRegionData['$15,000 to $19,999'],
                '$20,000 to $24,999': currentRegionData['$20,000 to $24,999'],
                '$25,000 to $29,999': currentRegionData['$25,000 to $29,999'],
                '$30,000 to $34,999': currentRegionData['$30,000 to $34,999'],
                '$35,000 to $39,999': currentRegionData['$35,000 to $39,999'],
                '$40,000 to $44,999': currentRegionData['$40,000 to $44,999'],
                '$45,000 to $49,999': currentRegionData['$45,000 to $49,999'],
                '$50,000 to $59,999': currentRegionData['$50,000 to $59,999'],
                '$60,000 to $74,999': currentRegionData['$60,000 to $74,999'],
                '$75,000 to $99,999': currentRegionData['$75,000 to $99,999'],
                '$100,000 to $124,999': currentRegionData['$100,000 to $124,999'],
                '$125,000 to $149,999': currentRegionData['$125,000 to $149,999'],
                '$150,000 to $199,999': currentRegionData['$150,000 to $199,999'],
                '$200,000 or more': currentRegionData['$200,000 or more'],
            });
        }
    }, [geoid, regionData, loading]);

    useEffect(() => {
        if (graphRegion === 'state') {
            setRegionName("State Overview")
        } else if (graphRegion === 'district') {
            setRegionName("District:");
        } else if (graphRegion === 'precinct') {
            setRegionName("Precinct:");
        }
    }, [graphRegion, geoid]);

    return (
        <span>
            <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)} >
            <TabList>
                <Tab> Overview </Tab>
                <Tab> Ecological Inference </Tab>
                <Tab> Ensemble Plan Analysis </Tab>
                <Tab> Voting Behavior Analysis </Tab>
            </TabList>

            <TabPanel>
                {/* Overview */}
                {!loading && voteData && raceData && incomeData ? (
                    <div>
                        <div className="graph-region-div">
                            <button onClick={() => {setGraphRegion("state"); setGeoid("state"); }} className="state-overview-button">
                                View State Overview
                            </button>
                            <button onClick={(e) => {e.preventDefault(); showDistrictDetails();}} className="district-details-button"> 
                                District Details
                            </button>
                            { regionName && (graphRegion === "state" || geoid) && (
                                <div className="region-header-div">
                                    <h1 className="graph-region-header">
                                        {regionName} {graphRegion !== "state" ? `${geoid}` : ''}
                                    </h1>
                                </div>
                            )}
                        </div>
                        <span className="overview-graphs">
                            <VoteBreakdown data={voteData} />
                            <RaceBreakdown data={raceData} />
                            <IncomeBreakdown data={incomeData} />
                        </span>
                    </div>
                ) : null}
            </TabPanel>
            <TabPanel>
                {/* Ecological Inference Graphs */}
                <div className="graph-region-div">
                    <button onClick={() => {setEiBar(!eiBar)}} className="ei-option-button">
                        {eiBar ? 'View as Probability Density' : 'View as Bar Graph'}
                    </button>
                    <div className="ei-buttons">
                        {eiBar ? (
                            /* Bar Chart Mode */
                            <>
                                <div className="ei-button-container">
                                    <button onClick={() => setEiParam("race")}
                                            className={eiParam === "race" ? 'map-button-selected' : 'map-button-default'}>
                                        Race
                                    </button>
                                    <button onClick={() => setEiParam("income")}
                                            className={eiParam === "income" ? 'map-button-selected' : 'map-button-default'}>
                                        Income
                                    </button>
                                    <button onClick={() => setEiParam("region")}
                                            className={eiParam === "region" ? 'map-button-selected' : 'map-button-default'}>
                                        Region
                                    </button>
                                </div>
                                <EcologicalInferenceChart
                                    data={eiBarData[eiParam]}
                                    title={'Support for Candidates by ' + ({
                                        race: 'Race',
                                        income: 'Income',
                                        region: 'Region Type'
                                    })[eiParam]}
                                    xAxisLabel={({
                                        race: 'Race',
                                        income: 'Income',
                                        region: 'Region Type'
                                    })[eiParam]}
                                />
                            </>
                        ) : (
                            /* Probability Density Mode */
                            <div>
                                <div>
                                    <div className="ei-compare-select">
                                        Select Group 1: 
                                        <select value={selectedGroup1} onChange={(e) => setSelectedGroup1(e.target.value)} className="ei-select">
                                            {[
                                                'White', 'Black', 'Native', 'Asian', 'Other',
                                                'Less than $30k', '$30k - $59k', '$60k - $99k',
                                                '$100k - $149k', 'More than $150k', 'Rural',
                                                'Urban', 'Suburban'
                                            ].map(group => (
                                                <option key={group} value={group}>{group}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <br />
                                    <div className="ei-compare-select">
                                        Select Group 2: 
                                        <select value={selectedGroup2} onChange={(e) => setSelectedGroup2(e.target.value)} className="ei-select">
                                            {[
                                                'White', 'Black', 'Native', 'Asian', 'Other',
                                                'Less than $30k', '$30k - $59k', '$60k - $99k',
                                                '$100k - $149k', 'More than $150k', 'Rural',
                                                'Urban', 'Suburban'
                                            ].map(group => (
                                                <option key={group} value={group}>{group}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="ei-graphs">
                                    <img
                                        src={`/ei_graphs/ei-graph-${selectedState}-${selectedGroup1}.png`}
                                        alt={`Graph for ${selectedGroup1}`}
                                        width={500}
                                    />
                                    <img
                                        src={`/ei_graphs/ei-graph-${selectedState}-${selectedGroup2}.png`}
                                        alt={`Graph for ${selectedGroup2}`}
                                        width={500}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </TabPanel>
            <TabPanel>
                <div className="ensemble-plan-div">
                    <MCMCButtons />
                    <BoxWhiskerMCMC />
                    <EnsembleLegend />
                </div>
            </TabPanel>
          <TabPanel>
            <div className="graph-region-div">
              {/* Gingles Scatter Graphs */}
              <div>
              <dialog id="precinctDetails">
                <div className="state-drawing-process">
                  <span className="popup-style">
                    { precinctTable ? (
                      <span>
                        <h1 className="graph-region-header">  </h1>
                        <table>
                                <thead>
                                    <tr>
                                        <th>Precinct Name</th>
                                        <th>Total Population</th>
                                        <th>Region Type</th>
                                        <th>Non-White Population</th>
                                        <th>Avg. HH Income Range</th>
                                        <th>Republican Votes</th>
                                        <th>Democratic Votes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {Object.keys(precinctTable).map((key) => (
                                    <tr key={key}>
                                        <td> {precinctTable[key].GEOID} </td>
                                        <td>{precinctTable[key].TOTAL_POPULATION}</td>
                                        <td>{capitalizeFirstLetter(precinctTable[key].REGION_TYPE)} </td>
                                        <td>{percentify(precinctTable[key].NON_WHITE_POPULATION)}</td>
                                        <td>{precinctTable[key].AHI}</td>
                                        <td>{percentify(precinctTable[key].REPUBLICAN_VOTES)}</td>
                                        <td>{percentify(precinctTable[key].DEMOCRATIC_VOTES)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                            <p className="districtDetailsText"> </p>
                      </span>
                    ) : (
                      <p> Loading data ...</p>
                    )}
                  </span>
                  </div><br />
                  <button onClick={() => {handlePrecinctToggle()}} className="precinctDetailClose"> X </button>
              </dialog>
                <button onClick={() => {setScatterToggle(!scatterToggle)}} className={"ei-option-button"} >
                  {scatterToggle ? "Combine Two (2) Groups" : "View One (1) Group"}
                </button>
                <button onClick={() => {document.getElementById("precinctDetails").showModal()}}className="ei-table-button">
                  {"See Tabular Display"}
                </button>
              </div>
              {scatterToggle ? (
                        /* Choose One */
                        <div className="ensemble-plan-div">
                            <ScatterButtons categoryLabels={categoryLabels}/>
                            <ScatterPlot combine={false}/>
                        </div>
                    ) : (
                        /* Choose Two */
                        <div>
                            <div>
                                <div className="ei-compare-select">
                                    Select Racial Group:
                                    <select value={selectedRacialGroup}
                                            onChange={(e) => setSelectedRacialGroup(e.target.value)}
                                            className="ei-select">
                                        {[
                                            'WHITE', 'BLACK', 'NATIVE', 'ASIAN', 'OTHER_race',
                                        ].map(group => (
                                            <option key={group} value={group}>{categoryLabels[group]}</option>
                                        ))}
                                    </select>
                                </div>
                                <br />
                                <div className="ei-compare-select">
                                    Select Income Group:
                                    <select value={selectedIncomeGroup}
                                            onChange={(e) => setSelectedIncomeGroup(e.target.value)}
                                            className="ei-select">
                                        {[
                                            '< $30k', '$30k - $59k', '$60k - $99k',
                                            '$100k - $149k', '> $150k'
                                        ].map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <br/>
                            <div className="ei-graphs">
                                <ScatterPlot combine={true} g1={selectedRacialGroup} g2={selectedIncomeGroup} />
                            </div>
                        </div>
                    )}
            </div>
          </TabPanel>
        </Tabs>
      </span>
    );
}

export function MCMCButtons() {
    const { MCMCParam, setMCMCParam } = useAppState();

    // Define race and economic categories separately
    const raceCategories = ['White', 'Black', 'Native', 'Asian', 'Other Race'];
    const economicCategories = [
        '< $10k', '$10k - $29k', '$30k - $49k', '$50k - $99k', '$100k - $149k', '$150k - $199k', '> $200k'
    ];
    const regionTypeCategories = ['Rural', 'Suburban', 'Urban'];

    return (
        <div className="mc-buttons">
            {/* Race Buttons */}
            <div className="mc-buttons-row">
                {raceCategories.map((cat) => (
                    <button key={cat} onClick={() => setMCMCParam(cat)}
                            className={MCMCParam === cat ? 'mcmc-button-selected' : 'mcmc-button-default'}>
                        {cat}
                    </button>
                ))}
            </div>
            <br/>
            {/* Economic Buttons */}
            <div className="mc-buttons-row">
                {economicCategories.map((cat) => (
                    <button key={cat} onClick={() => setMCMCParam(cat)}
                            className={MCMCParam === cat ? 'mcmc-button-selected' : 'mcmc-button-default'}>
                        {cat}
                    </button>
                ))}
            </div>
            <br/>
            {/* Region Type Buttons */}
            <div className="mc-buttons-row">
                {regionTypeCategories.map((cat) => (
                    <button key={cat} onClick={() => setMCMCParam(cat)}
                            className={MCMCParam === cat ? 'mcmc-button-selected' : 'mcmc-button-default'}>
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function ScatterButtons({categoryLabels}) {
    const {scatterParam, setScatterParam} = useAppState();

    // Define race and economic categories separately
    const raceCategories = ["WHITE", "BLACK", "NATIVE", "ASIAN", "OTHER_race"];
    const economicCategories = ['< $30k', '$30k - $59k', '$60k - $99k', '$100k - $149k', '> $150k'];

    return (
        <div className="mc-buttons">
            {/* Race Buttons */}
            <div className="mc-buttons-row">
                {raceCategories.map((cat) => (
                    <button key={cat} onClick={() => setScatterParam(cat)} className={scatterParam === cat ? 'mcmc-button-selected' : 'mcmc-button-default'}>
                        {categoryLabels[cat]}
                    </button>
                ))}
            </div>
            <br />
            {/* Economic Buttons */}
            <div className="mc-buttons-row">
                {economicCategories.map((cat) => (
                    <button key={cat} onClick={() => setScatterParam(cat)} className={scatterParam === cat ? 'mcmc-button-selected' : 'mcmc-button-default'}>
                        {categoryLabels[cat]}
                    </button>
                ))}
            </div>
            <div className="mc-buttons-row">
                <button key="dt_x" onClick={() => setScatterParam("dt_x")} className={scatterParam === "dt_x" ? 'mcmc-button-selected' : 'mcmc-button-default'}>
                    Region Type
                </button>
            </div>
        </div>
    );
}

function showCDPlan() {
    document.getElementById("cdPlan").showModal();
    return false;
}

function showDistrictDetails() {
    document.getElementById("districtDetails").showModal();
    return false;
}
