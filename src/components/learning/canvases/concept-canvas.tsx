'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lightbulb } from 'lucide-react';

interface ConceptCanvasProps {
  content: string;
  keyTakeaways?: string[];
  onComplete: () => void;
}

export function ConceptCanvas({
  content,
  keyTakeaways,
  onComplete,
}: ConceptCanvasProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Markdown Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !className;

                if (isInline) {
                  return (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match ? match[1] : 'text'}
                    PreTag="div"
                    className="rounded-lg !my-4"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Key Takeaways */}
        {keyTakeaways && keyTakeaways.length > 0 && (
          <Card className="mt-6 border-amber-500/50 bg-amber-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-lg">Key Takeaways</h3>
              </div>
              <ul className="space-y-2">
                {keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer with Complete Button */}
      <div className="border-t p-4 flex justify-end">
        <Button
          onClick={handleComplete}
          disabled={isCompleted}
          className={isCompleted ? 'bg-green-600 hover:bg-green-600' : ''}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isCompleted ? 'Concept Understood' : 'I understand this concept'}
        </Button>
      </div>
    </div>
  );
}
