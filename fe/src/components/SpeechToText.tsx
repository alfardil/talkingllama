import { useState } from "react";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { SpeechControls } from "./SpeechControls";
import { SpeechTextarea } from "./SpeechTextarea";
import { SpeechToTextCard } from "./SpeechToTextCard";

export function SpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [manualText, setManualText] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/llama/context?question=${encodeURIComponent(textToSend)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResponse(data.response);
      // Reset both transcript and manual text after successful submission
      resetTranscript();
      setManualText("");
    } catch (error) {
      console.error("Error sending text:", error);
      setResponse("Sorry, there was an error processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ background: "#CCFAF2" }}
    >
      <SpeechToTextCard
        title="Talk to Llama"
        footer={
          <SpeechControls
            isListening={isListening}
            onToggleListening={toggleListening}
            onSubmit={handleSubmit}
            canSubmit={!!manualText || !!transcript}
            isLoading={isLoading}
          />
        }
      >
        <div className="space-y-4">
          <SpeechTextarea
            value={manualText || transcript}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Type or speak your message here..."
            className="h-48"
          />
          {response && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Response:</h3>
              <p className="text-gray-700">{response}</p>
            </div>
          )}
        </div>
      </SpeechToTextCard>
    </div>
  );
}
