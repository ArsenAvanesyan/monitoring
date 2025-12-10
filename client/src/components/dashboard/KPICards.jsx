import React from 'react';
import { useTranslation } from 'react-i18next';

const KPICards = ({ devices = [] }) => {
  const { t } = useTranslation();

  // Вычисляем KPI на основе реальных данных устройств
  const kpiDataToUse =
    devices.length > 0
      ? {
          totalHashrate: devices.reduce((sum, d) => sum + (d.hashrate || 0), 0) / 1000, // TH/s -> PH/s
          totalHashrateUnit: 'PH/s',
          devicesOnline: devices.filter((d) => d.status === 'online').length,
          devicesTotal: devices.length,
          avgTemperature:
            devices.length > 0
              ? Math.round(
                  devices.reduce((sum, d) => sum + (d.temperature || 0), 0) / devices.length
                )
              : 0,
          avgFanSpeed:
            devices.length > 0
              ? Math.round(devices.reduce((sum, d) => sum + (d.fanSpeed || 0), 0) / devices.length)
              : 0,
          uptime:
            devices.length > 0
              ? Math.round(
                  (devices.filter((d) => d.status === 'online').length / devices.length) * 100 * 100
                ) / 100
              : 0,
          activePools: new Set(devices.map((d) => d.pool).filter((p) => p && p !== 'N/A')).size,
        }
      : {
          totalHashrate: 0,
          totalHashrateUnit: 'PH/s',
          devicesOnline: 0,
          devicesTotal: 0,
          avgTemperature: 0,
          avgFanSpeed: 0,
          uptime: 0,
          activePools: 0,
        };

  const kpiCards = [
    {
      label: t('dashboard.totalHashrate'),
      value: `${kpiDataToUse.totalHashrate.toFixed(2)} ${kpiDataToUse.totalHashrateUnit}`,
      trend: 2.4,
      trendLabel: `+2.4% ${t('dashboard.fromLastHour')}`,
      sparkline: [2.35, 2.38, 2.41, 2.39, 2.43, 2.45],
    },
    {
      label: t('dashboard.devicesOnline'),
      value: `${kpiDataToUse.devicesOnline} / ${kpiDataToUse.devicesTotal}`,
      trend: -0.8,
      trendLabel: `${kpiDataToUse.devicesTotal - kpiDataToUse.devicesOnline} ${t('dashboard.devicesOffline')}`,
      sparkline: [120, 118, 119, 118, 119, 118],
    },
    {
      label: t('dashboard.averageTemperature'),
      value: `${kpiDataToUse.avgTemperature}°C`,
      trend: 1.2,
      trendLabel: `+1.2°C ${t('dashboard.fromOptimal')}`,
      sparkline: [70, 71, 72, 71, 72, 72],
    },
    {
      label: t('dashboard.averageFanSpeed'),
      value: `${kpiDataToUse.avgFanSpeed.toLocaleString()} RPM`,
      trend: 0.5,
      trendLabel: t('dashboard.withinNormalRange'),
      sparkline: [6800, 6820, 6850, 6830, 6840, 6850],
    },
    {
      label: t('dashboard.uptime'),
      value: `${kpiDataToUse.uptime}%`,
      trend: 0.02,
      trendLabel: `99.95% ${t('dashboard.last30Days')}`,
      sparkline: [99.94, 99.95, 99.96, 99.97, 99.97, 99.97],
    },
    {
      label: t('dashboard.activePools'),
      value: kpiDataToUse.activePools.toString(),
      trendLabel: `1 ${t('dashboard.failoverPool')}`,
      sparkline: [2, 2, 2, 2, 2, 2],
    },
  ];

  const renderSparkline = (data) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 100 / data.length;

    return (
      <div className="h-8 flex items-end gap-0.5 mt-2">
        {data.map((value, i) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={i}
              className="flex-1 bg-success rounded-sm"
              style={{ height: `${Math.max(height, 20)}%` }}
            />
          );
        })}
      </div>
    );
  };

  const renderTrendIcon = (trend) => {
    if (trend === undefined) return null;
    return (
      <div
        className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-success' : 'text-error'}`}
      >
        {trend > 0 ? '↑' : '↓'}
        {Math.abs(trend)}%
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {kpiCards.map((card, index) => (
        <div
          key={index}
          className="card bg-base-200 shadow-xl border border-secondary h-full flex flex-col"
        >
          <div className="card-body p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2 min-h-[2.5rem]">
              <p className="text-sm text-primary leading-tight">{card.label}</p>
              {card.trend !== undefined && renderTrendIcon(card.trend)}
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-primary mb-1">{card.value}</p>
              {card.trendLabel && (
                <p className="text-xs text-primary min-h-[1rem]">{card.trendLabel}</p>
              )}
            </div>
            <div className="mt-auto">{card.sparkline && renderSparkline(card.sparkline)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
