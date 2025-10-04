'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Send, MapPin, Calendar, Clock, Tag, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmitCrime() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submittedCrime, setSubmittedCrime] = useState(null);

  const [formData, setFormData] = useState({
    type: '',
    location: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    category: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  const categories = [
    'Murder',
    'Shooting with Injuries',
    'Aggravated Assault',
    'Robbery',
    'Arson',
    'Burglary',
    'Simple Assault'
  ];

  // Common crime types for each category
  const crimeTypesByCategory = {
    'Murder': ['Murder Purposely', 'Murder Knowingly'],
    'Shooting with Injuries': ['Shooting With Injuries', 'Shooting With Fatal Injuries'],
    'Aggravated Assault': ['Aggravated Assault', 'Aggravated Assault With Weapon', 'Aggravated Assault Recklessly Cause Injury With Weapon'],
    'Robbery': ['Robbery By Force', 'Robbery By Injury Threat', 'Armed Robbery'],
    'Arson': ['Arsonbldgstruct', 'Arson Motor Vehicle', 'Arson Personal Property'],
    'Burglary': ['Burglary By Entering Structure', 'Burglary By Entering Motor Vehicle', 'Burglary By Entering Residence'],
    'Simple Assault': ['Simple Assault Bodily Injury', 'Simple Assault', 'Simple Assault Threat']
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.type.trim()) {
      errors.type = 'Crime type is required';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.time) {
      errors.time = 'Time is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // If category changes, clear type if it doesn't match
    if (name === 'category' && value) {
      const suggestedTypes = crimeTypesByCategory[value] || [];
      if (!suggestedTypes.includes(formData.type)) {
        setFormData(prev => ({
          ...prev,
          type: suggestedTypes[0] || ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Format date and time to match file.json format (MM/DD/YYYY HH:mm)
      const formattedDate = format(new Date(formData.date), 'MM/dd/yyyy');
      const formattedTime = `${formattedDate} ${formData.time}`;

      const response = await fetch('/api/crimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          location: formData.location,
          time: formattedTime,
          category: formData.category
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit crime report');
      }

      setSuccess(true);
      setSubmittedCrime(data.crime);

      // Reset form
      setFormData({
        type: '',
        location: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        category: ''
      });

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        router.push('/');
      }, 5000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      type: '',
      location: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      category: ''
    });
    setValidationErrors({});
    setError(null);
    setSuccess(false);
    setSubmittedCrime(null);
  };

  return (
    <div className="bg-gray-50 min-h-full py-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-8">
            <h1 className="text-2xl font-bold mb-2">Submit Crime Report</h1>
            <p className="text-slate-300 text-sm">
              Help keep the community informed by reporting crime incidents in New Brunswick, NJ
            </p>
          </div>

          {/* Success Message */}
          {success && submittedCrime && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-900">Report Submitted Successfully!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Crime ID: <span className="font-mono">{submittedCrime.record_id}</span>
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Redirecting to map in 5 seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Error Submitting Report</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Crime Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
              )}
            </div>

            {/* Crime Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Crime Type *
              </label>
              {formData.category && crimeTypesByCategory[formData.category] ? (
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Select a type</option>
                  {crimeTypesByCategory[formData.category].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="Other">Other (specify below)</option>
                </select>
              ) : (
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="Describe the crime type"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting || !formData.category}
                />
              )}
              {!formData.category && (
                <p className="mt-1 text-sm text-gray-500">Please select a category first</p>
              )}
              {validationErrors.type && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Somerset St, George St"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-sm text-gray-500">Enter street name or landmark in New Brunswick</p>
              {validationErrors.location && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {validationErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {validationErrors.time && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.time}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-4 border-t">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Information Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All reports are anonymous</li>
            <li>• Provide accurate information to help keep the community informed</li>
            <li>• For emergencies, call 911 immediately</li>
            <li>• This is a community reporting tool, not an official police report</li>
          </ul>
        </div>
      </div>
    </div>
  );
}