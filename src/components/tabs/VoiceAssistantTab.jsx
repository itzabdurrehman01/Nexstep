import React from 'react';
import { AiVoiceAssistant } from '../voice/AiVoiceAssistant.jsx';

export function VoiceAssistantTab({ profile, lang = 'en' }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AiVoiceAssistant profile={profile ?? {}} lang={lang} />
    </div>
  );
}

export default VoiceAssistantTab;
