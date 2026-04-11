import { type FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface AiChatPanelProps {
  sessionId: string | null;
  questionTitle: string;
  className?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiChatPanel: FC<AiChatPanelProps> = ({ sessionId, questionTitle, className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Welcome! I'm your AI interviewer. When you're ready, start explaining your approach for **${questionTitle}**. I'll ask follow-up questions just like a real interview.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Simulate AI response (will be replaced with Socket.IO)
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiResponse]);

    // Simulate streaming
    const responses = [
      "That's a good start. ",
      "Can you explain how you'd handle ",
      "the case where multiple users ",
      "try to create the same short URL simultaneously? ",
      "What consistency guarantees would you provide?",
    ];

    for (const chunk of responses) {
      await new Promise((r) => setTimeout(r, 80));
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, content: last.content + chunk };
        return updated;
      });
    }

    setIsStreaming(false);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <h3 className="text-sm font-semibold text-surface-300 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-brand-600/20 flex items-center justify-center text-xs">🤖</span>
        AI Tutor
      </h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-64">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-brand-500 to-violet-500 text-white'
                  : 'bg-brand-500/20 text-brand-400'
              }`}
            >
              {msg.role === 'user' ? 'U' : 'AI'}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600/20 text-surface-100 rounded-tr-sm'
                  : 'glass-card text-surface-300 rounded-tl-sm'
              }`}
            >
              {msg.content}
              {isStreaming && msg === messages[messages.length - 1] && msg.role === 'assistant' && (
                <span className="inline-block w-1 h-4 bg-brand-400 ml-0.5 animate-pulse-soft" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your response..."
          className="input-field flex-1"
          disabled={isStreaming}
        />
        <Button variant="primary" size="sm" onClick={handleSend} loading={isStreaming}>
          Send
        </Button>
      </div>
    </div>
  );
};
