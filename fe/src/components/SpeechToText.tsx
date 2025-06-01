import { Mic, MicOff, Send } from "lucide-react";
import { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

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
      const response = await fetch('http://localhost:8000/api/llama/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToSend
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Speech to Text</h1>

        <div className="mb-6">
          <textarea
            value={manualText || transcript}
            onChange={(e) => setManualText(e.target.value)}
            className="w-full h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type or speak your message here..."
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={toggleListening}
            className={`flex items-center px-6 py-3 rounded-full text-white font-semibold transition-colors ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2" />
                Start Recording
              </>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={(!manualText && !transcript) || isLoading}
            className={`flex items-center px-6 py-3 rounded-full text-white font-semibold transition-colors ${
              (!manualText && !transcript) || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <Send className="mr-2" />
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>

        {response && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Response:</h2>
            <p className="text-gray-700">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
