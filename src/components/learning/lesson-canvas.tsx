'use client';

import { CodeEditorCanvas } from './canvases/code-editor-canvas';
import { VisualizationCanvas } from './canvases/visualization-canvas';
import { ChallengeCanvas } from './canvases/challenge-canvas';

interface LessonCanvasProps {
  lesson: {
    type: string;
    content: unknown;
  };
  step: number;
  onComplete: () => void;
}

export function LessonCanvas({ lesson, step, onComplete }: LessonCanvasProps) {
  const content = lesson.content as Record<string, unknown>;

  switch (lesson.type) {
    case 'code':
      return (
        <CodeEditorCanvas
          initialCode={content.initialCode as string}
          language={content.language as string}
          testCases={content.testCases as []}
          onSuccess={onComplete}
        />
      );

    case 'visualization':
      return (
        <VisualizationCanvas
          type={content.visualizationType as 'memory' | 'algorithm' | 'dataflow' | 'network'}
          steps={content.steps as []}
          renderStep={(data, type) => (
            <div className="p-4 border rounded-lg bg-background">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        />
      );

    case 'challenge':
      return (
        <ChallengeCanvas
          title={content.title as string}
          description={content.description as string}
          initialCode={content.initialCode as string}
          language={content.language as string}
          timeLimit={content.timeLimit as number}
          maxHints={content.maxHints as number}
          hints={content.hints as string[]}
          onSubmit={async () => {
            onComplete();
            return true;
          }}
        />
      );

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Unknown lesson type: {lesson.type}</p>
        </div>
      );
  }
}
