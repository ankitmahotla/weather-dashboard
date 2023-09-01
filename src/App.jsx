import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { useState, useEffect } from "react";

import Weather from "./components/Weather";
import SearchInput from "./components/SearchInput";
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
          localStorage.setItem("apiCounter", updatedCounter);
          localStorage.setItem("weatherData", JSON.stringify(response.data));
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            toast.error("Location not found", {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        });

      setLocation("");
    }
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem("initialLocation");
    if (storedLocation) {
      setLocation(storedLocation);
      setInitialLocationObtained(true);
      const storedWeatherData = localStorage.getItem("weatherData");
      if (storedWeatherData) {
        setData(JSON.parse(storedWeatherData));
      }
      setLocation("");
    } else {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const city = await getCityFromCoordinates(latitude, longitude);
            setLocation(city);
            localStorage.setItem("initialLocation", city);
            setInitialLocationObtained(true);
            searchLocation(); // Fetch weather data after obtaining initial location
          },
          (error) => {
            console.error("Error getting location:", error.message);
          }
        );
      } else {
        console.log("Geolocation is not available in this browser.");
      }
    }
  }, []);

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
      <SearchInput
        location={location}
        setLocation={setLocation}
        searchLocation={searchLocation}
        apiCounter={apiCounter}
        MAX_API_LIMIT={MAX_API_LIMIT}
      />
      <ToastContainer />
      {apiCounter >= MAX_API_LIMIT && (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 100 }}
        >
          API Limit Exceeded. Upgrade for more.
        </div>
      )}
      <Weather data={data} />
    </div>
  );
}

export default App;
