import { useState } from 'react';
import { MoreVertical, ChevronDown, ChevronUp, Filter, Download, RefreshCw, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Device } from '../utils/mockData';
import { Card } from './ui/card';

interface DevicesTableProps {
  devices: Device[];
  onDeviceClick: (device: Device) => void;
  onReboot: (device: Device) => void;
  onChangePools: (device: Device) => void;
}

type SortKey = keyof Device | null;
type SortDirection = 'asc' | 'desc';

export function DevicesTable({ devices, onDeviceClick, onReboot, onChangePools }: DevicesTableProps) {
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedDevices.size === devices.length) {
      setSelectedDevices(new Set());
    } else {
      setSelectedDevices(new Set(devices.map(d => d.id)));
    }
  };

  const handleSelectDevice = (id: string) => {
    const newSelected = new Set(selectedDevices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDevices(newSelected);
  };

  let filteredDevices = devices;
  if (filterStatus) {
    filteredDevices = devices.filter(d => d.status === filterStatus);
  }

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

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

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Table Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg text-gray-900 dark:text-white">Devices</h3>
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
            {filteredDevices.length} total
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {filterStatus && <Badge variant="secondary" className="ml-1">1</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                All Devices
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterStatus('online')}>
                Online Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('degraded')}>
                Degraded Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('offline')}>
                Offline Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedDevices.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions ({selectedDevices.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Reboot Selected</DropdownMenuItem>
                <DropdownMenuItem>Change Pools</DropdownMenuItem>
                <DropdownMenuItem>Update Firmware</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                  Pause Mining
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="w-12 p-4">
                <Checkbox
                  checked={selectedDevices.size === devices.length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th
                className="cursor-pointer p-4 text-left text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Device / Model
                  <SortIcon column="name" />
                </div>
              </th>
              <th
                className="cursor-pointer p-4 text-left text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon column="status" />
                </div>
              </th>
              <th
                className="cursor-pointer p-4 text-left text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('hashrate')}
              >
                <div className="flex items-center gap-2">
                  Hashrate
                  <SortIcon column="hashrate" />
                </div>
              </th>
              <th
                className="cursor-pointer p-4 text-left text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('temperature')}
              >
                <div className="flex items-center gap-2">
                  Temperature
                  <SortIcon column="temperature" />
                </div>
              </th>
              <th className="p-4 text-left text-xs text-gray-500 dark:text-gray-400">
                Fan Speed
              </th>
              <th className="p-4 text-left text-xs text-gray-500 dark:text-gray-400">
                Pool
              </th>
              <th className="p-4 text-left text-xs text-gray-500 dark:text-gray-400">
                Worker
              </th>
              <th className="p-4 text-left text-xs text-gray-500 dark:text-gray-400">
                IP Address
              </th>
              <th className="p-4 text-left text-xs text-gray-500 dark:text-gray-400">
                Uptime
              </th>
              <th className="w-16 p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {sortedDevices.map((device) => (
              <tr
                key={device.id}
                onClick={() => onDeviceClick(device)}
                className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 ${
                  device.status === 'offline' ? 'opacity-60' : ''
                }`}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedDevices.has(device.id)}
                    onCheckedChange={() => handleSelectDevice(device.id)}
                  />
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">{device.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{device.model}</p>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className={`border ${getStatusColor(device.status)}`}>
                    {device.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {device.hashrate > 0 ? `${device.hashrate} ${device.hashrateUnit}` : '—'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {device.temperature > 0 ? `${device.temperature}°C` : '—'}
                    </span>
                    {device.temperature > 75 && (
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {device.fanSpeed > 0 ? `${device.fanSpeed.toLocaleString()} RPM` : '—'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{device.pool}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{device.worker}</span>
                </td>
                <td className="p-4">
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {device.ipAddress}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{device.uptime}</span>
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDeviceClick(device)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReboot(device)}>
                        Reboot Device
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onChangePools(device)}>
                        Change Pools
                      </DropdownMenuItem>
                      <DropdownMenuItem>Restart Miner</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Logs</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        Pause Mining
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {sortedDevices.length} of {devices.length} devices
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
