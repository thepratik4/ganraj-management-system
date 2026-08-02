/**
 * Formats a number as Indian Rupees (e.g. ₹ 12,500)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹ 0';
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹ ${formatted}`;
}

/**
 * Validates whether a phone number is a 10-digit Indian mobile number
 */
export function isValidMobileNumber(phone: string): boolean {
  if (!phone) return true; // optional field check handled separately
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Clean phone number to 10 digits
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, 10);
}

/**
 * Convert number to words in Indian Rupees format (e.g., 5001 -> Five Thousand One Rupees Only)
 */
export function numberToWordsIN(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  if (num < 0) return 'Negative ' + numberToWordsIN(Math.abs(num));

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertChunk(n: number): string {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 !== 0 ? ' and ' + convertChunk(n % 100) : '')
      );
    return '';
  }

  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remaining = num;

  if (crore > 0) {
    result += convertChunk(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertChunk(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertChunk(thousand) + ' Thousand ';
  }
  if (remaining > 0) {
    result += convertChunk(remaining);
  }

  return `${result.trim()} Rupees Only`;
}

/**
 * Convert number to words in Marathi Rupees format (e.g. 5001 -> पाच हजार एक रुपये फक्त)
 */
export function numberToWordsMarathi(num: number): string {
  if (num === 0) return 'शून्य रुपये फक्त';
  if (num < 0) return 'मायनस ' + numberToWordsMarathi(Math.abs(num));

  const units = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा',
    'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस'];
  const tens = ['', '', 'वीस', 'तीस', 'चाळीस', 'पन्नास', 'साठ', 'सत्तर', 'ऐंशी', 'नव्वद'];

  function convertChunk(n: number): string {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' शे ' + (n % 100 !== 0 ? convertChunk(n % 100) : '');
    return '';
  }

  let result = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remaining = num;

  if (crore > 0) result += convertChunk(crore) + ' कोटी ';
  if (lakh > 0) result += convertChunk(lakh) + ' लाख ';
  if (thousand > 0) result += convertChunk(thousand) + ' हजार ';
  if (remaining > 0) result += convertChunk(remaining);

  return `${result.trim()} रुपये फक्त`;
}

