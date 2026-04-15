import { type FC, useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { Question } from '@/types';
import { Button } from '@/components/ui/Button';
import { Whiteboard } from '@/components/ui/Whiteboard';
import { useUiStore } from '@/store/uiStore';
import { loadWorkspaceState, saveWorkspaceState } from '@/lib/workspacePersistence';

interface ClassDesignWorkspaceProps {
  question: Question;
}

type LldLanguage = 'java' | 'typescript';
type LldPreset = 'generic' | 'parking-lot' | 'elevator-system' | 'bookmyshow';

type LldWorkspaceSnapshot = {
  preset: LldPreset;
  language: LldLanguage;
  codeByLanguage: Record<string, string>;
  notes: string;
};

const PRESET_LABELS: Record<LldPreset, string> = {
  generic: 'Generic LLD',
  'parking-lot': 'Parking Lot',
  'elevator-system': 'Elevator System',
  bookmyshow: 'BookMyShow',
};

const LLD_SNIPPETS: Record<LldPreset, Record<LldLanguage, string>> = {
  generic: {
    java: `import java.util.*;\n\npublic class SolutionDesign {\n    public static void main(String[] args) {\n        // Describe how your objects collaborate.\n    }\n}\n\ninterface Repository<T> {\n    Optional<T> findById(String id);\n    void save(T entity);\n}\n\nclass DomainService {\n    // Add fields, constructor, and methods\n}\n`,
    typescript: `interface Entity {\n  id: string;\n}\n\ninterface Repository<T extends Entity> {\n  findById(id: string): T | undefined;\n  save(entity: T): void;\n}\n\nclass DomainService {\n  constructor() {\n    // Inject dependencies here\n  }\n\n  execute(): void {\n    // Add orchestration logic\n  }\n}\n`,
  },
  'parking-lot': {
    java: `import java.util.*;\n\nenum VehicleType { MOTORCYCLE, CAR, BUS }\n\nenum SpotType { SMALL, MEDIUM, LARGE }\n\nabstract class Vehicle {\n    private final String licenseNumber;\n    private final VehicleType type;\n\n    protected Vehicle(String licenseNumber, VehicleType type) {\n        this.licenseNumber = licenseNumber;\n        this.type = type;\n    }\n}\n\nclass ParkingSpot {\n    private final String id;\n    private final SpotType type;\n    private Vehicle parkedVehicle;\n\n    ParkingSpot(String id, SpotType type) {\n        this.id = id;\n        this.type = type;\n    }\n\n    boolean canFit(Vehicle vehicle) {\n        return true;\n    }\n}\n\nclass Level {\n    private final List<ParkingSpot> spots = new ArrayList<>();\n\n    Optional<ParkingSpot> findSpot(Vehicle vehicle) {\n        return Optional.empty();\n    }\n}\n\nclass ParkingLot {\n    private final List<Level> levels = new ArrayList<>();\n\n    ParkingTicket park(Vehicle vehicle) {\n        return null;\n    }\n\n    double exit(ParkingTicket ticket) {\n        return 0.0;\n    }\n}\n\nclass ParkingTicket {}\n`,
    typescript: `enum VehicleType {\n  MOTORCYCLE = 'MOTORCYCLE',\n  CAR = 'CAR',\n  BUS = 'BUS',\n}\n\nenum SpotType {\n  SMALL = 'SMALL',\n  MEDIUM = 'MEDIUM',\n  LARGE = 'LARGE',\n}\n\nabstract class Vehicle {\n  constructor(public licenseNumber: string, public type: VehicleType) {}\n}\n\nclass ParkingSpot {\n  parkedVehicle: Vehicle | null = null;\n\n  constructor(public id: string, public type: SpotType) {}\n\n  canFit(vehicle: Vehicle): boolean {\n    return true;\n  }\n}\n\nclass Level {\n  constructor(public spots: ParkingSpot[]) {}\n\n  findSpot(vehicle: Vehicle): ParkingSpot | undefined {\n    return undefined;\n  }\n}\n\nclass ParkingLot {\n  constructor(private levels: Level[]) {}\n\n  park(vehicle: Vehicle): ParkingTicket | null {\n    return null;\n  }\n\n  exit(ticket: ParkingTicket): number {\n    return 0;\n  }\n}\n\nclass ParkingTicket {}\n`,
  },
  'elevator-system': {
    java: `import java.util.*;\n\nenum Direction { UP, DOWN, IDLE }\n\nenum ElevatorState { MOVING, STOPPED, MAINTENANCE }\n\nclass ElevatorCar {\n    private final int id;\n    private int currentFloor;\n    private Direction direction = Direction.IDLE;\n    private ElevatorState state = ElevatorState.STOPPED;\n    private final PriorityQueue<Integer> upStops = new PriorityQueue<>();\n    private final PriorityQueue<Integer> downStops = new PriorityQueue<>(Comparator.reverseOrder());\n\n    ElevatorCar(int id) {\n        this.id = id;\n    }\n\n    void requestFloor(int floor) {}\n}\n\nclass ElevatorController {\n    private final List<ElevatorCar> elevators = new ArrayList<>();\n\n    ElevatorCar assignElevator(int sourceFloor, Direction direction) {\n        return null;\n    }\n}\n`,
    typescript: `enum Direction {\n  UP = 'UP',\n  DOWN = 'DOWN',\n  IDLE = 'IDLE',\n}\n\nenum ElevatorState {\n  MOVING = 'MOVING',\n  STOPPED = 'STOPPED',\n  MAINTENANCE = 'MAINTENANCE',\n}\n\nclass ElevatorCar {\n  direction = Direction.IDLE;\n  state = ElevatorState.STOPPED;\n  currentFloor = 0;\n  upStops: number[] = [];\n  downStops: number[] = [];\n\n  constructor(public id: number) {}\n\n  requestFloor(floor: number): void {}\n}\n\nclass ElevatorController {\n  constructor(private elevators: ElevatorCar[]) {}\n\n  assignElevator(sourceFloor: number, direction: Direction): ElevatorCar | null {\n    return null;\n  }\n}\n`,
  },
  bookmyshow: {
    java: `import java.util.*;\n\nclass Movie {\n    String id;\n    String title;\n}\n\nclass Show {\n    String id;\n    Movie movie;\n    Date startTime;\n    List<Seat> seats = new ArrayList<>();\n}\n\nclass Seat {\n    String id;\n    boolean booked;\n}\n\nclass BookingService {\n    Booking reserveSeats(String showId, List<String> seatIds, String userId) {\n        return null;\n    }\n}\n\nclass Booking {}\n`,
    typescript: `class Movie {\n  constructor(public id: string, public title: string) {}\n}\n\nclass Seat {\n  constructor(public id: string, public booked = false) {}\n}\n\nclass Show {\n  constructor(public id: string, public movie: Movie, public startTime: Date, public seats: Seat[]) {}\n}\n\nclass Booking {}\n\nclass BookingService {\n  reserveSeats(showId: string, seatIds: string[], userId: string): Booking | null {\n    return null;\n  }\n}\n`,
  },
};

const NOTES_PRESETS: Record<LldPreset, string> = {
  generic: `Entities:\n- \n\nServices:\n- \n\nPatterns:\n- Strategy / Factory / Observer / Repository\n\nQuestions to answer:\n- Where does orchestration live?\n- What should be interface vs concrete class?\n- What varies over time?\n`,
  'parking-lot': `Entities:\n- ParkingLot, Level, ParkingSpot, Vehicle, Ticket\n\nPolicies:\n- spot allocation\n- fee calculation\n\nEdge cases:\n- bus needing multiple spots\n- concurrent entry/exit\n- invalid ticket / full lot\n`,
  'elevator-system': `Entities:\n- ElevatorCar, Controller, Request, Panel\n\nPolicies:\n- elevator assignment\n- stop ordering\n\nEdge cases:\n- maintenance mode\n- overload / full car\n- simultaneous hall calls\n`,
  bookmyshow: `Entities:\n- Movie, Show, Seat, Booking, Payment\n\nPolicies:\n- seat locking timeout\n- booking confirmation\n\nEdge cases:\n- concurrent seat booking\n- payment success but timeout race\n- booking cancellation\n`,
};

const CHECKLISTS: Record<LldPreset, string[]> = {
  generic: [
    'Identify entities, services, and repositories.',
    'Keep each class focused on one responsibility.',
    'Use interfaces where behavior can vary later.',
    'Explain patterns and extension points out loud.',
  ],
  'parking-lot': [
    'Separate parking policy from fee policy.',
    'Model vehicle type and spot type compatibility clearly.',
    'Show how entry/exit update availability safely.',
    'Explain what changes if pricing rules evolve later.',
  ],
  'elevator-system': [
    'Separate hall requests from in-car destination requests.',
    'Keep dispatch logic independent from elevator movement state.',
    'Explain how you avoid starvation across floors.',
    'Mention what changes for multiple shafts and maintenance mode.',
  ],
  bookmyshow: [
    'Separate seat inventory from booking workflow.',
    'Use temporary seat locks before payment confirmation.',
    'Explain concurrency protection for the same seat set.',
    'Call out cancellation/refund and lock expiry behavior.',
  ],
};

function getPresetFromQuestion(question: Question): LldPreset {
  const title = question.title.toLowerCase();
  if (title.includes('parking lot')) return 'parking-lot';
  if (title.includes('elevator')) return 'elevator-system';
  if (title.includes('bookmyshow') || title.includes('ticket')) return 'bookmyshow';
  return 'generic';
}

export const ClassDesignWorkspace: FC<ClassDesignWorkspaceProps> = ({ question }) => {
  const { theme } = useUiStore();
  const storageKey = `techprep:lld:${question._id}`;
  const detectedPreset = getPresetFromQuestion(question);
  const [language, setLanguage] = useState<LldLanguage>('java');
  const [preset, setPreset] = useState<LldPreset>(detectedPreset);
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>(() => ({ ...LLD_SNIPPETS[detectedPreset] }));
  const [notes, setNotes] = useState('');

  const monacoTheme = useMemo(() => {
    if (theme === 'ember') return 'vs-dark';
    return 'vs-dark';
  }, [theme]);

  useEffect(() => {
    const fallback: LldWorkspaceSnapshot = {
      preset: detectedPreset,
      language: 'java',
      codeByLanguage: { ...LLD_SNIPPETS[detectedPreset] },
      notes: NOTES_PRESETS[detectedPreset],
    };

    const saved = loadWorkspaceState<LldWorkspaceSnapshot>(storageKey, fallback);
    setPreset(saved.preset);
    setLanguage(saved.language);
    setCodeByLanguage(saved.codeByLanguage);
    setNotes(saved.notes);
  }, [detectedPreset, question._id, storageKey]);

  useEffect(() => {
    saveWorkspaceState(storageKey, {
      preset,
      language,
      codeByLanguage,
      notes,
    });
  }, [codeByLanguage, language, notes, preset, storageKey]);

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
      <div className="min-h-[320px] xl:min-h-0">
        <div className="h-full flex flex-col rounded-2xl border border-theme/20 overflow-hidden bg-[#0d1118]">
          <div className="px-4 py-3 border-b border-theme/20 bg-theme/30">
            <p className="text-2xs uppercase tracking-[0.24em] text-theme-muted mb-1">Diagram Studio</p>
            <h3 className="text-sm font-semibold text-theme">Map classes, relationships, and flows</h3>
          </div>
          <div className="flex-1 min-h-0">
            <Whiteboard track="lld" persistenceKey={`techprep-whiteboard-${question._id}`} />
          </div>
        </div>
      </div>

      <div className="min-h-[320px] xl:min-h-0 flex flex-col rounded-2xl border border-theme/20 overflow-hidden bg-[#0d1118]">
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-theme/20 bg-theme/30">
          <div>
            <p className="text-2xs uppercase tracking-[0.24em] text-theme-muted mb-1">Class Blueprint</p>
            <h3 className="text-sm font-semibold text-theme">Translate your diagram into classes and interfaces</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={preset}
              onChange={(e) => {
                const nextPreset = e.target.value as LldPreset;
                setPreset(nextPreset);
                setCodeByLanguage({ ...LLD_SNIPPETS[nextPreset] });
                setNotes(NOTES_PRESETS[nextPreset]);
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
              onChange={(e) => setLanguage(e.target.value as LldLanguage)}
              className="input-field !w-auto min-w-[130px] py-2"
            >
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCodeByLanguage((prev) => ({
                  ...prev,
                  [language]: LLD_SNIPPETS[preset][language],
                }))
              }
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] flex-1 min-h-0">
          <div className="min-h-0">
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
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 18 },
              }}
            />
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-theme/20 bg-theme-elevated/30 p-4 overflow-y-auto">
            <div className="glass-card p-4 mb-4">
              <p className="text-2xs uppercase tracking-[0.22em] text-theme-muted mb-3">LLD Checklist</p>
              <div className="space-y-3 text-sm text-theme-secondary">
                {CHECKLISTS[preset].map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 mb-4">
              <p className="text-2xs uppercase tracking-[0.22em] text-theme-muted mb-2">Interview Angle</p>
              <p className="text-sm text-theme-secondary leading-relaxed">
                Use the diagram to show ownership and collaboration. Use the code pane to prove naming, abstraction, and extensibility decisions.
              </p>
            </div>

            <div className="glass-card p-4">
              <p className="text-2xs uppercase tracking-[0.22em] text-theme-muted mb-3">Quick Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-[190px] resize-none font-mono text-xs bg-theme/40"
                placeholder="List classes, methods, invariants, and key design patterns here..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
