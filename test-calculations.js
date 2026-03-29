/**
 * Rehab Cost Estimator - Calculation Verification Test Harness
 * Extracts and tests all math/calculation functions from rehab-cost-estimator.html
 * Run: node test-calculations.js
 */

// ============================================================
// EXTRACTED FUNCTIONS (verbatim from the source HTML)
// ============================================================

function calcLineTotal(qty, cost) {
  const q = parseFloat(qty) || 0;
  const c = parseFloat(cost) || 0;
  return q * c;
}

function parseCurrency(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^0-9.\-]/g, '')) || 0;
}

function stripNum(val) {
  return val ? parseInt(String(val).replace(/[^0-9]/g, ''), 10) || '' : '';
}

function fmtMoney(n) {
  if (!n && n !== 0) return '$0';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtMoneyPDF(n) {
  if (!n && n !== 0) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Simulate lineItemData structure for calcCategorySubtotal and calcStepTotal
let lineItemData = { exterior: {}, interior: {}, mechanical: {} };

function calcCategorySubtotal(catId, dataKey) {
  const catData = lineItemData[dataKey]?.[catId];
  if (!catData) return 0;
  let total = 0;
  for (const key of Object.keys(catData)) {
    if (key === 'custom') {
      (catData.custom || []).forEach(ci => { total += calcLineTotal(ci.qty, ci.cost); });
    } else {
      total += calcLineTotal(catData[key].qty, catData[key].cost);
    }
  }
  return total;
}

function calcStepTotal(dataKey) {
  const data = lineItemData[dataKey];
  if (!data) return 0;
  let total = 0;
  for (const catId of Object.keys(data)) {
    total += calcCategorySubtotal(catId, dataKey);
  }
  return total;
}

// Grand total formula (extracted from updateSummary, lines 2658-2675)
function calcGrandTotal(subtotal, contingencyPct, opPct, permits, holding) {
  const contingencyAmt = subtotal * (contingencyPct / 100);
  const opAmt = subtotal * (opPct / 100);
  return subtotal + contingencyAmt + opAmt + permits + holding;
}

// Cost per sqft (from updateSummary, line 2675)
function calcCostPerSqft(grandTotal, sqft) {
  return sqft > 0 ? grandTotal / sqft : 0;
}

// Invoice tax (from generateInvoicePDF, line 3315)
function calcInvoiceTax(subtotal, taxRate) {
  return subtotal * (taxRate / 100);
}

// Invoice totalDue (from generateInvoicePDF, line 3316)
function calcInvoiceTotalDue(subtotal, taxAmt, contingencyAmt, opAmt) {
  return subtotal + taxAmt + contingencyAmt + opAmt;
}

// Invoice balanceDue (from generateInvoicePDF, line 3317)
function calcInvoiceBalanceDue(totalDue, depositPaid) {
  return depositPaid > 0 ? totalDue - depositPaid : totalDue;
}


// ============================================================
// TEST FRAMEWORK
// ============================================================

let totalTests = 0;
let passCount = 0;
let failCount = 0;
const failures = [];

function assertClose(actual, expected, tolerance, label) {
  totalTests++;
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passCount++;
  } else {
    failCount++;
    failures.push({ label, expected, actual, diff, tolerance });
    console.log(`  FAIL: ${label}`);
    console.log(`        Expected: ${expected}, Actual: ${actual}, Diff: ${diff.toFixed(6)}`);
  }
}

function assertEqual(actual, expected, label) {
  totalTests++;
  if (actual === expected) {
    passCount++;
  } else {
    failCount++;
    failures.push({ label, expected, actual, diff: 'exact mismatch' });
    console.log(`  FAIL: ${label}`);
    console.log(`        Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

function section(name) {
  console.log(`\n--- ${name} ---`);
}


// ============================================================
// TEST CASES
// ============================================================

// ---- 1. calcLineTotal (qty x cost) ----
section('1. calcLineTotal (qty * cost)');

assertClose(calcLineTotal(10, 25), 250, 0.001, 'Basic: 10 x $25 = $250');
assertClose(calcLineTotal(0, 100), 0, 0.001, 'Zero qty: 0 x $100 = $0');
assertClose(calcLineTotal(5, 0), 0, 0.001, 'Zero cost: 5 x $0 = $0');
assertClose(calcLineTotal(0, 0), 0, 0.001, 'Both zero: 0 x 0 = $0');
assertClose(calcLineTotal(1.5, 800), 1200, 0.001, 'Decimal qty: 1.5 x $800 = $1200');
assertClose(calcLineTotal(3, 1499.99), 4499.97, 0.001, 'Decimal cost: 3 x $1499.99 = $4499.97');
assertClose(calcLineTotal(100, 15000), 1500000, 0.001, 'Large: 100 x $15000 = $1,500,000');
assertClose(calcLineTotal('5', '200'), 1000, 0.001, 'String inputs: "5" x "200" = $1000');
assertClose(calcLineTotal(null, 100), 0, 0.001, 'Null qty returns 0');
assertClose(calcLineTotal(5, undefined), 0, 0.001, 'Undefined cost returns 0');
assertClose(calcLineTotal('abc', 100), 0, 0.001, 'Non-numeric qty returns 0');
assertClose(calcLineTotal(5, 'xyz'), 0, 0.001, 'Non-numeric cost returns 0');
assertClose(calcLineTotal(0.333, 300), 99.9, 0.001, 'Fractional: 0.333 x $300 = $99.90');
assertClose(calcLineTotal(-2, 500), -1000, 0.001, 'Negative qty: -2 x $500 = -$1000');
assertClose(calcLineTotal(2, -500), -1000, 0.001, 'Negative cost: 2 x -$500 = -$1000');


// ---- 2. calcCategorySubtotal ----
section('2. calcCategorySubtotal');

// Reset lineItemData
lineItemData = { exterior: {}, interior: {}, mechanical: {} };

// Empty category
assertClose(calcCategorySubtotal('roof', 'exterior'), 0, 0.001, 'Empty category = $0');

// Category with standard items
lineItemData.exterior = {
  roof: {
    shingles: { qty: 30, cost: 85, notes: '' },
    flashing: { qty: 1, cost: 350, notes: '' },
    gutters: { qty: 120, cost: 12, notes: '' },
  }
};
// Expected: 30*85 + 1*350 + 120*12 = 2550 + 350 + 1440 = 4340
assertClose(calcCategorySubtotal('roof', 'exterior'), 4340, 0.01, 'Roof std items: 30x85 + 1x350 + 120x12 = $4340');

// Category with custom items
lineItemData.exterior.roof.custom = [
  { name: 'Custom ridge vent', qty: 2, cost: 75, unit: 'each' },
  { name: 'Ice shield', qty: 10, cost: 25, unit: 'sqft' },
];
// Expected: 4340 + 2*75 + 10*25 = 4340 + 150 + 250 = 4740
assertClose(calcCategorySubtotal('roof', 'exterior'), 4740, 0.01, 'Roof with custom items: $4340 + $150 + $250 = $4740');

// Category with zero-qty custom items (should not add)
lineItemData.exterior.siding = {
  vinyl: { qty: 0, cost: 500, notes: '' },
  custom: [
    { name: 'Zero item', qty: 0, cost: 100, unit: 'each' },
  ]
};
assertClose(calcCategorySubtotal('siding', 'exterior'), 0, 0.001, 'All-zero items = $0');

// Non-existent category
assertClose(calcCategorySubtotal('nonexistent', 'exterior'), 0, 0.001, 'Non-existent category = $0');


// ---- 3. calcStepTotal ----
section('3. calcStepTotal');

// Reset
lineItemData = { exterior: {}, interior: {}, mechanical: {} };
assertClose(calcStepTotal('exterior'), 0, 0.001, 'Empty exterior = $0');

lineItemData.exterior = {
  roof: {
    shingles: { qty: 10, cost: 100, notes: '' },
  },
  siding: {
    vinyl: { qty: 5, cost: 200, notes: '' },
  }
};
// Expected: 10*100 + 5*200 = 1000 + 1000 = 2000
assertClose(calcStepTotal('exterior'), 2000, 0.01, 'Exterior: roof $1000 + siding $1000 = $2000');

lineItemData.interior = {
  kitchen: {
    cabinets: { qty: 1, cost: 5000, notes: '' },
    countertops: { qty: 30, cost: 75, notes: '' },
    custom: [
      { name: 'Backsplash', qty: 40, cost: 15, unit: 'sqft' },
    ]
  }
};
// Expected: 1*5000 + 30*75 + 40*15 = 5000 + 2250 + 600 = 7850
assertClose(calcStepTotal('interior'), 7850, 0.01, 'Interior: kitchen $5000 + $2250 + $600 = $7850');

lineItemData.mechanical = {
  plumbing: {
    waterHeater: { qty: 1, cost: 1200, notes: '' },
  }
};
assertClose(calcStepTotal('mechanical'), 1200, 0.01, 'Mechanical: plumbing $1200');


// ---- 4. Grand Total (subtotal + contingency + O&P + permits + holding) ----
section('4. Grand Total Formula');

// subtotal=10000, 10% contingency, 0% O&P, $500 permits, $300 holding
// Expected: 10000 + 1000 + 0 + 500 + 300 = 11800
assertClose(calcGrandTotal(10000, 10, 0, 500, 300), 11800, 0.01, 'Standard: $10K + 10% cont + $500 perm + $300 hold = $11,800');

// 0% contingency
assertClose(calcGrandTotal(50000, 0, 0, 0, 0), 50000, 0.01, '0% contingency: $50K stays $50K');

// 25% contingency
// 50000 + 12500 = 62500
assertClose(calcGrandTotal(50000, 25, 0, 0, 0), 62500, 0.01, '25% contingency: $50K + $12,500 = $62,500');

// O&P 15%
// 50000 + 5000(10%) + 7500(15%) = 62500
assertClose(calcGrandTotal(50000, 10, 15, 0, 0), 62500, 0.01, '10% cont + 15% O&P: $50K + $5K + $7.5K = $62,500');

// All adjustments
// 100000 + 10000(10%) + 20000(20%) + 2500 + 3000 = 135500
assertClose(calcGrandTotal(100000, 10, 20, 2500, 3000), 135500, 0.01, 'All adjustments: $100K + $10K + $20K + $2.5K + $3K = $135,500');

// Zero subtotal
assertClose(calcGrandTotal(0, 10, 15, 0, 0), 0, 0.01, 'Zero subtotal = $0 regardless of percentages');

// Large numbers
// 2000000 + 200000(10%) + 0 + 5000 + 10000 = 2215000
assertClose(calcGrandTotal(2000000, 10, 0, 5000, 10000), 2215000, 0.01, 'Large: $2M + 10% cont + $5K + $10K = $2,215,000');

// Fractional percentages
// 75000 + 5625(7.5%) + 3000(4%) = 83625
assertClose(calcGrandTotal(75000, 7.5, 4, 0, 0), 83625, 0.01, 'Fractional %: $75K + 7.5% + 4% = $83,625');


// ---- 5. Cost per Square Foot ----
section('5. Cost per Square Foot');

assertClose(calcCostPerSqft(50000, 1500), 33.333333, 0.01, '$50K / 1500 sqft = $33.33/sqft');
assertClose(calcCostPerSqft(135500, 2000), 67.75, 0.01, '$135,500 / 2000 sqft = $67.75/sqft');
assertClose(calcCostPerSqft(0, 1500), 0, 0.001, '$0 / 1500 sqft = $0/sqft');
assertClose(calcCostPerSqft(50000, 0), 0, 0.001, '$50K / 0 sqft = $0 (no division by zero)');
assertClose(calcCostPerSqft(0, 0), 0, 0.001, '$0 / 0 sqft = $0');
assertClose(calcCostPerSqft(1000000, 800), 1250, 0.01, '$1M / 800 sqft = $1250/sqft');


// ---- 6. Invoice Tax ----
section('6. Invoice Tax Calculation');

assertClose(calcInvoiceTax(10000, 0), 0, 0.001, '0% tax on $10K = $0');
assertClose(calcInvoiceTax(10000, 8.875), 887.50, 0.01, '8.875% tax on $10K = $887.50');
assertClose(calcInvoiceTax(0, 8.875), 0, 0.001, '8.875% tax on $0 = $0');
assertClose(calcInvoiceTax(50000, 6.25), 3125, 0.01, '6.25% tax on $50K = $3,125');
assertClose(calcInvoiceTax(123456.78, 10), 12345.678, 0.01, '10% tax on $123,456.78 = $12,345.68');
assertClose(calcInvoiceTax(1, 100), 1, 0.001, '100% tax on $1 = $1');


// ---- 7. Invoice Total Due ----
section('7. Invoice Total Due');

// totalDue = subtotal + taxAmt + contingencyAmt + opAmt
// NOTE: This formula does NOT include permits and holding costs.
// The estimate grandTotal does include permits+holding, but the invoice totalDue does not.
assertClose(calcInvoiceTotalDue(10000, 887.50, 1000, 0), 11887.50, 0.01, 'totalDue: $10K + $887.50 tax + $1K cont = $11,887.50');
assertClose(calcInvoiceTotalDue(50000, 0, 5000, 7500), 62500, 0.01, 'totalDue: $50K + $0 tax + $5K cont + $7.5K O&P = $62,500');
assertClose(calcInvoiceTotalDue(0, 0, 0, 0), 0, 0.001, 'totalDue: all zeros = $0');


// ---- 8. Invoice Balance Due ----
section('8. Invoice Balance Due');

assertClose(calcInvoiceBalanceDue(11887.50, 0), 11887.50, 0.01, 'No deposit: balance = totalDue ($11,887.50)');
assertClose(calcInvoiceBalanceDue(11887.50, 2000), 9887.50, 0.01, '$2K deposit: $11,887.50 - $2,000 = $9,887.50');
assertClose(calcInvoiceBalanceDue(11887.50, 11887.50), 0, 0.01, 'Full deposit: balance = $0');
assertClose(calcInvoiceBalanceDue(10000, 15000), -5000, 0.01, 'Overpayment: $10K - $15K = -$5,000');
assertClose(calcInvoiceBalanceDue(10000, -500), 10000, 0.01, 'Negative deposit (invalid): depositPaid > 0 is false, so balance = totalDue');


// ---- 9. parseCurrency ----
section('9. parseCurrency');

assertClose(parseCurrency('$1,234.56'), 1234.56, 0.001, 'Parses "$1,234.56" = 1234.56');
assertClose(parseCurrency('$0'), 0, 0.001, 'Parses "$0" = 0');
assertClose(parseCurrency(''), 0, 0.001, 'Empty string = 0');
assertClose(parseCurrency(null), 0, 0.001, 'Null = 0');
assertClose(parseCurrency(undefined), 0, 0.001, 'Undefined = 0');
assertClose(parseCurrency('abc'), 0, 0.001, 'Non-numeric = 0');
assertClose(parseCurrency('$-500.00'), -500, 0.001, 'Negative: "$-500.00" = -500');
assertClose(parseCurrency(1234), 1234, 0.001, 'Number input: 1234 = 1234');
assertClose(parseCurrency('$12,345,678.90'), 12345678.90, 0.01, 'Large: "$12,345,678.90"');


// ---- 10. stripNum ----
section('10. stripNum');

assertEqual(stripNum('1,500'), 1500, 'stripNum("1,500") = 1500');
assertEqual(stripNum('abc'), '', 'stripNum("abc") = "" (empty string)');
assertEqual(stripNum(''), '', 'stripNum("") = "" (empty string)');
assertEqual(stripNum(null), '', 'stripNum(null) = ""');
assertEqual(stripNum('2000'), 2000, 'stripNum("2000") = 2000');
assertEqual(stripNum('1,234,567'), 1234567, 'stripNum("1,234,567") = 1234567');
// NOTE: stripNum uses parseInt, so it truncates decimals
assertEqual(stripNum('1500.75'), 150075, 'stripNum("1500.75") = 150075 (strips dot, parseInt all digits)');


// ---- 11. fmtMoney ----
section('11. fmtMoney formatting');

assertEqual(fmtMoney(0), '$0', 'fmtMoney(0) = "$0"');
assertEqual(fmtMoney(1234), '$1,234', 'fmtMoney(1234) = "$1,234"');
assertEqual(fmtMoney(1234567), '$1,234,567', 'fmtMoney(1234567) = "$1,234,567"');
assertEqual(fmtMoney(99.50), '$100', 'fmtMoney(99.50) rounds to "$100"');
assertEqual(fmtMoney(99.49), '$99', 'fmtMoney(99.49) rounds to "$99"');
assertEqual(fmtMoney(null), '$0', 'fmtMoney(null) = "$0"');
assertEqual(fmtMoney(undefined), '$0', 'fmtMoney(undefined) = "$0"');
assertEqual(fmtMoney(''), '$0', 'fmtMoney("") = "$0"');
// BUG: fmtMoney(-500) produces "$-500" instead of the conventional "-$500".
// The function prepends "$" before the locale string, which already has the minus sign.
// Documenting actual behavior here:
assertEqual(fmtMoney(-500), '$-500', 'fmtMoney(-500) = "$-500" (known formatting bug: $ before minus)');
assertEqual(fmtMoney(NaN), '$0', 'fmtMoney(NaN) = "$0"');


// ---- 12. fmtMoneyPDF ----
section('12. fmtMoneyPDF formatting');

assertEqual(fmtMoneyPDF(0), '$0.00', 'fmtMoneyPDF(0) = "$0.00"');
assertEqual(fmtMoneyPDF(1234.56), '$1,234.56', 'fmtMoneyPDF(1234.56) = "$1,234.56"');
assertEqual(fmtMoneyPDF(1234), '$1,234.00', 'fmtMoneyPDF(1234) = "$1,234.00"');
assertEqual(fmtMoneyPDF(null), '$0.00', 'fmtMoneyPDF(null) = "$0.00"');
assertEqual(fmtMoneyPDF(undefined), '$0.00', 'fmtMoneyPDF(undefined) = "$0.00"');
assertEqual(fmtMoneyPDF(NaN), '$0.00', 'fmtMoneyPDF(NaN) = "$0.00"');


// ---- 13. Full Integration: Multi-step estimate ----
section('13. Full Integration Scenario');

lineItemData = {
  exterior: {
    roof: {
      shingles: { qty: 30, cost: 85, notes: '' },
      flashing: { qty: 1, cost: 350, notes: '' },
      custom: [
        { name: 'Ridge caps', qty: 25, cost: 8, unit: 'lf' },
      ]
    },
    siding: {
      vinyl: { qty: 1200, cost: 6.50, notes: '' },
    }
  },
  interior: {
    kitchen: {
      cabinets: { qty: 1, cost: 8500, notes: '' },
      countertops: { qty: 45, cost: 65, notes: '' },
    },
    bathroom: {
      tub: { qty: 2, cost: 450, notes: '' },
      tile: { qty: 150, cost: 12, notes: '' },
      custom: [
        { name: 'Vanity', qty: 2, cost: 380, unit: 'each' },
      ]
    },
    flooring: {
      lvp: { qty: 1500, cost: 4.50, notes: '' },
    }
  },
  mechanical: {
    plumbing: {
      waterHeater: { qty: 1, cost: 1800, notes: '' },
      roughIn: { qty: 2, cost: 350, notes: '' },
    },
    electrical: {
      panel: { qty: 1, cost: 2200, notes: '' },
      outlets: { qty: 30, cost: 15, notes: '' },
    }
  }
};

// Exterior: roof = 30*85 + 1*350 + 25*8 = 2550 + 350 + 200 = 3100
//           siding = 1200*6.50 = 7800
//           extTotal = 3100 + 7800 = 10900
const extTotal = calcStepTotal('exterior');
assertClose(extTotal, 10900, 0.01, 'Exterior total = $10,900');

// Interior: kitchen = 1*8500 + 45*65 = 8500 + 2925 = 11425
//           bathroom = 2*450 + 150*12 + 2*380 = 900 + 1800 + 760 = 3460
//           flooring = 1500*4.50 = 6750
//           intTotal = 11425 + 3460 + 6750 = 21635
const intTotal = calcStepTotal('interior');
assertClose(intTotal, 21635, 0.01, 'Interior total = $21,635');

// Mechanical: plumbing = 1*1800 + 2*350 = 1800 + 700 = 2500
//             electrical = 1*2200 + 30*15 = 2200 + 450 = 2650
//             mechTotal = 2500 + 2650 = 5150
const mechTotal = calcStepTotal('mechanical');
assertClose(mechTotal, 5150, 0.01, 'Mechanical total = $5,150');

// Subtotal = 10900 + 21635 + 5150 = 37685
const subtotal = extTotal + intTotal + mechTotal;
assertClose(subtotal, 37685, 0.01, 'Subtotal = $37,685');

// Grand total with 10% contingency, 0% O&P, $1500 permits, $2000 holding
// 37685 + 3768.50 + 0 + 1500 + 2000 = 44953.50
const grandTotal = calcGrandTotal(subtotal, 10, 0, 1500, 2000);
assertClose(grandTotal, 44953.50, 0.01, 'Grand total = $44,953.50');

// Cost per sqft (1800 sqft)
const costSqft = calcCostPerSqft(grandTotal, 1800);
assertClose(costSqft, 24.974167, 0.01, 'Cost/sqft = $24.97');

// Invoice: 8.875% tax on subtotal, 10% contingency, 0% O&P
const taxAmt = calcInvoiceTax(subtotal, 8.875);
// 37685 * 0.08875 = 3344.54375
assertClose(taxAmt, 3344.54375, 0.01, 'Invoice tax (8.875%) = $3,344.54');

const contingencyAmt = subtotal * 0.10; // 3768.50
const invoiceTotalDue = calcInvoiceTotalDue(subtotal, taxAmt, contingencyAmt, 0);
// 37685 + 3344.54375 + 3768.50 + 0 = 44798.04375
assertClose(invoiceTotalDue, 44798.04375, 0.01, 'Invoice total due = $44,798.04');

const balanceDue = calcInvoiceBalanceDue(invoiceTotalDue, 5000);
// 44798.04375 - 5000 = 39798.04375
assertClose(balanceDue, 39798.04375, 0.01, 'Invoice balance due (after $5K deposit) = $39,798.04');


// ---- 14. Edge Cases ----
section('14. Edge Cases');

// All zeros
lineItemData = { exterior: {}, interior: {}, mechanical: {} };
assertClose(calcStepTotal('exterior'), 0, 0.001, 'Empty exterior step = $0');
assertClose(calcGrandTotal(0, 10, 15, 0, 0), 0, 0.001, 'Grand total of $0 subtotal = $0');
assertClose(calcCostPerSqft(0, 0), 0, 0.001, 'Cost/sqft: $0 / 0sqft = $0 (no crash)');

// Very large numbers
lineItemData = {
  exterior: {
    bigCat: {
      bigItem: { qty: 10000, cost: 500, notes: '' },
    }
  },
  interior: {},
  mechanical: {}
};
assertClose(calcStepTotal('exterior'), 5000000, 0.01, 'Large: 10000 x $500 = $5,000,000');
const bigGrand = calcGrandTotal(5000000, 10, 20, 10000, 5000);
// 5000000 + 500000 + 1000000 + 10000 + 5000 = 6515000
assertClose(bigGrand, 6515000, 0.01, 'Large grand total = $6,515,000');

// Decimal quantities
lineItemData.exterior = {
  decCat: {
    halfItem: { qty: 1.5, cost: 800, notes: '' },
    thirdItem: { qty: 0.333, cost: 600, notes: '' },
  }
};
// 1.5*800 + 0.333*600 = 1200 + 199.80 = 1399.80
assertClose(calcStepTotal('exterior'), 1399.80, 0.01, 'Decimal qty: 1.5x800 + 0.333x600 = $1,399.80');

// Negative balance due (deposit > total)
assertClose(calcInvoiceBalanceDue(5000, 8000), -3000, 0.01, 'Overpayment: $5K total - $8K deposit = -$3,000');

// Very small amounts
assertClose(calcLineTotal(0.01, 0.01), 0.0001, 0.00001, 'Tiny: 0.01 x $0.01 = $0.0001');


// ---- 15. Bug Analysis: Invoice vs Estimate formula differences ----
section('15. Bug Analysis: Invoice vs Estimate formula differences');

// The ESTIMATE grand total = subtotal + contingency + O&P + permits + holding
// The INVOICE totalDue      = subtotal + tax + contingency + O&P  (NO permits, NO holding)
// This is a DESIGN DECISION worth noting, not necessarily a bug.

const testSubtotal = 50000;
const testContAmt = testSubtotal * 0.10;  // 5000
const testOpAmt = testSubtotal * 0.15;    // 7500
const testTax = testSubtotal * 0.08875;   // 4437.50
const testPermits = 2000;
const testHolding = 1500;

const estimateGrand = calcGrandTotal(testSubtotal, 10, 15, testPermits, testHolding);
// 50000 + 5000 + 7500 + 2000 + 1500 = 66000
assertClose(estimateGrand, 66000, 0.01, 'Estimate grand total = $66,000');

const invoiceTotal = calcInvoiceTotalDue(testSubtotal, testTax, testContAmt, testOpAmt);
// 50000 + 4437.50 + 5000 + 7500 = 66937.50
assertClose(invoiceTotal, 66937.50, 0.01, 'Invoice total due = $66,937.50');

// These are intentionally different: estimate has permits+holding but no tax;
// invoice has tax but no permits+holding.
console.log('  NOTE: Estimate includes permits+holding but NOT tax.');
console.log('  NOTE: Invoice includes tax but NOT permits+holding.');
console.log('  This is by design, but users should be aware of the difference.');


// ---- 16. fmtMoney edge case: NaN behavior ----
section('16. fmtMoney NaN/falsy edge cases');

// fmtMoney checks: if (!n && n !== 0) return '$0'
// NaN: !NaN = true, NaN !== 0 = true => returns '$0'. Good.
assertEqual(fmtMoney(NaN), '$0', 'fmtMoney(NaN) = "$0"');
// false: !false = true, false !== 0 = false => falls through to Number(false).toLocaleString = "0" => "$0". Good.
assertEqual(fmtMoney(false), '$0', 'fmtMoney(false) = "$0"');


// ---- 17. stripNum truncates decimals (potential issue) ----
section('17. stripNum behavior with decimals');

// stripNum strips non-digits then parseInt. "1500.75" -> "150075" -> 150075
// This is used for sqft field. If a user types "1,500.5", stripNum returns 15005.
// This could be a BUG if sqft field should support decimals.
const stripped = stripNum('1,500.5');
assertEqual(stripped, 15005, 'stripNum("1,500.5") = 15005 (WARNING: decimal point stripped, digits concatenated)');
console.log('  WARNING: stripNum removes the decimal point and concatenates all digits.');
console.log('  "1,500.5" becomes "15005" instead of 1500 or 1500.5.');
console.log('  This affects the sqft field and could cause incorrect cost/sqft calculations.');


// ============================================================
// SUMMARY
// ============================================================

console.log('\n============================================================');
console.log('VERIFICATION SUMMARY');
console.log('============================================================');
console.log(`Total tests: ${totalTests}`);
console.log(`Passed:      ${passCount}`);
console.log(`Failed:      ${failCount}`);

if (failures.length > 0) {
  console.log('\nFAILURES:');
  failures.forEach(f => {
    console.log(`  - ${f.label}`);
    console.log(`    Expected: ${f.expected}, Actual: ${f.actual}, Diff: ${f.diff}`);
  });
}

if (failCount === 0) {
  console.log('\nVERDICT: ALL PASS');
  console.log('All calculation formulas produce correct results within tolerance.');
} else {
  console.log(`\nVERDICT: FAILURES FOUND (${failCount} of ${totalTests} tests failed)`);
}

console.log('\n--- DESIGN NOTES ---');
console.log('1. Invoice totalDue excludes permits and holding costs (by design).');
console.log('   Estimate grandTotal excludes tax (by design).');
console.log('   These are different totals for different purposes.');
console.log('2. stripNum("1,500.5") => 15005. The decimal point is stripped as');
console.log('   a non-digit character, then all remaining digits are concatenated.');
console.log('   This is a potential bug for sqft if users enter fractional values.');
console.log('3. Invoice balance can go negative when deposit > total.');
console.log('   The PDF will display a negative balance. No floor/clamp at $0.');

process.exit(failCount > 0 ? 1 : 0);
