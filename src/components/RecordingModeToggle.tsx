import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { Mic, Users } from 'lucide-react';

const RecordingModeToggle: React.FC = () => {
  const { state, dispatch } = useTranslation();

  const handleToggleContinuousMode = () => {
    dispatch({ type: 'TOGGLE_CONTINUOUS_MODE' });
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Recording Mode
      </label>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Single Recording Mode */}
        <button
          onClick={handleToggleContinuousMode}
          disabled={!state.continuousRecording.isEnabled}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            !state.continuousRecording.isEnabled
              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Mic className="h-4 w-4 flex-shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-sm sm:text-base">Single Recording</div>
              <div className="text-xs mt-1 text-gray-500 hidden sm:block">
                Record once, translate once
              </div>
            </div>
          </div>
        </button>

        {/* Continuous Mode */}
        <button
          onClick={handleToggleContinuousMode}
          disabled={state.continuousRecording.isEnabled}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            state.continuousRecording.isEnabled
              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-sm sm:text-base">Continuous Mode</div>
              <div className="text-xs mt-1 text-gray-500 hidden sm:block">
                Track multiple speakers
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Mode indicator */}
      <div className="mt-3 text-sm text-gray-600 text-center">
        {state.continuousRecording.isEnabled ? (
          <span>
            Track conversations with multiple speakers in real-time
          </span>
        ) : (
          <span>
            Record and translate one message at a time
          </span>
        )}
      </div>
    </div>
  );
};

export default RecordingModeToggle;
