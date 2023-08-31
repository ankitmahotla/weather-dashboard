import axios from "axios";
import { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [initialLocationObtained, setInitialLocationObtained] = useState(false);
  const apiKey = import.meta.env.VITE_API_KEY;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

  const searchLocation = () => {
    if (location !== "") {
      axios.get(weatherUrl).then((response) => {
        setData(response.data);
      });
      setLocation("");
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator && !initialLocationObtained) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const city = await getCityFromCoordinates(latitude, longitude);
          setLocation(city);
          setInitialLocationObtained(true);
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    } else if (initialLocationObtained) {
      searchLocation();
    } else {
      console.log("Geolocation is not available in this browser.");
    }
  }, [initialLocationObtained]);

  const getCityFromCoordinates = async (latitude, longitude) => {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5&appid=${apiKey}`
    );
    const data = await response.json();
    const city = data[0]?.name || "";
    return city;
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              searchLocation();
            }
          }}
          placeholder="Enter Location"
          type="text"
        />
      </div>
      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed() - 273}°C</h1> : null}
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        {data.name !== undefined && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">{data.main.feels_like.toFixed() - 273}°C</p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? (
                <p className="bold">{data.wind.speed.toFixed()} MPH</p>
              ) : null}
              <p>Wind Speed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
