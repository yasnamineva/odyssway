/** Base class for all engine errors. */
export class EngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineError";
  }
}

export class InvalidDateError extends EngineError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDateError";
  }
}

export class InvalidTripError extends EngineError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTripError";
  }
}

export type CannotComputeCode =
  | "unknown_country"
  | "bilateral_agreement_not_available"
  | "bilateral_agreement_unverified"
  | "bilateral_agreement_state_mismatch";

/**
 * Accuracy Policy §3.6: the engine never silently guesses. Any scenario whose
 * legal basis is missing or unverified results in this error, which UIs must
 * surface as "we can't compute this case yet".
 */
export class CannotComputeError extends EngineError {
  readonly code: CannotComputeCode;

  constructor(code: CannotComputeCode, message: string) {
    super(message);
    this.name = "CannotComputeError";
    this.code = code;
  }
}
