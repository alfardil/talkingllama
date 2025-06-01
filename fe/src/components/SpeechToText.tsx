import { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { toast } from "sonner";
import { SpeechControls } from "./SpeechControls";
import { SpeechTextarea } from "./SpeechTextarea";
import { SpeechToTextCard } from "./SpeechToTextCard";
import { Card } from "./ui/card";

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
    const toastId = toast.loading("Sending message to Maheen...");

    try {
      const response = await fetch(
        `http://localhost:8000/api/llama/context?question=${encodeURIComponent(
          textToSend
        )}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setResponse(data.response);
      // Reset both transcript and manual text after successful submission
      resetTranscript();
      setManualText("");
      toast.success("Message sent successfully!", {
        id: toastId,
      });
    } catch (error) {
      console.error("Error sending text:", error);
      setResponse("Sorry, there was an error processing your request.");
      toast.error("Failed to send message. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-4 mb-6">
        <img
          src="/maheen.jpeg"
          alt="Maheen"
          className="w-24 h-24 rounded-full object-cover border-4 border-main shadow-shadow"
        />
        <h1 className="text-3xl font-bold text-main">Talk To Maheen!</h1>
      </div>

      <SpeechToTextCard
        title=""
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
            <Card className="p-6 bg-white/50 backdrop-blur-sm border-2 border-main/20">
              <div className="flex items-start gap-4">
                <img
                  src="/maheen.jpeg"
                  alt="Maheen"
                  className="w-12 h-12 rounded-full object-cover border-2 border-main"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-main">
                    Maheen's Response
                  </h3>
                  <p className="text-foreground/80 leading-relaxed">
                    {response}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </SpeechToTextCard>
    </div>
  );
}
