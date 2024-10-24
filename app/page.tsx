'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({ maxSteps: 3 });
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(message => (
          <div key={message.id} className="whitespace-pre-wrap">
            <div>
              <div className="font-bold">{message.role}</div>
              <p>
                {message.content.length > 0 ? (message.content) : (
                  <span className="italic font-light">
                    Chamando a function: {message?.toolInvocations?.[0].toolName}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 rounded shadow-xl bg-gray-400/20"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}