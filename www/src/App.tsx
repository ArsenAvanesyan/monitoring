import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KPICards } from './components/KPICards';
import { Charts } from './components/Charts';
import { DevicesTable } from './components/DevicesTable';
import { DeviceDetailDrawer } from './components/DeviceDetailDrawer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { mockDevices, mockKPIData, Device } from './utils/mockData';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'reboot' | 'changePools' | null>(null);
  const [actionDevice, setActionDevice] = useState<Device | null>(null);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    setIsDrawerOpen(true);
  };

  const handleReboot = (device: Device) => {
    setActionDevice(device);
    setConfirmAction('reboot');
  };

  const handleChangePools = (device: Device) => {
    setActionDevice(device);
    setConfirmAction('changePools');
  };

  const handleConfirmAction = () => {
    if (!actionDevice || !confirmAction) return;

    if (confirmAction === 'reboot') {
      toast.success(`Rebooting ${actionDevice.name}`, {
        description: 'Device will be back online in 2-3 minutes',
      });
    } else if (confirmAction === 'changePools') {
      toast.success(`Pool configuration updated`, {
        description: `${actionDevice.name} is reconnecting to the new pool`,
      });
    }

    setConfirmAction(null);
    setActionDevice(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Toaster />
      <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      {/* Main Content */}
      <main className="ml-64 pt-16">
        <div className="p-8 space-y-8">
          {/* KPI Cards */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Monitor your mining farm performance in real-time
              </p>
            </div>
            <KPICards data={mockKPIData} />
          </div>

          {/* Charts */}
          <Charts />

          {/* Devices Table */}
          <DevicesTable
            devices={mockDevices}
            onDeviceClick={handleDeviceClick}
            onReboot={handleReboot}
            onChangePools={handleChangePools}
          />
        </div>
      </main>

      {/* Device Detail Drawer */}
      <DeviceDetailDrawer
        device={selectedDevice}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDevice(null);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => {
          setConfirmAction(null);
          setActionDevice(null);
        }}
        onConfirm={handleConfirmAction}
        action={confirmAction}
        device={actionDevice}
      />
    </div>
  );
}
