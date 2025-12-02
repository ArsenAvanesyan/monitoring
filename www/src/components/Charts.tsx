import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, Calendar } from 'lucide-react';
import { hashrateHistory, temperatureDistribution } from '../utils/mockData';

export function Charts() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Hashrate Over Time */}
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-gray-900 dark:text-white">Hashrate Over Time</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time mining performance</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 p-0.5">
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  timeRange === '24h'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  timeRange === '7d'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                7d
              </button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleRefresh}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hashrateHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={{ value: 'PH/s', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9ca3af' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#111827' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Temperature Distribution */}
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-gray-900 dark:text-white">Temperature Distribution</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Device temperature ranges</p>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={temperatureDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={{ value: 'Devices', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9ca3af' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#111827' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {temperatureDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
