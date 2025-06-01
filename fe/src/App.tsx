import React from "react";
import { SpeechToText } from "./components/SpeechToText";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <SpeechToText />
      <Toaster />
    </div>
  );
}

export default App;
