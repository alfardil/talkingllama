import { useEffect, useState } from 'react';

interface ConversationResponse {
  conversation_id: string;
  conversation_name: string;
  status: string;
  conversation_url: string;
  replica_id: string;
  persona_id: string;
  created_at: string;
}

export function MaheenVideo() {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const startConversation = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get context from backend LLM
        const contextRes = await fetch('http://localhost:8000/api/llama/context?question=Tell me about yourself');
        const contextData = await contextRes.json();

        // Optionally, clean/truncate context
        let context = contextData.response;
        if (typeof context !== 'string') context = '';
        if (context.length > 2000) context = context.slice(0, 2000);

        // Start Tavus conversation with context
        const response = await fetch('http://localhost:8000/api/tavus/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            replica_id: "rde70ddba503",
            persona_id: "p4e554a2c831",
            conversation_name: "Chat with Maheen",
            conversational_context: context,
            custom_greeting: "Hey! How's it going? I'm Maheen, nice to meet you!",
            properties: {
              max_call_duration: 3600,
              participant_left_timeout: 60,
              participant_absent_timeout: 300,
              enable_recording: true,
              enable_closed_captions: true,
              apply_greenscreen: true,
              language: "english"
            }
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            `Failed to create conversation: ${response.status} ${response.statusText}${
              errorData ? ` - ${JSON.stringify(errorData)}` : ''
            }`
          );
        }
        const data: ConversationResponse = await response.json();
        setConversationUrl(data.conversation_url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    startConversation();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading conversation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] bg-black rounded-lg overflow-hidden">
      {conversationUrl && (
        <iframe
          src={conversationUrl}
          className="w-full h-full min-h-[400px]"
          allow="camera; microphone; fullscreen; speaker"
          title="Tavus Video Chat"
        />
      )}
    </div>
  );
}
