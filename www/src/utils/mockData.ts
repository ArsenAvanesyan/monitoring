export interface Device {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'degraded' | 'offline';
  hashrate: number;
  hashrateUnit: string;
  temperature: number;
  tempMin: number;
  tempMax: number;
  fanSpeed: number;
  pool: string;
  worker: string;
  ipAddress: string;
  uptime: string;
  errors: number;
  power: number;
  efficiency: number;
  firmware: string;
  macAddress: string;
  lastUpdate: string;
}

export interface Pool {
  id: string;
  name: string;
  url: string;
  priority: number;
  status: 'active' | 'failover';
}

export interface KPIData {
  totalHashrate: number;
  totalHashrateUnit: string;
  devicesOnline: number;
  devicesTotal: number;
  avgTemperature: number;
  avgFanSpeed: number;
  uptime: number;
  activePools: number;
}

export const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Antminer T21',
    model: 'Antminer T21',
    status: 'online',
    hashrate: 205,
    hashrateUnit: 'TH/s',
    temperature: 75,
    tempMin: 68,
    tempMax: 78,
    fanSpeed: 7000,
    pool: 'PoolA',
    worker: 'farm-01',
    ipAddress: '10.0.1.45',
    uptime: '5d 14h',
    errors: 0,
    power: 3610,
    efficiency: 17.6,
    firmware: 'v2.1.3',
    macAddress: '00:1A:2B:3C:4D:5E',
    lastUpdate: '2 mins ago'
  },
  {
    id: '2',
    name: 'Antminer S19j Pro',
    model: 'Antminer S19j Pro',
    status: 'degraded',
    hashrate: 104,
    hashrateUnit: 'TH/s',
    temperature: 69,
    tempMin: 65,
    tempMax: 72,
    fanSpeed: 6400,
    pool: 'PoolB',
    worker: 'farm-02',
    ipAddress: '10.0.1.68',
    uptime: '2d 3h',
    errors: 3,
    power: 3050,
    efficiency: 29.3,
    firmware: 'v1.9.8',
    macAddress: '00:1A:2B:3C:4D:5F',
    lastUpdate: '1 min ago'
  },
  {
    id: '3',
    name: 'Antminer S19 XP',
    model: 'Antminer S19 XP',
    status: 'online',
    hashrate: 140,
    hashrateUnit: 'TH/s',
    temperature: 71,
    tempMin: 67,
    tempMax: 74,
    fanSpeed: 6800,
    pool: 'PoolA',
    worker: 'farm-03',
    ipAddress: '10.0.1.72',
    uptime: '12d 7h',
    errors: 0,
    power: 3010,
    efficiency: 21.5,
    firmware: 'v2.0.5',
    macAddress: '00:1A:2B:3C:4D:60',
    lastUpdate: '3 mins ago'
  },
  {
    id: '4',
    name: 'Whatsminer M50S',
    model: 'Whatsminer M50S',
    status: 'online',
    hashrate: 126,
    hashrateUnit: 'TH/s',
    temperature: 68,
    tempMin: 64,
    tempMax: 71,
    fanSpeed: 6200,
    pool: 'PoolA',
    worker: 'farm-04',
    ipAddress: '10.0.1.89',
    uptime: '8d 22h',
    errors: 1,
    power: 3276,
    efficiency: 26.0,
    firmware: 'v3.2.1',
    macAddress: '00:1A:2B:3C:4D:61',
    lastUpdate: '1 min ago'
  },
  {
    id: '5',
    name: 'Antminer T21',
    model: 'Antminer T21',
    status: 'offline',
    hashrate: 0,
    hashrateUnit: 'TH/s',
    temperature: 0,
    tempMin: 0,
    tempMax: 0,
    fanSpeed: 0,
    pool: 'PoolA',
    worker: 'farm-05',
    ipAddress: '10.0.1.92',
    uptime: '0h',
    errors: 15,
    power: 0,
    efficiency: 0,
    firmware: 'v2.1.2',
    macAddress: '00:1A:2B:3C:4D:62',
    lastUpdate: '45 mins ago'
  },
  {
    id: '6',
    name: 'Antminer S19j Pro',
    model: 'Antminer S19j Pro',
    status: 'online',
    hashrate: 100,
    hashrateUnit: 'TH/s',
    temperature: 70,
    tempMin: 66,
    tempMax: 73,
    fanSpeed: 6500,
    pool: 'PoolB',
    worker: 'farm-06',
    ipAddress: '10.0.1.103',
    uptime: '6d 18h',
    errors: 0,
    power: 3050,
    efficiency: 30.5,
    firmware: 'v2.0.1',
    macAddress: '00:1A:2B:3C:4D:63',
    lastUpdate: '2 mins ago'
  },
  {
    id: '7',
    name: 'Antminer S19 XP',
    model: 'Antminer S19 XP',
    status: 'online',
    hashrate: 141,
    hashrateUnit: 'TH/s',
    temperature: 72,
    tempMin: 68,
    tempMax: 75,
    fanSpeed: 6900,
    pool: 'PoolA',
    worker: 'farm-07',
    ipAddress: '10.0.1.115',
    uptime: '15d 4h',
    errors: 0,
    power: 3020,
    efficiency: 21.4,
    firmware: 'v2.0.5',
    macAddress: '00:1A:2B:3C:4D:64',
    lastUpdate: '1 min ago'
  },
  {
    id: '8',
    name: 'Whatsminer M50S',
    model: 'Whatsminer M50S',
    status: 'degraded',
    hashrate: 118,
    hashrateUnit: 'TH/s',
    temperature: 76,
    tempMin: 70,
    tempMax: 79,
    fanSpeed: 7200,
    pool: 'PoolB',
    worker: 'farm-08',
    ipAddress: '10.0.1.128',
    uptime: '3d 11h',
    errors: 5,
    power: 3300,
    efficiency: 28.0,
    firmware: 'v3.1.9',
    macAddress: '00:1A:2B:3C:4D:65',
    lastUpdate: '4 mins ago'
  }
];

