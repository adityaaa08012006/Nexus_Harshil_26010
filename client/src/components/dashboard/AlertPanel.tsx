import React from 'react';

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: string;
}

interface AlertPanelProps {
  alerts: Alert[];
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No active alerts</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 p-4 rounded-r-md ${getAlertStyles(alert.type)} min-h-[44px]`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs mt-1 opacity-75">{alert.timestamp}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
