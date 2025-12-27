import React, { useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import ToneSelector from './ToneSelector';
import AudioRecorder, { AudioRecorderRef } from './AudioRecorder';
import TranslationPanel from './TranslationPanel';
import AudioPlayer from './AudioPlayer';
import UsageQuota from './UsageQuota';

const MainContent: React.FC = () => {
  const audioRecorderRef = useRef<AudioRecorderRef>(null);
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto relative">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('translator.title')}
            </h2>
            <div className="space-y-4">
              <LanguageSelector />
              <ToneSelector />
            </div>
          </div>

          {/* Usage Quota */}
          <UsageQuota />

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('translator.audioRecording')}
            </h2>
            <AudioRecorder ref={audioRecorderRef} />
          </div>
        </div>

        {/* Right Column - Translation */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('translator.translationResults')}
            </h2>
            <TranslationPanel />
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('translator.audioPlayback')}
            </h2>
            <AudioPlayer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
