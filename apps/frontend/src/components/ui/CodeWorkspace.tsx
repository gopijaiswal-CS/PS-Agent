import { type FC, useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { Question } from '@/types';
import { Button } from '@/components/ui/Button';
import { useUiStore } from '@/store/uiStore';
import { loadWorkspaceState, saveWorkspaceState } from '@/lib/workspacePersistence';

interface CodeWorkspaceProps {
  question: Question;
}

type LanguageId = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';
type DsaPreset = 'generic' | 'lru-cache';

type WorkspaceSnapshot = {
  preset: DsaPreset;
  language: LanguageId;
  codeByLanguage: Record<string, string>;
  notes: string;
  stdin: string;
  output: string;
};

const LANGUAGE_LABELS: Record<LanguageId, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
};

const GENERIC_SNIPPETS: Record<LanguageId, string> = {
  javascript: `function solve(input) {\n  // Explain the brute-force idea first.\n  // Then implement the optimized approach.\n  return input;\n}\n\nexport { solve };\n`,
  typescript: `function solve<T>(input: T): T {\n  // Explain the brute-force idea first.\n  // Then implement the optimized approach.\n  return input;\n}\n\nexport { solve };\n`,
  python: `def solve(input_data):\n    # Explain the brute-force idea first.\n    # Then implement the optimized approach.\n    return input_data\n`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static Object solve(Object input) {\n        // Explain the brute-force idea first.\n        // Then implement the optimized approach.\n        return input;\n    }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(int input) {\n    // Explain the brute-force idea first.\n    // Then implement the optimized approach.\n    return input;\n}\n`,
};

const LRU_CACHE_SNIPPETS: Record<LanguageId, string> = {
  javascript: `class Node {\n  constructor(key, value) {\n    this.key = key;\n    this.value = value;\n    this.prev = null;\n    this.next = null;\n  }\n}\n\nclass LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n    this.head = new Node(-1, -1);\n    this.tail = new Node(-1, -1);\n    this.head.next = this.tail;\n    this.tail.prev = this.head;\n  }\n\n  get(key) {\n    const node = this.cache.get(key);\n    if (!node) return -1;\n    this.remove(node);\n    this.insertAfterHead(node);\n    return node.value;\n  }\n\n  put(key, value) {\n    if (this.cache.has(key)) {\n      const existing = this.cache.get(key);\n      existing.value = value;\n      this.remove(existing);\n      this.insertAfterHead(existing);\n      return;\n    }\n\n    const node = new Node(key, value);\n    this.cache.set(key, node);\n    this.insertAfterHead(node);\n\n    if (this.cache.size > this.capacity) {\n      const lru = this.tail.prev;\n      this.remove(lru);\n      this.cache.delete(lru.key);\n    }\n  }\n\n  remove(node) {\n    node.prev.next = node.next;\n    node.next.prev = node.prev;\n  }\n\n  insertAfterHead(node) {\n    node.next = this.head.next;\n    node.prev = this.head;\n    this.head.next.prev = node;\n    this.head.next = node;\n  }\n}\n\nfunction solve() {\n  const cache = new LRUCache(2);\n  cache.put(1, 1);\n  cache.put(2, 2);\n  const a = cache.get(1);\n  cache.put(3, 3);\n  const b = cache.get(2);\n  cache.put(4, 4);\n  const c = cache.get(1);\n  const d = cache.get(3);\n  const e = cache.get(4);\n  return [a, b, c, d, e];\n}\n\nexport { solve, LRUCache };\n`,
  typescript: `class Node {\n  key: number;\n  value: number;\n  prev: Node | null = null;\n  next: Node | null = null;\n\n  constructor(key: number, value: number) {\n    this.key = key;\n    this.value = value;\n  }\n}\n\nclass LRUCache {\n  private capacity: number;\n  private cache = new Map<number, Node>();\n  private head = new Node(-1, -1);\n  private tail = new Node(-1, -1);\n\n  constructor(capacity: number) {\n    this.capacity = capacity;\n    this.head.next = this.tail;\n    this.tail.prev = this.head;\n  }\n\n  get(key: number): number {\n    const node = this.cache.get(key);\n    if (!node) return -1;\n    this.remove(node);\n    this.insertAfterHead(node);\n    return node.value;\n  }\n\n  put(key: number, value: number): void {\n    if (this.cache.has(key)) {\n      const existing = this.cache.get(key)!;\n      existing.value = value;\n      this.remove(existing);\n      this.insertAfterHead(existing);\n      return;\n    }\n\n    const node = new Node(key, value);\n    this.cache.set(key, node);\n    this.insertAfterHead(node);\n\n    if (this.cache.size > this.capacity) {\n      const lru = this.tail.prev!;\n      this.remove(lru);\n      this.cache.delete(lru.key);\n    }\n  }\n\n  private remove(node: Node): void {\n    node.prev!.next = node.next;\n    node.next!.prev = node.prev;\n  }\n\n  private insertAfterHead(node: Node): void {\n    node.next = this.head.next;\n    node.prev = this.head;\n    this.head.next!.prev = node;\n    this.head.next = node;\n  }\n}\n\nfunction solve(): number[] {\n  const cache = new LRUCache(2);\n  cache.put(1, 1);\n  cache.put(2, 2);\n  const a = cache.get(1);\n  cache.put(3, 3);\n  const b = cache.get(2);\n  cache.put(4, 4);\n  const c = cache.get(1);\n  const d = cache.get(3);\n  const e = cache.get(4);\n  return [a, b, c, d, e];\n}\n\nexport { solve, LRUCache };\n`,
  python: `class Node:\n    def __init__(self, key: int, value: int):\n        self.key = key\n        self.value = value\n        self.prev = None\n        self.next = None\n\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n        self.head = Node(-1, -1)\n        self.tail = Node(-1, -1)\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        pass\n`,
  java: `import java.util.*;\n\nclass Node {\n    int key;\n    int value;\n    Node prev;\n    Node next;\n\n    Node(int key, int value) {\n        this.key = key;\n        this.value = value;\n    }\n}\n\npublic class LRUCache {\n    private final int capacity;\n    private final Map<Integer, Node> cache = new HashMap<>();\n    private final Node head = new Node(-1, -1);\n    private final Node tail = new Node(-1, -1);\n\n    public LRUCache(int capacity) {\n        this.capacity = capacity;\n        head.next = tail;\n        tail.prev = head;\n    }\n\n    public int get(int key) {\n        return -1;\n    }\n\n    public void put(int key, int value) {\n    }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nstruct Node {\n    int key;\n    int value;\n    Node* prev;\n    Node* next;\n    Node(int k, int v) : key(k), value(v), prev(nullptr), next(nullptr) {}\n};\n\nclass LRUCache {\npublic:\n    explicit LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};\n`,
};

const PRESET_LABELS: Record<DsaPreset, string> = {
  generic: 'Generic DSA',
  'lru-cache': 'LRU Cache',
};

const TEST_CASE_PRESETS: Record<DsaPreset, string> = {
  generic: `1. Small happy path\n2. Empty input / single element\n3. Duplicate values or repeated operations\n4. Large input performance case\n`,
  'lru-cache': `Input:\nLRUCache(2)\nput(1,1)\nput(2,2)\nget(1) -> 1\nput(3,3)\nget(2) -> -1\nput(4,4)\nget(1) -> -1\nget(3) -> 3\nget(4) -> 4\n\nExpected output:\n[1, -1, -1, 3, 4]\n`,
};

const APPROACH_PRESETS: Record<DsaPreset, string[]> = {
  generic: [
    'Start with brute force, then name the bottleneck clearly.',
    'State the target complexity before coding.',
    'Code the happy path first, then edge cases.',
    'Finish by summarizing time and space complexity.',
  ],
  'lru-cache': [
    'Use a hash map for O(1) lookup.',
    'Use a doubly linked list for O(1) removal and insertion.',
    'Head side tracks most recently used; tail side tracks eviction candidate.',
    'On every get/put, move the active node to the front.',
  ],
};

function getPresetFromQuestion(question: Question): DsaPreset {
  const title = question.title.toLowerCase();
  if (title.includes('lru')) return 'lru-cache';
  return 'generic';
}

function getSnippetsForPreset(preset: DsaPreset): Record<LanguageId, string> {
  if (preset === 'lru-cache') return LRU_CACHE_SNIPPETS;
  return GENERIC_SNIPPETS;
}

function runJavaScriptSnippet(code: string): string {
  const transpiled = code.replace(/export\s*\{[^}]+\};?/g, '');
  const fn = new Function(`${transpiled}\nreturn typeof solve === 'function' ? solve() : 'No solve() function found';`);
  const result = fn();
  return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
}

