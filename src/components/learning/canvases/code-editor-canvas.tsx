'use client';

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestCase {
  input: string;
  expected: string;
  hidden?: boolean;
}

interface TestResult {
  passed: boolean;
  actual: string;
  error?: string;
}

interface CodeEditorCanvasProps {
  initialCode: string;
  language: string;
  testCases: TestCase[];
  onSuccess: () => void;
  onRunCode?: (code: string) => Promise<{ output: string; results: TestResult[] }>;
}

export function CodeEditorCanvas({
  initialCode,
  language,
  testCases,
  onSuccess,
  onRunCode,
}: CodeEditorCanvasProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = useCallback(async () => {
    if (!onRunCode) return;

    setIsRunning(true);
    try {
      const { output: newOutput, results: newResults } = await onRunCode(code);
      setOutput(newOutput);
      setResults(newResults);

      if (newResults.every((r) => r.passed)) {
        onSuccess();
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  }, [code, onRunCode, onSuccess]);

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setResults([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        {/* Editor Panel */}
        <div className="flex-1 border-r flex flex-col">
          <div className="h-10 border-b flex items-center justify-between px-4 bg-muted/50">
            <span className="text-sm font-medium">solution.{language}</span>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-[400px] flex flex-col">
          <Tabs defaultValue="output" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b h-10 bg-muted/50">
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="tests">
                Tests
                {results.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {results.filter((r) => r.passed).length}/{results.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="output" className="flex-1 p-0 m-0">
              <pre className="p-4 text-sm font-mono h-full overflow-auto bg-zinc-950 text-zinc-100">
                {output || 'Run your code to see output...'}
              </pre>
            </TabsContent>

            <TabsContent value="tests" className="flex-1 p-0 m-0 overflow-auto">
              <div className="p-4 space-y-3">
                {testCases.map((test, i) => {
                  const result = results[i];
                  return (
                    <div
                      key={i}
                      className={cn(
                        'p-3 rounded-lg border',
                        result?.passed
                          ? 'border-green-500/50 bg-green-500/10'
                          : result
                          ? 'border-red-500/50 bg-red-500/10'
                          : 'border-border'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          Test {i + 1}
                          {test.hidden && ' (Hidden)'}
                        </span>
                        {result && (
                          result.passed ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </div>
                      {!test.hidden && (
                        <>
                          <p className="text-xs text-muted-foreground font-mono">
                            Input: {test.input}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Expected: {test.expected}
                          </p>
                        </>
                      )}
                      {result && !result.passed && (
                        <p className="text-xs text-red-400 font-mono mt-1">
                          Got: {result.actual}
                        </p>
                      )}
                      {result?.error && (
                        <p className="text-xs text-red-400 font-mono mt-1">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Action Bar */}
      <div className="h-14 border-t flex items-center justify-end gap-3 px-4 bg-muted/30">
        <Button onClick={handleRun} disabled={isRunning}>
          {isRunning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>
      </div>
    </div>
  );
}
