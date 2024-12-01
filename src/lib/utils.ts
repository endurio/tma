/* global BigInt */

export function strip0x(s: string): string {
  return s.startsWith('0x') ? s.substring(2) : s;
}

export function summary(
  address: string,
  firstSegLength = 6,
  lastSegLength = 6,
  includeHex = true
): string {
  try {
    if (!address) return '';
    const hasHex = address.startsWith('0x');
    if (hasHex) {
      address = address.substring(2);
    }
    const summarizedAddress =
      address.slice(0, firstSegLength) + '...' + address.slice(-lastSegLength);
    return hasHex && includeHex ? '0x' + summarizedAddress : summarizedAddress;
  } catch (err) {
    console.error(err);
    return address;
  }
}

export function extractErrorMessage(error: any): string {
  for (let i = 0; i < 10 && error?.error; ++i) {
    error = error.error;
  }
  return error.message || error.toString();
}

export function extractReason(error: any): string {
  const errorMessage = extractErrorMessage(error);
  const matches = errorMessage.match(/reason="(.*)"/);
  return matches && matches.length > 1 ? matches[1] : errorMessage;
}
