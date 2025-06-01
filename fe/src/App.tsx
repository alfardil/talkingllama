import { MaheenVideo } from './components/MaheenVideo';
import { SpeechToText } from "./components/SpeechToText";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="min-h-screen p-4" style={{ background: "#B8E8E0" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Speech/Text Input */}
          <div className="w-full lg:w-1/2">
            <SpeechToText />
          </div>
          
          {/* Right side - Video Chat */}
          <div className="w-full lg:w-1/2">
            <MaheenVideo />
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  );
}

export default App;
