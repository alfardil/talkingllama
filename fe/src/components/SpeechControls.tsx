import React from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Send } from "lucide-react";

interface SpeechControlsProps {
  isListening: boolean;
  onToggleListening: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function SpeechControls({
  isListening,
  onToggleListening,
  onSubmit,
  canSubmit,
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
        disabled={!canSubmit}
        variant="default"
        className={
          !canSubmit
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }
      >
        <Send className="mr-2" />
        Send
      </Button>
    </div>
  );
}
