import { React } from 'react'
import { USMap } from './map-render';
import { StatePage } from './state-page';
import { useAppState } from "../App";
import { stateNameMap } from "../App"

export default function Homepage() {
    const { selectedState, setSelectedState, region, setRegion, setChoropleth, setGeoid } = useAppState();

    if (selectedState === "none") { // Resets choropleth on return to home
        setRegion("district");
        setChoropleth("none");
        setGeoid("state");
    }

    return (
        <div>
            { selectedState !== 'none' ? <button className="back-button" onClick={() => setSelectedState("none")}> Back </button> : null }
            <h1 className='centered-header' onClick={() => setSelectedState("none")}> 
                { selectedState === "none" ? "Cavaliers" : stateNameMap[selectedState] }
            </h1>
            {selectedState === "none" ? 
                <span>
                    <p className='centered-paragraph'> Visualize and interact with economic, electoral, and racial demographic information. </p> 
                    <p className='centered-paragraph'> Develop insights into how various factors shape voting patterns. </p>
                    <p className='centered-paragraph' style={{ fontSize: '24px', color: '#40513B'}}> Select a Shaded State</p>
                    <USMap />
                </span>
            : <StatePage />
            }
        </div>
    );
}