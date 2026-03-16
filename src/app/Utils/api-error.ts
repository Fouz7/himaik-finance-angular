function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asReadableMessage(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const message = value.trim();
  return message ? message : undefined;
}

function isHttpFailureMessage(value: string): boolean {
  return value.startsWith('Http failure response');
}

function parsePossibleJsonString(value: string): unknown {
  const trimmedValue = value.trim();
  if (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('[')) {
    return value;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return value;
  }
}

function getNestedMessage(source: Record<string, unknown>): string | undefined {
  const nestedError = source['error'];
  if (typeof nestedError === 'string') {
    const parsedNestedError = parsePossibleJsonString(nestedError);
    if (isRecord(parsedNestedError)) {
      const nestedMessage = getNestedMessage(parsedNestedError);
      if (nestedMessage) {
        return nestedMessage;
      }
    }

    const stringMessage = asReadableMessage(nestedError);
    if (stringMessage && !isHttpFailureMessage(stringMessage)) {
      return stringMessage;
    }
  }

  if (isRecord(nestedError)) {
    const nestedMessage = getNestedMessage(nestedError);
    if (nestedMessage) {
      return nestedMessage;
    }
  }

  const directMessage = asReadableMessage(source['message']);
  if (directMessage && !isHttpFailureMessage(directMessage)) {
    return directMessage;
  }

  return undefined;
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  const directError = asReadableMessage(error);
  if (directError) {
    return directError;
  }

  if (!isRecord(error)) {
    return fallback;
  }

  const responseMessage = getNestedMessage(error);
  if (responseMessage) {
    return responseMessage;
  }

  return fallback;
}


