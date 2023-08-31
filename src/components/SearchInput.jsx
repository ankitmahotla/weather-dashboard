import { ProgressBar } from "react-bootstrap";

export default function SearchInput({
  location,
  setLocation,
  searchLocation,
  apiCounter,
  MAX_API_LIMIT,
}) {
  return (
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
          apiCounter >= MAX_API_LIMIT ? "API Limit Exceeded" : "Enter Location"
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
  );
}
