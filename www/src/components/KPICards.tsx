import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './ui/card';
import { KPIData } from '../utils/mockData';

interface KPICardsProps {
  data: KPIData;
}

interface KPICardData {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  sparkline?: number[];
}

export function KPICards({ data }: KPICardsProps) {
  const cards: KPICardData[] = [
    {
      label: 'Total Hashrate',
      value: `${data.totalHashrate} ${data.totalHashrateUnit}`,
      trend: 2.4,
      trendLabel: '+2.4% from last hour',
      sparkline: [2.35, 2.38, 2.41, 2.39, 2.43, 2.45]
    },
    {
      label: 'Devices Online',
      value: `${data.devicesOnline} / ${data.devicesTotal}`,
      trend: -0.8,
      trendLabel: '12 devices offline',
      sparkline: [120, 118, 119, 118, 119, 118]
    },
    {
      label: 'Average Temperature',
      value: `${data.avgTemperature}°C`,
      trend: 1.2,
      trendLabel: '+1.2°C from optimal',
      sparkline: [70, 71, 72, 71, 72, 72]
    },
    {
      label: 'Average Fan Speed',
      value: `${data.avgFanSpeed.toLocaleString()} RPM`,
      trend: 0.5,
      trendLabel: 'Within normal range',
      sparkline: [6800, 6820, 6850, 6830, 6840, 6850]
    },
    {
      label: 'Uptime',
      value: `${data.uptime}%`,
      trend: 0.02,
      trendLabel: '99.95% last 30 days',
      sparkline: [99.94, 99.95, 99.96, 99.97, 99.97, 99.97]
    },
    {
      label: 'Active Pools',
      value: data.activePools.toString(),
      trendLabel: '1 failover pool',
      sparkline: [2, 2, 2, 2, 2, 2]
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <Card key={index} className="p-5 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              {card.trend !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs ${
                  card.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {card.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(card.trend)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-2xl tracking-tight text-gray-900 dark:text-white">{card.value}</p>
              {card.trendLabel && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{card.trendLabel}</p>
              )}
            </div>
            {card.sparkline && (
              <div className="h-8 flex items-end gap-0.5">
                {card.sparkline.map((value, i) => {
                  const max = Math.max(...card.sparkline!);
                  const min = Math.min(...card.sparkline!);
                  const range = max - min || 1;
                  const height = ((value - min) / range) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-blue-200 dark:bg-blue-900 rounded-sm"
                      style={{ height: `${Math.max(height, 20)}%` }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
