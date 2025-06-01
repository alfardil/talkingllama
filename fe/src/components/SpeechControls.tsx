import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { Button } from "./ui/button";

interface SpeechControlsProps {
  isListening: boolean;
  onToggleListening: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isLoading?: boolean;
}

export function SpeechControls({
  isListening,
  onToggleListening,
  onSubmit,
  canSubmit,
  isLoading = false,
}: SpeechControlsProps) {
  return (
    <div className="flex justify-center gap-4">
      <Button
        onClick={onToggleListening}
        variant={isListening ? "neutral" : "default"}
        className={
          isListening
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }
        disabled={isLoading}
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
      </Button>
      <Button
        onClick={onSubmit}
        disabled={!canSubmit || isLoading}
        variant="default"
        className={
          !canSubmit || isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send className="mr-2" />
            Send
          </>
        )}
      </Button>
    </div>
  );
}
