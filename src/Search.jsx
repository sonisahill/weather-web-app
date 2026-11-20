import { useEffect, useRef, useState } from "react";

const WORLD_CLOCKS = [
  { city: "New York", timeZone: "America/New_York" },
  { city: "India", timeZone: "Asia/Kolkata" },
  { city: "Paris", timeZone: "Europe/Paris" },
];

const formatTime = (date, timeZone) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

export default function Search() {
  const sceneRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 30000);

    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!scene || reduceMotion.matches) {
      return undefined;
    }

    const updatePointer = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      scene.style.setProperty("--pointer-x", `${x * 10}px`);
      scene.style.setProperty("--pointer-y", `${y * 7}px`);
    };

    const updateScroll = () => {
      scene.style.setProperty(
        "--scroll-y",
        `${Math.min(window.scrollY, 120) * -0.08}px`,
      );
    };

    window.addEventListener("pointermove", updatePointer);
    window.addEventListener("scroll", updateScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  const GEO_API_URL = "https://api.openweathermap.org/geo/1.0/direct";
  const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

  const getWeatherInfo = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setError("Weather API key is missing. Add it to .env.local.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `${GEO_API_URL}?q=${city}&limit=1&appid=${apiKey}`,
      );

      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        throw new Error("City not found.");
      }

      const { lat, lon, name, country } = geoData[0];

      const weatherResponse = await fetch(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      );

      const weatherData = await weatherResponse.json();

      if (weatherData.cod && weatherData.cod !== 200) {
        throw new Error(weatherData.message || "Weather data not available.");
      }

      setWeather({
        name,
        country,
        temperature: weatherData.main?.temp,
        feelsLike: weatherData.main?.feels_like,
        humidity: weatherData.main?.humidity,
        wind: weatherData.wind?.speed,
        pressure: weatherData.main?.pressure,
        visibility: weatherData.visibility
          ? (weatherData.visibility / 1000).toFixed(1)
          : null,
        description: weatherData.weather?.[0]?.description,
        icon: weatherData.weather?.[0]?.icon,
      });
    } catch (err) {
      setError(err.message || "Something went wrong while fetching weather.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setCity(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    getWeatherInfo();
  };

  const isLightRain = weather?.description
    ?.toLowerCase()
    .includes("light rain");
  const cityName = weather?.name?.trim().toLowerCase();
  const cityImageClass =
    cityName === "bhopal"
      ? " weather-scene--bhopal"
      : cityName === "indore"
        ? " weather-scene--indore"
        : cityName === "narmadapuram"
          ? " weather-scene--narmadapuram"
          : cityName === "bengaluru"
            ? " weather-scene--bengaluru"
            : cityName === "hyderabad"
              ? " weather-scene--hyderabad"
              : cityName === "delhi" || cityName === "new delhi"
                ? " weather-scene--delhi"
                : "";

  return (
    <main ref={sceneRef} className={`weather-scene${cityImageClass}`}>
      <div className="scene-wash" />
      <header className="time-strip" aria-label="World clock">
        {WORLD_CLOCKS.map(({ city: clockCity, timeZone }) => (
          <div className="time-zone-group" key={timeZone}>
            <span>
              {formatTime(currentTime, timeZone)} <small>{clockCity}</small>
            </span>
            {clockCity === "India" && (
              <div className="weather-brand" aria-label="Wea मौसम">
                <span>Wea</span>
                <small>मौसम</small>
              </div>
            )}
          </div>
        ))}
      </header>
      <section
        className={`weather-content${weather ? " weather-dashboard" : ""}`}
      >
        {weather && (
          <div className="weather-dashboard-grid">
            <aside
              className="weather-measurements"
              aria-label="Weather measurements"
            >
              <p className="measurements-label">At a glance</p>
              <dl>
                <div>
                  <dt>Feels like</dt>
                  <dd>{Math.round(weather.feelsLike)}°</dd>
                </div>
                <div>
                  <dt>Humidity</dt>
                  <dd>{weather.humidity}%</dd>
                </div>
                <div>
                  <dt>Wind</dt>
                  <dd>{weather.wind} m/s</dd>
                </div>
                <div>
                  <dt>Pressure</dt>
                  <dd>{weather.pressure} hPa</dd>
                </div>
                <div>
                  <dt>Visibility</dt>
                  <dd>{weather.visibility} km</dd>
                </div>
              </dl>
            </aside>
            <div
              className={`city-lockup${isLightRain ? " light-rain-report" : ""}`}
            >
              <p className="eyebrow">Weather report</p>
              <h1>{`${weather.name}, ${weather.country}`}</h1>
              <p className="weather-headline">{weather.description}</p>
              <div className="weather-reading">
                {weather.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt=""
                  />
                )}
                <strong>{Math.round(weather.temperature)}°</strong>
                <span>{weather.description}</span>
              </div>
            </div>
            <div
              className="weather-data-strip"
              aria-label="Current weather summary"
            >
              <span>
                <strong>{Math.round(weather.temperature)}°</strong> Now
              </span>
              <span>
                <strong>{weather.humidity}%</strong> Humidity
              </span>
              <span>
                <strong>{weather.wind} m/s</strong> Wind
              </span>
              <span>
                <strong>{weather.visibility} km</strong> Visibility
              </span>
            </div>
          </div>
        )}
      </section>
      <form className="search-dock" onSubmit={handleSubmit}>
        <label htmlFor="city">Explore another city</label>
        <div className="search-row">
          <input
            id="city"
            type="search"
            placeholder="Search city"
            value={city}
            onChange={handleChange}
          />
          <button type="submit" aria-label="Search city">
            ↗
          </button>
        </div>
        {loading && <span className="search-status">Reading the sky...</span>}
        {error && <span className="search-status error">{error}</span>}
      </form>
    </main>
  );
}
