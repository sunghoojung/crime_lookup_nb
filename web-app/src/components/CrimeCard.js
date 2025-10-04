'use client';

import { MapPin, Calendar, Clock, AlertTriangle, Flame, Users, Target, Home, Shield, Activity } from 'lucide-react';
import { getCategoryColor } from '../utils/crimeData';

export default function CrimeCard({ crime, isSelected, onClick }) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Murder':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'Shooting with Injuries':
        return <Target className="w-3.5 h-3.5" />;
      case 'Aggravated Assault':
        return <Users className="w-3.5 h-3.5" />;
      case 'Robbery':
        return <Shield className="w-3.5 h-3.5" />;
      case 'Arson':
        return <Flame className="w-3.5 h-3.5" />;
      case 'Burglary':
        return <Home className="w-3.5 h-3.5" />;
      case 'Simple Assault':
        return <Activity className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryStyles = (category) => {
    const color = getCategoryColor(category);
    // Create a lighter background version
    switch (category) {
      case 'Murder':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Shooting with Injuries':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Aggravated Assault':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Robbery':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Arson':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Burglary':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Simple Assault':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
      {/* Header with Category Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm leading-5 flex-1 mr-2">
          {crime.displayType}
        </h3>
        <span
          className={`
            inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium border
            ${getCategoryStyles(crime.category)}
          `}
        >
          {getCategoryIcon(crime.category)}
          <span className="truncate max-w-[100px]">{crime.category}</span>
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