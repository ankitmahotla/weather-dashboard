import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
const MAX_API_LIMIT = 30;

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [initialLocationObtained, setInitialLocationObtained] = useState(false);
  const initialApiCounter =
    parseInt(localStorage.getItem("apiCounter"), 10) || 0;
  const [apiCounter, setApiCounter] = useState(initialApiCounter);

  const apiKey = import.meta.env.VITE_API_KEY;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

  const searchLocation = () => {
    if (location !== "") {
      if (apiCounter >= MAX_API_LIMIT) {
        toast.error("API Limit exceeded", {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }

      axios
        .get(weatherUrl)
        .then((response) => {
          setData(response.data);
          const updatedCounter = apiCounter + 1;
          setApiCounter(updatedCounter);
          localStorage.setItem("apiCounter", updatedCounter); // Update local storage
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            toast.error("City not found", {
              position: toast.POSITION.TOP_CENTER,
            });
          }
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
          placeholder={
            apiCounter >= MAX_API_LIMIT
              ? "API Limit Exceeded"
              : "Enter Location"
          }
          type="text"
          disabled={apiCounter >= MAX_API_LIMIT}
        />
        {/* <button onClick={searchLocation} disabled={apiCounter >= MAX_API_LIMIT}>
          Search
        </button> */}
        <ProgressBar
          variant="info"
          now={(apiCounter / MAX_API_LIMIT) * 100}
          label={`${apiCounter}/${MAX_API_LIMIT} Searches`}
        />
      </div>
      <ToastContainer />
      <div className="container ">
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
