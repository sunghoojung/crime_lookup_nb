'use client';

import { MapPin, Calendar, Clock, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function CrimeCard({ crime, isSelected, onClick }) {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'MEDIUM':
        return <AlertCircle className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 border
        ${isSelected
          ? 'border-blue-400 shadow-lg shadow-blue-100 ring-2 ring-blue-400 ring-opacity-30'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
      onClick={onClick}
    >
      {/* Header with Severity Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm leading-5 flex-1 mr-2">
          {crime.displayType}
        </h3>
        <span
          className={`
            inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium border
            ${getSeverityStyles(crime.severity)}
          `}
        >
          {getSeverityIcon(crime.severity)}
          <span>{crime.severity}</span>
        </span>
      </div>

      {/* Location */}
      <div className="flex items-start space-x-2 text-gray-600 mb-2">
        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
        <span className="text-xs leading-4">{crime.location}</span>
      </div>

      {/* Date and Time */}
      <div className="flex items-center space-x-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{crime.formattedDate}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>{crime.formattedTime}</span>
        </div>
      </div>

      {/* Case ID */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="font-mono text-xs text-gray-400">
          #{crime.record_id}
        </span>
      </div>
    </div>
  );
}