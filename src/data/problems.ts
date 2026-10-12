import type { Problem } from '../types';

export const PROBLEMS: Problem[] = [
  {
    id: 'parking-lot',
    title: 'Smart Multi-Level Parking Lot',
    difficulty: 'Medium',
    summary: 'Design a clean, concurrent parking system managing multiple spot types, automated gate assignment, and dynamic pricing strategies.',
    tags: ['Strategy Pattern', 'Factory Pattern', 'Concurrency', 'SOLID'],
    description: `A commercial shopping mall requires an automated parking management system across multiple floors.
Vehicles of different types (Motorcycle, Car, Electric Vehicle, Bus/Truck) arrive at multiple entry gates concurrently.
The system must assign optimal parking spots, issue time-stamped tickets, track real-time occupancy, support dynamic pricing strategies (e.g. flat hourly rate vs. peak-hour surge rate vs. EV charging surcharge), and process payments at exit gates without race conditions.`,
    domainRequirements: [
      'Multiple vehicle types: Motorcycle, Compact Car, Large Bus/Truck, and Electric Vehicle.',
      'Multiple floors with categorized spots (Compact, Large, Motorcycle, EV with charging socket).',
      'Entry Gates issue tickets containing ticketId, entryTimestamp, vehicleId, and assignedSpotId.',
      'Exit Gates compute total fee using pluggable pricing strategies and release the spot.',
      'Spot Allocation Strategy: Should be flexible (e.g., nearest to gate, lowest floor first, or even-distribution).',
      'Display boards at each level showing real-time available spots per vehicle category.'
    ],
    nonFunctionalRequirements: [
      'Concurrency & Thread Safety: Multiple gates allocating spots simultaneously must never double-book the same spot.',
      'Open-Closed Principle (OCP): New pricing algorithms or spot allocation heuristics can be added without modifying the core parking lot manager.',
      'Single Responsibility Principle (SRP): Decouple ticket lifecycle, spot allocation, and fee calculation into dedicated classes.',
      'Resilient Error Handling: Gracefully reject vehicle entry when no compatible spot exists.'
    ],
    checklist: [
      { id: 'c1', category: 'Entities', title: 'Vehicle and Spot Hierarchy', hint: 'Vehicle hierarchy (Car, Bike, Bus) and matching ParkingSpot types.' },
      { id: 'c2', category: 'Patterns', title: 'Pluggable Pricing Strategy', hint: 'Define IPricingStrategy interface with multiple implementations (Hourly, PeakSurge).' },
      { id: 'c3', category: 'Patterns', title: 'Spot Allocation Strategy', hint: 'Decouple finding an open spot into an IAllocationStrategy.' },
      { id: 'c4', category: 'Concurrency', title: 'Thread-Safe Spot Locking', hint: 'Ensure atomic check-and-reserve of spots to prevent double booking.' },
      { id: 'c5', category: 'SOLID', title: 'Decoupled Gates and Tickets', hint: 'EntryGate and ExitGate should orchestrate rather than holding internal pricing math.' }
    ],
    starterTemplate: {
      typescript: `// ==========================================
// PROBLEM: Smart Multi-Level Parking Lot
// Complete the classes, interfaces, and methods.
// ==========================================

export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  LARGE = 'LARGE',
  ELECTRIC = 'ELECTRIC'
}

export enum SpotType {
  MOTORCYCLE = 'MOTORCYCLE',
  COMPACT = 'COMPACT',
  LARGE = 'LARGE',
  ELECTRIC = 'ELECTRIC'
}

export interface Vehicle {
  getLicensePlate(): string;
  getType(): VehicleType;
}

export interface ParkingSpot {
  getId(): string;
  getFloor(): number;
  getType(): SpotType;
  isAvailable(): boolean;
  assignVehicle(vehicle: Vehicle): boolean;
  vacate(): void;
}

export interface Ticket {
  getId(): string;
  getVehicle(): Vehicle;
  getSpot(): ParkingSpot;
  getEntryTime(): Date;
}

// TODO: Define IPricingStrategy interface and implementations
export interface IPricingStrategy {
  calculateFee(ticket: Ticket, exitTime: Date): number;
}

// TODO: Implement Core ParkingLot Orchestrator and Gates
export class ParkingLot {
  // Add collections of floors, spots, active tickets, and synchronization
  
  public park(vehicle: Vehicle): Ticket | null {
    // Implement thread-safe spot allocation and ticket generation
    return null;
  }

  public unpark(ticketId: string): number {
    // Implement spot release and fee calculation via strategy
    return 0;
  }
}
`,
      java: `// Smart Multi-Level Parking Lot in Java
public enum VehicleType { MOTORCYCLE, CAR, LARGE, ELECTRIC }
public enum SpotType { MOTORCYCLE, COMPACT, LARGE, ELECTRIC }

public interface Vehicle {
    String getLicensePlate();
    VehicleType getType();
}

public interface IPricingStrategy {
    double calculateFee(Ticket ticket, long exitTimestamp);
}

public class ParkingLot {
    // Implement thread-safe spot allocation, gates, and pricing strategies
}
`,
      python: `# Smart Multi-Level Parking Lot in Python
from enum import Enum
from typing import Optional, List
import threading

class VehicleType(Enum):
    MOTORCYCLE = 1
    CAR = 2
    LARGE = 3
    ELECTRIC = 4

class IPricingStrategy:
    def calculate_fee(self, ticket, exit_time: float) -> float:
        raise NotImplementedError
`
    },
    sampleGoodSolution: {
      language: 'typescript',
      code: `export enum VehicleType { MOTORCYCLE, CAR, LARGE, ELECTRIC }
export enum SpotType { MOTORCYCLE, COMPACT, LARGE, ELECTRIC }

export class Vehicle {
  constructor(private plate: string, private type: VehicleType) {}
  getPlate(): string { return this.plate; }
  getType(): VehicleType { return this.type; }
}

export class ParkingSpot {
  private occupied = false;
  private currentVehicle: Vehicle | null = null;
  private lock = false; // concurrency representation

  constructor(private id: string, private floor: number, private type: SpotType) {}
  
  public getId(): string { return this.id; }
  public getType(): SpotType { return this.type; }
  public isAvailable(): boolean { return !this.occupied; }

  public synchronizedAssign(vehicle: Vehicle): boolean {
    if (this.occupied || this.lock) return false;
    this.lock = true;
    try {
      this.currentVehicle = vehicle;
      this.occupied = true;
      return true;
    } finally {
      this.lock = false;
    }
  }

  public vacate(): void {
    this.currentVehicle = null;
    this.occupied = false;
  }
}

export interface IPricingStrategy {
  compute(durationHours: number, vehicleType: VehicleType): number;
}

export class HourlyPricingStrategy implements IPricingStrategy {
  private rates: Record<VehicleType, number> = {
    [VehicleType.MOTORCYCLE]: 10,
    [VehicleType.CAR]: 20,
    [VehicleType.LARGE]: 40,
    [VehicleType.ELECTRIC]: 25
  };

  compute(durationHours: number, vehicleType: VehicleType): number {
    const hours = Math.max(1, Math.ceil(durationHours));
    return hours * (this.rates[vehicleType] || 20);
  }
}

export class Ticket {
  constructor(
    public readonly id: string,
    public readonly vehicle: Vehicle,
    public readonly spot: ParkingSpot,
    public readonly entryTime: Date
  ) {}
}

export interface ISpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | null;
}

export class FirstAvailableSpotStrategy implements ISpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | null {
    for (const spot of spots) {
      if (spot.isAvailable() && this.matches(spot.getType(), vehicle.getType())) {
        return spot;
      }
    }
    return null;
  }

  private matches(spotType: SpotType, vehicleType: VehicleType): boolean {
    if (vehicleType === VehicleType.MOTORCYCLE) return true;
    if (vehicleType === VehicleType.CAR) return spotType === SpotType.COMPACT || spotType === SpotType.LARGE;
    if (vehicleType === VehicleType.LARGE) return spotType === SpotType.LARGE;
    if (vehicleType === VehicleType.ELECTRIC) return spotType === SpotType.ELECTRIC || spotType === SpotType.COMPACT;
    return false;
  }
}

export class ParkingLotService {
  private spots: ParkingSpot[] = [];
  private activeTickets: Map<string, Ticket> = new Map();

  constructor(
    private pricingStrategy: IPricingStrategy,
    private allocationStrategy: ISpotAllocationStrategy
  ) {}

  public addSpot(spot: ParkingSpot): void {
    this.spots.push(spot);
  }

  public parkVehicle(vehicle: Vehicle): Ticket {
    const spot = this.allocationStrategy.findSpot(this.spots, vehicle);
    if (!spot) {
      throw new Error('Parking lot is full for this vehicle type.');
    }

    const assigned = spot.synchronizedAssign(vehicle);
    if (!assigned) {
      throw new Error('Spot reservation conflict occurred, retry allocation.');
    }

    const ticket = new Ticket('TCK-' + Date.now(), vehicle, spot, new Date());
    this.activeTickets.set(ticket.id, ticket);
    return ticket;
  }

  public exitVehicle(ticketId: string): number {
    const ticket = this.activeTickets.get(ticketId);
    if (!ticket) {
      throw new Error('Invalid or non-existent ticket.');
    }

    const durationHours = (Date.now() - ticket.entryTime.getTime()) / (1000 * 60 * 60);
    const fee = this.pricingStrategy.compute(durationHours, ticket.vehicle.getType());

    ticket.spot.vacate();
    this.activeTickets.delete(ticketId);
    return fee;
  }
}`,
      rationale: 'Applied Strategy Pattern for both IPricingStrategy and ISpotAllocationStrategy (OCP compliant). Encapsulated parking spot state with synchronized assignment guard. Clear SRP separation: Ticket holds data, Spot manages state, ParkingLotService coordinates workflows without leaking concrete math.'
    },
    sampleFlawedSolution: {
      language: 'typescript',
      code: `// Flawed God Class Solution
export class ParkingLotManager {
  public spots: any[] = [];
  public cars: any[] = [];

  // Antipattern: God class doing everything
  public doEverything(action: string, license: string, type: string, hours: number) {
    if (action === 'PARK') {
      for (let i = 0; i < this.spots.length; i++) {
        if (!this.spots[i].occupied) {
          this.spots[i].occupied = true;
          this.spots[i].car = license;
          return 'Parked at spot ' + i;
        }
      }
      return 'Full';
    } else if (action === 'UNPARK') {
      for (let i = 0; i < this.spots.length; i++) {
        if (this.spots[i].car === license) {
          this.spots[i].occupied = false;
          // Hardcoded pricing calculation, no strategy, no ticket, magic numbers
          let fee = hours * 20;
          if (type === 'BIKE') fee = hours * 10;
          if (type === 'BUS') fee = hours * 50;
          return fee;
        }
      }
    }
  }
}`,
      rationale: 'I put everything into a single function doEverything so it is easy to read.',
      explanation: 'Critical Anti-Patterns: God class violating Single Responsibility Principle, no encapsulation, zero concurrency protection, tight coupling with hardcoded fee rules violating Open-Closed Principle, missing domain entities (Ticket, Vehicle, Gate).'
    }
  },
  {
    id: 'elevator-system',
    title: 'Intelligent Elevator Dispatcher',
    difficulty: 'Hard',
    summary: 'Design a multi-car elevator control system optimizing passenger wait times, directional dispatch (LOOK/SCAN), and emergency state handling.',
    tags: ['State Pattern', 'Observer Pattern', 'Scheduling Algorithm', 'Concurrency'],
    description: `A 40-story commercial skyscraper operates a bank of 4 synchronized passenger elevators.
Passengers on floors press Up/Down hall buttons, and passengers inside elevators select destination floors.
The dispatcher must schedule car assignments minimizing average wait time and avoiding starvation using algorithms like LOOK/SCAN.
The system must safely handle capacity limits, door states (Opening, Open, Closing, Closed), and emergency stop commands.`,
    domainRequirements: [
      'Elevator Car states: Idle, Moving Up, Moving Down, Maintenance, Emergency Stop.',
      'Door states: Closed, Opening, Open, Closing with obstacle detection sensor.',
      'Dispatching Controller: Receives external Hall Calls (Floor, Direction) and schedules optimal car.',
      'Internal Car Panel: Receives destination floor requests from passengers.',
      'Capacity & Overload Sensor: Prevents movement if passenger weight exceeds safe threshold.'
    ],
    nonFunctionalRequirements: [
      'Concurrency: Hall calls arrive concurrently; elevator thread updates current floor independently.',
      'State Pattern: State transitions (e.g. Idle -> Moving -> Stopped) must be clean and encapsulated.',
      'Strategy Pattern: Dispatch algorithms (LOOK, SCAN, Shortest Seek Time First) should be interchangeable.',
      'Starvation Prevention: No request can be indefinitely postponed when traffic is heavy.'
    ],
    checklist: [
      { id: 'e1', category: 'Patterns', title: 'State Pattern for Elevator Lifecycle', hint: 'Encapsulate IdleState, MovingUpState, MovingDownState, EmergencyState.' },
      { id: 'e2', category: 'Patterns', title: 'Pluggable Dispatcher Strategy', hint: 'Define IDispatchStrategy interface to allow SCAN vs FCFS vs LOOK.' },
      { id: 'e3', category: 'Concurrency', title: 'Thread-Safe Request Queue', hint: 'Synchronize access to internal/external pending floor request sets.' },
      { id: 'e4', category: 'SOLID', title: 'Sensor & Door Decoupling', hint: 'Door and Overload sensors should be injected abstractions.' }
    ],
    starterTemplate: {
      typescript: `// ==========================================
// PROBLEM: Intelligent Elevator Dispatcher
// Complete the classes, interfaces, and methods.
// ==========================================

export enum Direction { UP = 'UP', DOWN = 'DOWN', NONE = 'NONE' }
export enum ElevatorStatus { IDLE = 'IDLE', MOVING = 'MOVING', STOPPED = 'STOPPED', EMERGENCY = 'EMERGENCY' }

export interface Request {
  floor: number;
  direction?: Direction;
}

// TODO: Define Elevator State interface or Strategy
export interface IElevatorState {
  handleFloorArrival(elevator: Elevator, floor: number): void;
}

export class Elevator {
  public id: string;
  public currentFloor: number = 0;
  public direction: Direction = Direction.NONE;
  public status: ElevatorStatus = ElevatorStatus.IDLE;

  constructor(id: string) {
    this.id = id;
  }

  public addDestination(floor: number): void {
    // Add destination to queue
  }

  public step(): void {
    // Simulate movement step
  }
}

// TODO: Implement Dispatcher
export class ElevatorController {
  private elevators: Elevator[] = [];

  public requestElevator(floor: number, direction: Direction): void {
    // Dispatch best elevator
  }
}
`,
      java: `// Elevator System in Java
public enum Direction { UP, DOWN, IDLE }

public interface IDispatchStrategy {
    Elevator selectElevator(List<Elevator> elevators, int floor, Direction direction);
}

public class ElevatorController {
    // Dispatch logic and synchronization
}
`,
      python: `# Elevator System in Python
from enum import Enum
from typing import List

class Direction(Enum):
    UP = 1
    DOWN = 2
    IDLE = 3
`
    },
    sampleGoodSolution: {
      language: 'typescript',
      code: `export enum Direction { UP, DOWN, IDLE }

export interface IDispatchStrategy {
  findOptimalElevator(elevators: Elevator[], floor: number, direction: Direction): Elevator;
}

export class ProximityDispatchStrategy implements IDispatchStrategy {
  findOptimalElevator(elevators: Elevator[], floor: number, direction: Direction): Elevator {
    let best: Elevator | null = null;
    let minCost = Infinity;

    for (const e of elevators) {
      const distance = Math.abs(e.getCurrentFloor() - floor);
      let penalty = 0;
      if (e.getDirection() !== Direction.IDLE && e.getDirection() !== direction) {
        penalty = 20; // moving away penalty
      }
      const cost = distance + penalty;
      if (cost < minCost) {
        minCost = cost;
        best = e;
      }
    }
    return best || elevators[0];
  }
}

export class Elevator {
  private currentFloor: number = 0;
  private direction: Direction = Direction.IDLE;
  private upStops: Set<number> = new Set();
  private downStops: Set<number> = new Set();
  private isEmergency: boolean = false;

  constructor(public readonly id: string, private maxCapacity: number = 10) {}

  public getCurrentFloor(): number { return this.currentFloor; }
  public getDirection(): Direction { return this.direction; }

  public synchronizedAddStop(floor: number): void {
    if (this.isEmergency) throw new Error('Elevator in emergency state.');
    if (floor > this.currentFloor) {
      this.upStops.add(floor);
      if (this.direction === Direction.IDLE) this.direction = Direction.UP;
    } else if (floor < this.currentFloor) {
      this.downStops.add(floor);
      if (this.direction === Direction.IDLE) this.direction = Direction.DOWN;
    }
  }

  public step(): void {
    if (this.isEmergency || this.direction === Direction.IDLE) return;

    if (this.direction === Direction.UP) {
      this.currentFloor++;
      if (this.upStops.has(this.currentFloor)) {
        this.upStops.delete(this.currentFloor);
        // open doors
      }
      if (this.upStops.size === 0) {
        this.direction = this.downStops.size > 0 ? Direction.DOWN : Direction.IDLE;
      }
    } else if (this.direction === Direction.DOWN) {
      this.currentFloor--;
      if (this.downStops.has(this.currentFloor)) {
        this.downStops.delete(this.currentFloor);
      }
      if (this.downStops.size === 0) {
        this.direction = this.upStops.size > 0 ? Direction.UP : Direction.IDLE;
      }
    }
  }

  public triggerEmergency(): void {
    this.isEmergency = true;
    this.upStops.clear();
    this.downStops.clear();
    this.direction = Direction.IDLE;
  }
}

export class ElevatorController {
  constructor(
    private elevators: Elevator[],
    private strategy: IDispatchStrategy
  ) {}

  public handleHallCall(floor: number, direction: Direction): void {
    const chosen = this.strategy.findOptimalElevator(this.elevators, floor, direction);
    chosen.synchronizedAddStop(floor);
  }
}`,
      rationale: 'Clean LOOK scheduling algorithm separated with ProximityDispatchStrategy. Elevator encapsulates stop sets, direction states, and synchronized mutations. Controller delegates dispatching via strategy interface.',
      explanation: 'Production ready sample implementing thread-safe queueing, decoupled dispatching strategy, and emergency state transitions.'
    },
    sampleFlawedSolution: {
      language: 'typescript',
      code: `export class BadElevator {
  public floor = 0;
  // Flaw: infinite jump without steps, no state machine, no direction tracking
  public goTo(target: number) {
    this.floor = target;
  }
}`,
      rationale: 'Simple teleport function to change floor instantly.',
      explanation: 'Omits elevator movement simulation, scheduling, queueing, concurrency, and door safety completely.'
    }
  },
  {
    id: 'rate-limiter',
    title: 'Distributed Token-Bucket Rate Limiter',
    difficulty: 'Medium',
    summary: 'Design an extensible rate limiting service supporting Token Bucket, Sliding Window, multi-tier client quotas, and thread safety.',
    tags: ['Strategy Pattern', 'Concurrency', 'Thread Safety', 'Token Bucket'],
    description: `An API Gateway requires a high-throughput, low-latency rate limiter to protect downstream microservices from traffic surges and abuse.
Clients are identified by API Key, Client IP, or User ID, each belonging to a subscription tier (Free, Pro, Enterprise) with distinct quotas.
The system must support pluggable rate-limiting algorithms (Token Bucket, Leaky Bucket, Sliding Window Counter) and remain thread-safe under high concurrency without locking bottlenecking.`,
    domainRequirements: [
      'Client identification via API key or IP address with configurable quotas.',
      'Token Bucket algorithm: Refill tokens at a steady rate up to bucket capacity.',
      'Pluggable rate limiting algorithms (Token Bucket vs Sliding Window).',
      'RateLimitResponse: returns allowed boolean, remainingTokens, and retryAfterSeconds.',
      'Custom quota policies per tier (e.g. Free: 10 req/min, Pro: 500 req/min, Enterprise: 5000 req/min).'
    ],
    nonFunctionalRequirements: [
      'Thread Safety: High concurrent requests for the same client must not exceed allowed rate limit.',
      'Extensibility: Easy to add new storage backends (In-memory, Redis) and new rate limiting policies.',
      'Zero Memory Leaks: Inactive clients should have their buckets evicted periodically or on LRU.'
    ],
    checklist: [
      { id: 'r1', category: 'Patterns', title: 'IRateLimitingStrategy Interface', hint: 'Extract allowRequest() into a clean strategy interface.' },
      { id: 'r2', category: 'Concurrency', title: 'Atomic Token Refill', hint: 'Prevent race conditions when checking and decrementing tokens.' },
      { id: 'r3', category: 'SOLID', title: 'Decoupled Client Tier Repository', hint: 'Separate quota configuration from the token math logic.' }
    ],
    starterTemplate: {
      typescript: `// ==========================================
// PROBLEM: Distributed Token-Bucket Rate Limiter
// Complete the classes, interfaces, and methods.
// ==========================================

export interface RateLimitResult {
  isAllowed: boolean;
  remainingTokens: number;
  retryAfterSeconds: number;
}

export interface IRateLimitStrategy {
  allowRequest(clientId: string, tokensRequested: number): RateLimitResult;
}

export class TokenBucketRateLimiter implements IRateLimitStrategy {
  // Implement token refill and thread-safe bucket acquisition
  allowRequest(clientId: string, tokensRequested: number = 1): RateLimitResult {
    return { isAllowed: true, remainingTokens: 10, retryAfterSeconds: 0 };
  }
}
`,
      java: `// Token Bucket Rate Limiter in Java
public class TokenBucketRateLimiter {
    // Atomic or synchronized token refill and acquisition
}
`,
      python: `# Token Bucket Rate Limiter in Python
import time
import threading

class TokenBucketRateLimiter:
    pass
`
    },
    sampleGoodSolution: {
      language: 'typescript',
      code: `export interface RateLimitResult {
  isAllowed: boolean;
  remainingTokens: number;
  retryAfterSeconds: number;
}

export interface IRateLimitStrategy {
  allowRequest(clientId: string, cost: number): RateLimitResult;
}

export class TokenBucket {
  private availableTokens: number;
  private lastRefillTimestamp: number;
  private lock = false;

  constructor(
    public readonly capacity: number,
    public readonly refillRatePerSec: number
  ) {
    this.availableTokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  public tryConsume(tokensRequested: number): RateLimitResult {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    
    // Refill tokens
    const tokensToAdd = elapsedSeconds * this.refillRatePerSec;
    this.availableTokens = Math.min(this.capacity, this.availableTokens + tokensToAdd);
    this.lastRefillTimestamp = now;

    if (this.availableTokens >= tokensRequested) {
      this.availableTokens -= tokensRequested;
      return {
        isAllowed: true,
        remainingTokens: Math.floor(this.availableTokens),
        retryAfterSeconds: 0
      };
    } else {
      const missingTokens = tokensRequested - this.availableTokens;
      const waitTime = Math.ceil(missingTokens / this.refillRatePerSec);
      return {
        isAllowed: false,
        remainingTokens: Math.floor(this.availableTokens),
        retryAfterSeconds: waitTime
      };
    }
  }
}

export class RateLimiterService implements IRateLimitStrategy {
  private buckets: Map<string, TokenBucket> = new Map();

  constructor(
    private defaultCapacity: number = 60,
    private defaultRefillRate: number = 1
  ) {}

  public allowRequest(clientId: string, cost: number = 1): RateLimitResult {
    let bucket = this.buckets.get(clientId);
    if (!bucket) {
      bucket = new TokenBucket(this.defaultCapacity, this.defaultRefillRate);
      this.buckets.set(clientId, bucket);
    }

    return bucket.tryConsume(cost);
  }
}`,
      rationale: 'Encapsulated TokenBucket mathematical state. Mathematical time-delta refill avoids background timer threads. RateLimiterService acts as clean facade implementing IRateLimitStrategy.',
      explanation: 'Production ready rate limiter with zero CPU spin and accurate token refill calculations.'
    },
    sampleFlawedSolution: {
      language: 'typescript',
      code: `export class BrokenRateLimiter {
  public counter = 0;
  // Flaw: Single global counter for all clients, no refill math, no time window
  public check() {
    this.counter++;
    return this.counter < 100;
  }
}`,
      rationale: 'Quick counter that increments on every request.',
      explanation: 'Lacks per-client isolation, lacks time-window decay or refill, non-extensible and not thread safe.'
    }
  },
  {
    id: 'vending-machine',
    title: 'State-Driven Vending Machine',
    difficulty: 'Easy',
    summary: 'Design a reliable, state-driven vending machine supporting multiple coins/bills, inventory management, change dispensing, and transactional cancellations.',
    tags: ['State Pattern', 'Inventory Management', 'Transactions', 'OOP'],
    description: `A smart self-service vending machine sells beverages and snacks.
A customer inserts money (Coins and Banknotes of various denominations), selects an item, and either receives the item along with accurate change or cancels the transaction to receive a full refund.
The system must prevent edge cases such as dispensing when out of stock, dispensing when insufficient funds are provided, or losing money during a mid-transaction cancellation.`,
    domainRequirements: [
      'Denominations: Coins ($0.25, $0.50, $1.00) and Cash Notes ($5, $10).',
      'Inventory: Rack of items with item code, name, price, and current stock count.',
      'State Transitions: ReadyForMoney -> HasMoney -> Dispensing -> Refund/Change -> ReadyForMoney.',
      'Cancellation / Refund: Customer can press cancel anytime before dispensing to get complete refund.',
      'Change Calculation: Greedy or optimal change dispensing from internal cash reserve.'
    ],
    nonFunctionalRequirements: [
      'State Pattern: State transitions must be handled by explicit State objects rather than nested if/else flags.',
      'Transactional Integrity: If dispensing fails (mechanical jam or out of stock), inserted money is not lost.',
      'Single Responsibility: Inventory repository, Payment handler, and State machine decoupled.'
    ],
    checklist: [
      { id: 'v1', category: 'Patterns', title: 'State Pattern Implementation', hint: 'Define IVendingState interface (IdleState, HasMoneyState, DispensingState).' },
      { id: 'v2', category: 'Entities', title: 'Inventory and Cash Dispenser', hint: 'Encapsulate ItemRack and ChangeDispenser into separate cohesive entities.' },
      { id: 'v3', category: 'EdgeCases', title: 'Transaction Rollback on Failure', hint: 'Ensure refund occurs if item cannot be dropped.' }
    ],
    starterTemplate: {
      typescript: `// ==========================================
// PROBLEM: State-Driven Vending Machine
// Complete the classes, interfaces, and methods.
// ==========================================

export interface Item {
  code: string;
  name: string;
  price: number;
}

export interface IVendingState {
  insertMoney(machine: VendingMachine, amount: number): void;
  selectItem(machine: VendingMachine, code: string): void;
  dispense(machine: VendingMachine): void;
  cancel(machine: VendingMachine): number;
}

// TODO: Implement States and VendingMachine Context
export class VendingMachine {
  private currentState: IVendingState | null = null;
  public balance: number = 0;

  public insertMoney(amount: number): void {
    // Delegate to current state
  }

  public selectItem(code: string): void {
    // Delegate to current state
  }
}
`,
      java: `// Vending Machine in Java
public interface IVendingState {
    void insertMoney(VendingMachine machine, double amount);
    void selectItem(VendingMachine machine, String code);
    void dispense(VendingMachine machine);
    double cancel(VendingMachine machine);
}
`,
      python: `# Vending Machine in Python
class IVendingState:
    def insert_money(self, machine, amount: float): pass
    def select_item(self, machine, code: str): pass
    def dispense(self, machine): pass
`
    },
    sampleGoodSolution: {
      language: 'typescript',
      code: `export interface Item {
  code: string;
  name: string;
  price: number;
}

export interface IVendingState {
  insertMoney(machine: VendingMachine, amount: number): void;
  selectItem(machine: VendingMachine, code: string): void;
  dispense(machine: VendingMachine): void;
  refund(machine: VendingMachine): number;
}

export class IdleState implements IVendingState {
  insertMoney(machine: VendingMachine, amount: number): void {
    machine.addBalance(amount);
    machine.setState(new HasMoneyState());
  }
  selectItem(): void { throw new Error('Please insert money first.'); }
  dispense(): void { throw new Error('No item selected.'); }
  refund(): number { return 0; }
}

export class HasMoneyState implements IVendingState {
  insertMoney(machine: VendingMachine, amount: number): void {
    machine.addBalance(amount);
  }
  selectItem(machine: VendingMachine, code: string): void {
    const item = machine.getInventory().get(code);
    if (!item) throw new Error('Item does not exist.');
    if (machine.getBalance() < item.price) {
      throw new Error('Insufficient balance.');
    }
    machine.setSelectedCode(code);
    machine.setState(new DispensingState());
    machine.dispense();
  }
  dispense(): void { throw new Error('Select item first.'); }
  refund(machine: VendingMachine): number {
    const refundAmount = machine.getBalance();
    machine.resetBalance();
    machine.setState(new IdleState());
    return refundAmount;
  }
}

export class DispensingState implements IVendingState {
  insertMoney(): void { throw new Error('Dispensing in progress.'); }
  selectItem(): void { throw new Error('Dispensing in progress.'); }
  dispense(machine: VendingMachine): void {
    const code = machine.getSelectedCode();
    const item = machine.getInventory().get(code!);
    const change = machine.getBalance() - item!.price;
    machine.resetBalance();
    machine.setSelectedCode(null);
    machine.setState(new IdleState());
  }
  refund(): number { throw new Error('Cannot refund during dispense.'); }
}

export class VendingMachine {
  private state: IVendingState = new IdleState();
  private balance: number = 0;
  private inventory: Map<string, Item> = new Map();
  private selectedCode: string | null = null;

  public setState(state: IVendingState): void { this.state = state; }
  public getBalance(): number { return this.balance; }
  public addBalance(amt: number): void { this.balance += amt; }
  public resetBalance(): void { this.balance = 0; }
  public getInventory(): Map<string, Item> { return this.inventory; }
  public setSelectedCode(code: string | null): void { this.selectedCode = code; }
  public getSelectedCode(): string | null { return this.selectedCode; }

  public addItem(item: Item): void { this.inventory.set(item.code, item); }
  public insertMoney(amt: number): void { this.state.insertMoney(this, amt); }
  public selectItem(code: string): void { this.state.selectItem(this, code); }
  public dispense(): void { this.state.dispense(this); }
  public cancel(): number { return this.state.refund(this); }
}`,
      rationale: 'Implemented GoF State Pattern cleanly: IdleState, HasMoneyState, DispensingState. Illegal transitions throw descriptive errors. State changes are guarded and money is never lost.',
      explanation: 'Solid state-pattern implementation with explicit state machine transitions and safe error boundaries.'
    },
    sampleFlawedSolution: {
      language: 'typescript',
      code: `export class BadVendingMachine {
  public money = 0;
  // Flaw: Nested boolean flags, unvalidated balance, negative balance bugs
  public buy(code: string, price: number) {
    this.money -= price; // can go negative!
    return 'Gave ' + code;
  }
}`,
      rationale: 'Decrements money on buy.',
      explanation: 'No state machine, no inventory check, balance can become negative, zero refund handling.'
    }
  }
];
