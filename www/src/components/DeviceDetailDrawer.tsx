import { X, Activity, Globe, FileText, Wrench, Cpu, Thermometer, Fan, Zap, Wifi, HardDrive } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Device, mockPools } from '../utils/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DeviceDetailDrawerProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceDetailDrawer({ device, isOpen, onClose }: DeviceDetailDrawerProps) {
  if (!isOpen || !device) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-900';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
      case 'offline':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-900';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const metricsData = [
    { time: '00:00', hashrate: 203, temp: 74 },
    { time: '04:00', hashrate: 205, temp: 75 },
    { time: '08:00', hashrate: 204, temp: 76 },
    { time: '12:00', hashrate: 206, temp: 75 },
    { time: '16:00', hashrate: 205, temp: 74 },
    { time: '20:00', hashrate: 205, temp: 75 },
    { time: '24:00', hashrate: 205, temp: 75 }
  ];

  const logs = [
    { time: '2024-11-22 14:35:12', severity: 'info', message: 'Mining pool connected successfully' },
    { time: '2024-11-22 14:30:05', severity: 'info', message: 'Device restarted' },
    { time: '2024-11-22 12:15:23', severity: 'warning', message: 'Temperature threshold exceeded: 78°C' },
    { time: '2024-11-22 10:45:11', severity: 'info', message: 'Share accepted by pool' },
    { time: '2024-11-22 08:22:34', severity: 'error', message: 'Connection timeout to pool' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-2xl overflow-y-auto bg-white shadow-2xl dark:bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-xl dark:bg-gray-950/80 dark:border-gray-800">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 dark:text-white">{device.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{device.model}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`border ${getStatusColor(device.status)}`}>
                {device.status}
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="pools">Pools</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Stats */}
              <Card className="p-6 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <h3 className="mb-4 text-sm text-gray-500 dark:text-gray-400">Performance Metrics</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Hashrate</p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {device.hashrate} {device.hashrateUnit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                      <Thermometer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
                      <p className="text-lg text-gray-900 dark:text-white">{device.temperature}°C</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {device.tempMin}°C - {device.tempMax}°C
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                      <Fan className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fan Speed</p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {device.fanSpeed.toLocaleString()} RPM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Power / Efficiency</p>
                      <p className="text-lg text-gray-900 dark:text-white">{device.power}W</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{device.efficiency} J/TH</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Network Info */}
              <div>
                <h3 className="mb-3 text-sm text-gray-500 dark:text-gray-400">Network Information</h3>
                <Card className="divide-y divide-gray-200 dark:divide-gray-800 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Wifi className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">IP Address</span>
                    </div>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{device.ipAddress}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Wifi className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">MAC Address</span>
                    </div>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{device.macAddress}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Cpu className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Firmware</span>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{device.firmware}</span>
                  </div>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Reboot Device</Button>
                <Button variant="outline" className="flex-1">Change Pools</Button>
              </div>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <h3 className="mb-4 text-sm text-gray-500 dark:text-gray-400">Hashrate (24h)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hashrate" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <h3 className="mb-4 text-sm text-gray-500 dark:text-gray-400">Temperature (24h)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Pools Tab */}
            <TabsContent value="pools" className="space-y-4">
              {mockPools.map((pool) => (
                <Card key={pool.id} className="p-5 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm text-gray-900 dark:text-white">{pool.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            Priority {pool.priority}
                          </Badge>
                          {pool.status === 'active' && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-900 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{pool.url}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </Card>
              ))}
              <Button variant="outline" className="w-full">Add Failover Pool</Button>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-2">
              {logs.map((log, index) => {
                const getSeverityColor = (severity: string) => {
                  switch (severity) {
                    case 'error':
                      return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400';
                    case 'warning':
                      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400';
                    default:
                      return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
                  }
                };

                return (
                  <Card key={index} className="p-4 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <div className="flex items-start gap-3">
                      <Badge className={`text-xs ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                        <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {log.time}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <h3 className="mb-4 text-sm text-gray-500 dark:text-gray-400">Maintenance History</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Last Reboot</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.uptime} ago</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Last Firmware Update</span>
                    <span className="text-sm text-gray-900 dark:text-white">15 days ago</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Total Errors (30d)</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.errors}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Last Updated</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.lastUpdate}</span>
                  </div>
                </div>
              </Card>

              <div>
                <h3 className="mb-3 text-sm text-gray-500 dark:text-gray-400">Maintenance Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="mr-2 h-4 w-4" />
                    Schedule Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Add Maintenance Note
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Cpu className="mr-2 h-4 w-4" />
                    Update Firmware
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