export const mockPools: Pool[] = [
  {
    id: '1',
    name: 'PoolA',
    url: 'stratum+tcp://pool-a.example.com:3333',
    priority: 1,
    status: 'active'
  },
  {
    id: '2',
    name: 'PoolB',
    url: 'stratum+tcp://pool-b.example.com:4444',
    priority: 2,
    status: 'active'
  },
  {
    id: '3',
    name: 'PoolC',
    url: 'stratum+tcp://pool-c.example.com:5555',
    priority: 3,
    status: 'failover'
  }
];

export const mockKPIData: KPIData = {
  totalHashrate: 2.45,
  totalHashrateUnit: 'PH/s',
  devicesOnline: 118,
  devicesTotal: 130,
  avgTemperature: 72,
  avgFanSpeed: 6850,
  uptime: 99.97,
  activePools: 2
};

export const hashrateHistory = [
  { time: '00:00', value: 2.38 },
  { time: '02:00', value: 2.41 },
  { time: '04:00', value: 2.35 },
  { time: '06:00', value: 2.43 },
  { time: '08:00', value: 2.39 },
  { time: '10:00', value: 2.47 },
  { time: '12:00', value: 2.44 },
  { time: '14:00', value: 2.42 },
  { time: '16:00', value: 2.48 },
  { time: '18:00', value: 2.45 },
  { time: '20:00', value: 2.46 },
  { time: '22:00', value: 2.45 },
  { time: '24:00', value: 2.45 }
];

export const temperatureDistribution = [
  { name: '<60°C', value: 5 },
  { name: '60-65°C', value: 18 },
  { name: '65-70°C', value: 42 },
  { name: '70-75°C', value: 38 },
  { name: '75-80°C', value: 15 },
  { name: '>80°C', value: 0 }
];
