'use client';

import { getCategoryColor } from '../utils/crimeData';

export default function Legend() {
  const categories = [
    { name: 'Murder', shape: 'triangle', color: getCategoryColor('Murder') },
    { name: 'Shooting with Injuries', shape: 'diamond', color: getCategoryColor('Shooting with Injuries') },
    { name: 'Aggravated Assault', shape: 'square', color: getCategoryColor('Aggravated Assault') },
    { name: 'Robbery', shape: 'pentagon', color: getCategoryColor('Robbery') },
    { name: 'Arson', shape: 'star', color: getCategoryColor('Arson') },
    { name: 'Burglary', shape: 'house', color: getCategoryColor('Burglary') },
    { name: 'Simple Assault', shape: 'circle', color: getCategoryColor('Simple Assault') },
  ];

  const getShapePath = (shape) => {
    switch (shape) {
      case 'triangle':
        return 'M 12,4 L 4,18 L 20,18 Z';
      case 'diamond':
        return 'M 12,4 L 20,12 L 12,20 L 4,12 Z';
      case 'square':
        return 'M 6,6 L 18,6 L 18,18 L 6,18 Z';
      case 'pentagon':
        return 'M 12,4 L 19,9 L 17,18 L 7,18 L 5,9 Z';
      case 'star':
        return 'M 12,4 L 14,10 L 20,11 L 15,15 L 16,20 L 12,17 L 8,20 L 9,15 L 4,11 L 10,10 Z';
      case 'house':
        return 'M 12,5 L 5,12 L 5,19 L 10,19 L 10,14 L 14,14 L 14,19 L 19,19 L 19,12 Z';
      case 'circle':
      default:
        return 'M 12,5 A 7,7 0 1,1 12,19 A 7,7 0 1,1 12,5 Z';
    }
  };

  return (
    <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 z-10 max-w-xs">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Crime Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => {
          return (
            <div key={category.name} className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    d={getShapePath(category.shape)}
                    fill={category.color}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-700">{category.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}