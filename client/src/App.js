import {React, useContext, createContext, useState} from 'react'
import './stylesheets/App.css' ;
import Homepage from './components/homepage';

const AppState = createContext();
export const availableStates = ['Oklahoma', 'Connecticut'];
export const stateAbbrMap = { Connecticut: 'ct', Oklahoma: 'ok' }
export const stateNameMap = { ct: "Connecticut", ok: "Oklahoma" }
export const stateConfig = {
    ok: { mapLocation: { center: [35.7, -98.5], zoom: 6 } },
    ct: { mapLocation: { center: [41.6, -72.7], zoom: 8 } }
}

function App() {
  const [selectedState, setSelectedState] = useState("none");
  const [region, setRegion] = useState("district");
  const [graphRegion, setGraphRegion] = useState("state");
  const [eiParam, setEiParam] = useState("race");
  const [MCMCParam, setMCMCParam] = useState("White");
  const [scatterParam, setScatterParam] = useState("WHITE");
  const [choropleth, setChoropleth] = useState("none");
  const [boxPlotSampleData, setBoxPlotSampleData] = useState("none");
  const [MCMCEnactedPlan, setMCMCEnactedPlan] = useState("none");
  const [eiBarData, setEiBarData] = useState("none");
  const [geoid, setGeoid] = useState("none");
  const [mapCenter, setMapCenter] = useState([0,0]);
  const [mapZoom, setMapZoom] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);

  // Filepaths
  // const serverPath = 'http://localhost:8080';
  const serverPath = '';

  return (
    <AppState.Provider value={{
      selectedState, setSelectedState, region, setRegion, graphRegion, setGraphRegion,
      choropleth, setChoropleth, geoid, setGeoid, mapCenter, setMapCenter, mapZoom, setMapZoom,
      eiParam, setEiParam, MCMCParam, setMCMCParam, scatterParam, setScatterParam,
      boxPlotSampleData, setBoxPlotSampleData, MCMCEnactedPlan, setMCMCEnactedPlan,
      eiBarData, setEiBarData,
      tabIndex, setTabIndex, serverPath}}>
      <Homepage />
    </AppState.Provider>
  );
}

export default App;

export const useAppState = () => useContext(AppState);
