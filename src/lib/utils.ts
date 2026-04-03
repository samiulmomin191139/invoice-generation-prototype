// src/lib/utils.ts
export function formatCurrency(amount: number, symbol: string = '£'): string {
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function generateInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}${number.toString().padStart(5, '0')}`;
}

export function numberToWords(num: number): string {
  if (num === 0) return 'ZERO';
  
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const scales = ['', 'THOUSAND', 'MILLION', 'BILLION'];

  function convertHundreds(n: number): string {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' HUNDRED';
      n %= 100;
      if (n > 0) result += ' AND ';
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) result += ' ' + ones[n];
    } else if (n > 0) {
      result += ones[n];
    }
    return result;
  }

  const intPart = Math.floor(Math.abs(num));
  const decPart = Math.round((Math.abs(num) - intPart) * 100);

  if (intPart === 0 && decPart === 0) return 'ZERO';

  let result = '';
  let scaleIndex = 0;
  let remaining = intPart;

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const chunkStr = convertHundreds(chunk);
      if (scaleIndex > 0) {
        result = chunkStr + ' ' + scales[scaleIndex] + (result ? ' ' + result : '');
      } else {
        result = chunkStr;
      }
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex++;
  }

  if (decPart > 0) {
    result += ' AND ' + convertHundreds(decPart) + ' PENCE';
  }

  return result;
}