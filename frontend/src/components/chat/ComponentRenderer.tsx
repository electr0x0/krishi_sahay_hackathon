'use client';

import React from 'react';
import { motion } from 'framer-motion';
import WeatherForecastCard from './components/WeatherForecastCard';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import DiseaseDetectionCard from './components/DiseaseDetectionCard';
import MarketPriceTable from './components/MarketPriceTable';
import SensorDataWidget from './components/SensorDataWidget';
import SensorAlertsCard from './components/SensorAlertsCard';
import CropCalendarCard from './components/CropCalendarCard';
import FertilizerRecommendationCard from './components/FertilizerRecommendationCard';
import DetectionInsightsCard from './components/DetectionInsightsCard';

interface ComponentData {
  type: string;
  data: any;
  actions?: Array<{
    label: string;
    action: string;
    icon: string;
  }>;
}

interface ComponentRendererProps {
  components: ComponentData[];
  onAction?: (action: string, componentType: string, data: any) => void;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ components, onAction }) => {
  if (!components || components.length === 0) {
    return null;
  }

  const handleAction = (action: string, componentType: string, data: any) => {
    if (onAction) {
      onAction(action, componentType, data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 space-y-3"
    >
      {components.map((component, index) => {
        const key = `${component.type}-${index}`;

        switch (component.type) {
          case 'weather_forecast':
            return (
              <WeatherForecastCard
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          case 'current_weather':
            return (
              <CurrentWeatherCard
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          case 'disease_detection':
            return (
              <DiseaseDetectionCard
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          case 'market_price':
            return (
              <MarketPriceTable
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          case 'sensor_data':
            return (
              <SensorDataWidget
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          case 'sensor_alerts':
            return (
              <SensorAlertsCard
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          case 'crop_calendar':
            return (
              <CropCalendarCard
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          case 'fertilizer_recommendation':
            return (
              <FertilizerRecommendationCard
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          case 'detection_insights':
            return (
              <DetectionInsightsCard
                key={key}
                data={component.data}
                actions={component.actions}
                onAction={(action: string) => handleAction(action, component.type, component.data)}
              />
            );

          default:
            console.warn(`Unknown component type: ${component.type}`);
            return null;
        }
      })}
    </motion.div>
  );
};

export default ComponentRenderer;
