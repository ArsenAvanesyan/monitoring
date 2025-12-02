import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Device } from '../utils/mockData';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'reboot' | 'changePools' | null;
  device: Device | null;
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, action, device }: ConfirmationModalProps) {
  if (!action || !device) return null;

  const getActionDetails = () => {
    switch (action) {
      case 'reboot':
        return {
          title: 'Reboot Device',
          description: `Are you sure you want to reboot ${device.name}? This will temporarily interrupt mining operations.`,
          warning: 'Mining will stop for approximately 2-3 minutes during the reboot process.',
          confirmLabel: 'Reboot Device',
          isDangerous: true
        };
      case 'changePools':
        return {
          title: 'Change Mining Pools',
          description: `Configure pool settings for ${device.name}.`,
          warning: 'Changing pools will briefly interrupt mining while the device reconnects.',
          confirmLabel: 'Update Pools',
          isDangerous: false
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure you want to proceed?',
          warning: null,
          confirmLabel: 'Confirm',
          isDangerous: false
        };
    }
  };

  const details = getActionDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              details.isDangerous 
                ? 'bg-red-100 dark:bg-red-950' 
                : 'bg-blue-100 dark:bg-blue-950'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                details.isDangerous 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-blue-600 dark:text-blue-400'
              }`} />
            </div>
            <DialogTitle>{details.title}</DialogTitle>
          </div>
          <DialogDescription className="space-y-3">
            <p>{details.description}</p>
            {details.warning && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  <span className="font-semibold">Warning:</span> {details.warning}
                </p>
              </div>
            )}
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Device:</span>
                <span className="text-gray-900 dark:text-white">{device.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">IP Address:</span>
                <span className="font-mono text-gray-900 dark:text-white">{device.ipAddress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Worker:</span>
                <span className="text-gray-900 dark:text-white">{device.worker}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={details.isDangerous 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700'
            }
          >
            {details.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