export const CodeWorkspace: FC<CodeWorkspaceProps> = ({ question }) => {
  const { theme } = useUiStore();
  const storageKey = `techprep:dsa:${question._id}`;
  const detectedPreset = getPresetFromQuestion(question);
  const [language, setLanguage] = useState<LanguageId>('typescript');
  const [preset, setPreset] = useState<DsaPreset>(detectedPreset);
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>(() => ({ ...getSnippetsForPreset(detectedPreset) }));
  const [notes, setNotes] = useState('');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');

  const monacoTheme = useMemo(() => {
    if (theme === 'ember') return 'vs-dark';
    return 'vs-dark';
  }, [theme]);

  useEffect(() => {
    const fallback: WorkspaceSnapshot = {
      preset: detectedPreset,
      language: 'typescript',
      codeByLanguage: { ...getSnippetsForPreset(detectedPreset) },
      notes: TEST_CASE_PRESETS[detectedPreset],
      stdin: '',
      output: '',
    };

    const saved = loadWorkspaceState<WorkspaceSnapshot>(storageKey, fallback);
    setPreset(saved.preset);
    setLanguage(saved.language);
    setCodeByLanguage(saved.codeByLanguage);
    setNotes(saved.notes);
    setStdin(saved.stdin);
    setOutput(saved.output);
  }, [detectedPreset, question._id, storageKey]);

  useEffect(() => {
    saveWorkspaceState(storageKey, {
      preset,
      language,
      codeByLanguage,
      notes,
      stdin,
      output,
    });
  }, [codeByLanguage, language, notes, output, preset, stdin, storageKey]);

  const activeChecklist = APPROACH_PRESETS[preset];

  const handleRun = () => {
    if (language !== 'javascript' && language !== 'typescript') {
      setOutput(`Execution preview is currently available for JavaScript and TypeScript only.\n\nUse the notes panel for ${LANGUAGE_LABELS[language]} dry-runs and edge cases.`);
      return;
    }

    try {
      const result = runJavaScriptSnippet(codeByLanguage[language]);
      setOutput(`Run successful.\n\nOutput:\n${result}${stdin ? `\n\nCustom input note:\n${stdin}` : ''}`);
    } catch (error: any) {
      setOutput(`Run failed.\n\n${error?.message || 'Unknown execution error.'}`);
    }
  };

  return (
    <div className="h-full flex flex-col rounded-2xl border border-theme/20 bg-[#0b1020] overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-theme/20 bg-theme/30">
        <div>
          <p className="text-2xs uppercase tracking-[0.24em] text-theme-muted mb-1">DSA Workspace</p>
          <h3 className="text-sm font-semibold text-theme">Code your solution for {question.title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <select
            value={preset}
            onChange={(e) => {
              const nextPreset = e.target.value as DsaPreset;
              setPreset(nextPreset);
              setCodeByLanguage({ ...getSnippetsForPreset(nextPreset) });
              setNotes(TEST_CASE_PRESETS[nextPreset]);
              setOutput('');
            }}
            className="input-field !w-auto min-w-[140px] py-2"
          >
            {Object.entries(PRESET_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageId)}
            className="input-field !w-auto min-w-[140px] py-2"
          >
            {Object.entries(LANGUAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setCodeByLanguage((prev) => ({
                ...prev,
                [language]: getSnippetsForPreset(preset)[language],
              }))
            }
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] flex-1 min-h-0">
        <div className="min-h-0 flex flex-col">
          <div className="border-b border-theme/20 bg-theme/20 px-4 py-2 flex items-center justify-between">
            <p className="text-xs text-theme-muted">Editor</p>
            <Button size="sm" variant="primary" onClick={handleRun}>
              Run Preview
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language}
              theme={monacoTheme}
              value={codeByLanguage[language]}
              onChange={(value) =>
                setCodeByLanguage((prev) => ({
                  ...prev,
                  [language]: value ?? '',
                }))
              }
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
              }}
            />
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-theme/20 bg-theme-elevated/30 p-4 overflow-y-auto">
          <div className="glass-card p-4 mb-4">
            <p className="text-2xs uppercase tracking-[0.22em] text-theme-muted mb-2">Prompt Focus</p>
            <p className="text-sm text-theme-secondary leading-relaxed">
              Use this panel to translate the interview prompt into code. Start with the data structure choice, then layer in edge cases and complexity notes.
            </p>
          </div>

          <div className="glass-card p-4 mb-4">
            <p className="text-2xs uppercase tracking-[0.22em] text-theme-muted mb-3">Interview Flow</p>
            <div className="space-y-3 text-sm text-theme-secondary">
              {activeChecklist.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 mb-4">
            <p className="text-2xs uppercase tracking-[0.22em] text-theme-muted mb-3">Run / Test Panel</p>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="input-field min-h-[110px] resize-none font-mono text-xs bg-theme/40 mb-3"
              placeholder="Optional custom input or run notes..."
            />
            <div className="rounded-xl border border-theme/20 bg-[#08101a] p-3">
              <pre className="text-xs text-theme-secondary whitespace-pre-wrap font-mono">{output || 'No run output yet. Use Run Preview for JS/TS snippets.'}</pre>
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="text-2xs uppercase tracking-[0.22em] text-theme-muted mb-3">Test Cases & Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field min-h-[220px] resize-none font-mono text-xs bg-theme/40"
              placeholder="Write test cases, edge cases, or dry-run notes here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
