import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { SpeechToTextCard } from "./SpeechToTextCard";
import { SpeechTextarea } from "./SpeechTextarea";
import { SpeechControls } from "./SpeechControls";

export function SpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [manualText, setManualText] = useState("");

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });
    }
    setIsListening(!isListening);
  };

  const handleSubmit = async () => {
    const textToSend = manualText || transcript;
    if (!textToSend.trim()) return;

    try {
      // TODO: Implement backend API call
      console.log("Sending text to backend:", textToSend);
      // Reset both transcript and manual text after successful submission
      resetTranscript();
      setManualText("");
    } catch (error) {
      console.error("Error sending text:", error);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: "#CCFAF2" }}
    >
      <SpeechToTextCard
        title="Speech to Text"
        footer={
          <SpeechControls
            isListening={isListening}
            onToggleListening={toggleListening}
            onSubmit={handleSubmit}
            canSubmit={!!manualText || !!transcript}
          />
        }
      >
        <SpeechTextarea
          value={manualText || transcript}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Type or speak your message here..."
          className="h-48"
        />
      </SpeechToTextCard>
    </div>
  );
}
