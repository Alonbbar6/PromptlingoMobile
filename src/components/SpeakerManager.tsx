import React, { useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { Speaker } from '../types';
import { UserPlus, Check, Edit2, X } from 'lucide-react';

// Predefined colors for speakers
const SPEAKER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

const SpeakerManager: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleAddSpeaker = () => {
    const speakerNumber = state.continuousRecording.speakers.length + 1;
    const colorIndex = (speakerNumber - 1) % SPEAKER_COLORS.length;

    const newSpeaker: Speaker = {
      id: `speaker-${Date.now()}`,
      label: `Voice ${speakerNumber}`,
      color: SPEAKER_COLORS[colorIndex],
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_SPEAKER', payload: newSpeaker });
  };

  const handleSelectSpeaker = (speaker: Speaker) => {
    dispatch({ type: 'SET_CURRENT_SPEAKER', payload: speaker });
  };

  const handleStartEdit = (speaker: Speaker) => {
    setEditingSpeakerId(speaker.id);
    setEditLabel(speaker.label);
  };

  const handleSaveEdit = (speakerId: string) => {
    if (editLabel.trim()) {
      dispatch({
        type: 'RENAME_SPEAKER',
        payload: { speakerId, newLabel: editLabel.trim() }
      });
    }
    setEditingSpeakerId(null);
    setEditLabel('');
  };

  const handleCancelEdit = () => {
    setEditingSpeakerId(null);
    setEditLabel('');
  };

  if (!state.continuousRecording.isEnabled) {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Speakers
      </label>

      {/* Speaker List */}
      {state.continuousRecording.speakers.length > 0 && (
        <div className="space-y-2 mb-3">
          {state.continuousRecording.speakers.map((speaker) => {
            const isActive = state.continuousRecording.currentSpeaker?.id === speaker.id;
            const isEditing = editingSpeakerId === speaker.id;

            return (
              <div
                key={speaker.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  isActive
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* Speaker color indicator */}
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: speaker.color }}
                  />

                  {/* Speaker label - editable */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(speaker.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => handleSelectSpeaker(speaker)}
                      className="flex-1 text-left"
                    >
                      <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                        {speaker.label}
                      </span>
                    </button>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 ml-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(speaker.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(speaker)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {isActive && (
                        <div className="flex items-center space-x-1 ml-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          <span className="text-xs text-blue-600 font-medium">Active</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Speaker Button */}
      <button
        onClick={handleAddSpeaker}
        disabled={state.continuousRecording.isRecording}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlus className="h-5 w-5" />
        <span className="font-medium">Add New Speaker</span>
      </button>

      {/* Helpful hint */}
      {state.continuousRecording.speakers.length === 0 && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          Add speakers before starting the recording
        </p>
      )}
    </div>
  );
};

export default SpeakerManager;
