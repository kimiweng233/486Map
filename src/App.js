import { useState, useEffect, React } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import chroma from "chroma-js";
import "leaflet-boundary-canvas";
import "leaflet/dist/leaflet.css";
import "./App.css";

import zipcodeData from "./out.json";
import scores from "./scores.csv";

const CHROMA_SCALE = chroma.scale(["green", "yellow", "red"]);

function isAllDigits(str) {
  return str == "" || !isNaN(str);
}

function App() {
  const [map, setMap] = useState(null);
  const [riskScore, setRiskScore] = useState("N/A");
  const [zipcodeInput, setZipCodeInput] = useState("");
  const [riskScores, setRiskScores] = useState({});

  const bounds = [
    [24.396308, -125.0],
    [49.384358, -66.93457],
  ];

  const setColor = (properties) => {
    return {
      weight: 0.1,
      fillColor: CHROMA_SCALE((properties["Score"] - 1) / 2),
      fillOpacity: 1,
    };
  };

  const handleInputChange = (e) => {
    if (isAllDigits(e.target.value) && e.target.value.length < 6) {
      setZipCodeInput(e.target.value);
      setRiskScore(
        e.target.value in riskScores ? riskScores[e.target.value] : "N/A"
      );
    }
  };

  useEffect(() => {
    fetch(scores)
      .then((response) => {
        return response.text();
      })
      .then((lines) => {
        let dict = {};
        lines = lines.trim().split("\n");
        lines.forEach((line) => {
          const [zipcode, score] = line.split(",");
          dict[zipcode] = score;
        });
        setRiskScores(dict);
      });
  }, []);

  useEffect(() => {
    if (map) {
      map.fitBounds(bounds);
    }
  }, [map]);

  return (
    <div>
      <MapContainer
        center={[37.5004851, -96.2261503]}
        zoomSnap={0.35}
        minZoom={5}
        style={{ height: "100vh" }}
        maxBounds={bounds}
        zoomControl={false}
        ref={setMap}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {zipcodeData &&
          Object.entries(zipcodeData).map(([zipcode, data]) => (
            <GeoJSON
              key={zipcode}
              data={data}
              style={setColor(data["features"][0]["properties"])}
            />
          ))}
      </MapContainer>
      <div className="container">
        <p>zip code:</p>
        <input
          className="inputBox"
          value={zipcodeInput}
          onChange={handleInputChange}
        />
        <p>score: {riskScore}</p>
      </div>
      <div className="infoContainer">
        <p>*Risk level goes from 1</p>
        <div className="greenBox" />
        <p>to 3</p>
        <div className="redBox" />
      </div>
    </div>
  );
}

export default App;
