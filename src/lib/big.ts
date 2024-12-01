/* global BigInt */

export function thousands(nStr: string | number, decimal = 4): string {
    nStr = nStr.toString();
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    if (x2.length > decimal + 1) {
        x2 = x2.substring(0, decimal + 1);
    }
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

export function div(a: bigint, b: bigint, bitPrecision = 18): number {
    if (a === BigInt(0)) {
        return 0;
    }
    if (a < b) {
        return 1 / _div(b, a, bitPrecision);
    }
    return _div(a, b, bitPrecision);
}

export function _bitLength(a: bigint): number {
    return a.toString(2).length;
}

export function _bitLengthDiff(a: bigint, b: bigint): number {
    return _bitLength(a) - _bitLength(b);
}

export function _div(a: bigint, b: bigint, bitPrecision = 18): number {
    const resultPrecision = _bitLengthDiff(a, b);
    const toShift = bitPrecision - resultPrecision;
    if (toShift > 0) {
        a <<= BigInt(toShift);
    } else if (toShift < 0) {
        b <<= BigInt(-toShift);
    }
    let c = Number(a / b);
    if (toShift > 0) {
        c >>= toShift;
    } else if (toShift < 0) {
        c <<= -toShift;
    }
    return c;
}

export function intShift(s: string | number, d: number): string | number {
    s = s.toString();
    if (d === 0) {
        return s;
    }
    if (d > 0) {
        return s + '0'.repeat(d);
    } else {
        d = -d;
        if (s.length <= d) {
            return 0;
        }
        return s.substring(0, s.length - d);
    }
}

export function _decShiftPositive(s: string, d: number): string {
    s = s.toString();
    if (d === 0) {
        return s;
    }
    let f = '';
    let p = s.indexOf('.');
    if (p >= 0) {
        f = s.substring(p + 1);
        s = s.substring(0, p);
    }
    if (d > 0) {
        if (d < f.length) {
            s += f.substring(0, d);
            f = f.substring(d);
            s = s.replace(/^0+/g, '');
            if (s.length === 0) {
                s = '0';
            }
            return s + '.' + f;
        }
        s = intShift(s + f, d - f.length) as string;
        s = s.replace(/^0+/g, '');
        if (s.length === 0) {
            s = '0';
        }
        return s;
    }
    d = -d;
    if (d < s.length) {
        f = s.substring(s.length - d) + f;
        s = s.substring(0, s.length - d);
        f = f.replace(/0+$/g, '');
        if (f.length > 0) {
            s += '.' + f;
        }
        return s;
    }
    f = '0'.repeat(d - s.length) + s + f;
    f = f.replace(/0+$/g, '');
    if (f.length > 0) {
        return '0.' + f;
    }
    return '0';
}

export function decShift(s: string | number, d: number): string {
    if (!s) {
        return '0';
    }
    s = String(s);
    if (s.startsWith('0x')) {
        s = BigInt(s).toString();
    }
    if (s[0] === '-') {
        return '-' + _decShiftPositive(s.substring(1), d);
    }
    return _decShiftPositive(s, d);
}

export function floor(s: string): string {
    const pos = s.indexOf('.');
    if (pos < 0) {
        return s;
    }
    return s.slice(0, pos);
}

export function _toShift(s: string): number {
    let p = s.indexOf('.');
    if (p < 0) {
        return 0;
    }
    return s.length - p - 1;
}

export function mul(a: string | number, b: string | number): string {
    if (typeof a !== 'string') {
        a = a.toString();
    }
    if (typeof b !== 'string') {
        b = b.toString();
    }
    const pA = _toShift(a);
    if (pA > 0) {
        a = decShift(a, pA) as string;
    }
    const pB = _toShift(b);
    if (pB > 0) {
        b = decShift(b, pB) as string;
    }
    let c = (BigInt(a) * BigInt(b)).toString();
    const p = pA + pB;
    if (p > 0) {
        c = decShift(c, -p) as string;
    }
    return c;
}

export function precision(s: string, n: number): string {
    let p = s.indexOf('.');
    if (p < 0) {
        return s + '.' + '0'.repeat(n);
    }
    let f = s.substring(p + 1);
    if (f.length === n) {
        return s;
    }
    if (f.length > n) {
        return s.substring(0, p + n + 1);
    }
    return s + '0'.repeat(n - f.length);
}
