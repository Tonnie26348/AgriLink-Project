
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Thermometer, Wind, Droplets, MapPin, Loader2, CloudLightning } from "lucide-react";

interface ForecastItem {
  day: string;
  temp: number;
  icon: React.ElementType;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  forecast: ForecastItem[];
}

interface WeatherWidgetProps {
  location?: string;
}

interface OpenWeatherListItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
  }>;
}

const API_KEY = ""; // User should provide an OpenWeatherMap API key

export const WeatherWidget = ({ location: propLocation = "Nakuru, Kenya" }: WeatherWidgetProps) => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        
        // If no API key, use simulated data but honor the location prop
        if (!API_KEY) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setWeather({
            temp: 24,
            condition: "Partly Cloudy",
            humidity: 65,
            windSpeed: 12,
            location: propLocation,
            forecast: [
              { day: "Tomorrow", temp: 26, icon: Sun },
              { day: "Wed", temp: 23, icon: CloudRain },
              { day: "Thu", temp: 25, icon: Cloud },
            ],
          });
          setLoading(false);
          return;
        }

        // Real API Call
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(propLocation)}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        if (response.ok) {
          // Get forecast too
          const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(propLocation)}&units=metric&cnt=24&appid=${API_KEY}`
          );
          const forecastData = await forecastRes.json();

          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const processedForecast = (forecastData.list as OpenWeatherListItem[])
            .filter((_, i) => i % 8 === 0)
            .slice(1, 4)
            .map((item) => {
              const date = new Date(item.dt * 1000);
              return {
                day: days[date.getDay()],
                temp: Math.round(item.main.temp),
                icon: item.weather[0].main.includes("Rain") ? CloudRain : 
                      item.weather[0].main.includes("Cloud") ? Cloud : Sun
              };
            });

          setWeather({
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
            location: data.name + ", " + data.sys.country,
            forecast: processedForecast,
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Weather fetch error:", error);
        // Fallback to simulation on error
        setWeather({
          temp: 24,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 12,
          location: propLocation,
          forecast: [
            { day: "Tomorrow", temp: 26, icon: Sun },
            { day: "Wed", temp: 23, icon: CloudRain },
            { day: "Thu", temp: 25, icon: Cloud },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [propLocation]);

  if (loading) {
    return (
      <Card className="shadow-soft border-border/50 h-full flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Fetching Forecast...</p>
        </div>
      </Card>
    );
  }

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("rain")) return CloudRain;
    if (c.includes("cloud")) return Cloud;
    if (c.includes("storm") || c.includes("lightning")) return CloudLightning;
    return Sun;
  };

  const WeatherIcon = getWeatherIcon(weather?.condition || "");

  return (
    <Card className="shadow-soft border-border/50 h-full overflow-hidden bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {weather?.location}
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full">
            Today
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-soft">
              <WeatherIcon className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tighter">{weather?.temp}°C</p>
              <p className="text-sm text-muted-foreground font-medium">{weather?.condition}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/40 dark:bg-black/10 border border-white/50 dark:border-white/5">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1">Humidity</p>
              <p className="text-sm font-bold leading-none">{weather?.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/40 dark:bg-black/10 border border-white/50 dark:border-white/5">
            <Wind className="w-4 h-4 text-teal-500" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1">Wind</p>
              <p className="text-sm font-bold leading-none">{weather?.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">3-Day Forecast</p>
          <div className="space-y-2">
            {weather?.forecast.map((day, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                <span className="text-sm font-medium">{day.day}</span>
                <div className="flex items-center gap-3">
                  <day.icon className="w-4 h-4 text-primary/70" />
                  <span className="text-sm font-bold w-8 text-right">{day.temp}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
