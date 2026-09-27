// Chart-ready figures for "Will the money last?", all derived from fund.json.
// Update fund.json when new reports come out; the page follows.
import fund from "./fund.json" with { type: "json" };
import copy from "./fundPage.json" with { type: "json" };

const M = (n) => n / 1e6;
const pct = (v, max) => ((Math.max(0, v) / max) * 100).toFixed(2) + "%";
const round1 = (n) => (Math.round(n * 10 + 1e-9) / 10).toFixed(1);

export default function () {
  const p = fund.fy2026Projection;
  const outMax = Math.abs(M(p.benefitsAt75));

  const flows = [
    { label: "Government payment", value: M(p.cnmiPayment), color: "sage", out: false },
    { label: "Investment earnings (expected)", value: M(p.investmentEarnings), color: "sage-muted", out: false },
    { label: "Pensions paid at 75%", value: Math.abs(M(p.benefitsAt75)), color: "terracotta", out: true },
    { label: "Running the Fund", value: Math.abs(M(p.expenses)), color: "terracotta-soft", out: true },
  ].map((f) => ({ ...f, v: (f.out ? "− $" : "+ $") + round1(f.value) + "M", w: pct(f.value, outMax) }));

  // Projected balance FY 2026–2050 (zero once the account is spent).
  const bal = fund.projectedEndingBalanceMillions;
  const first = bal["2026"];
  const balance = [];
  for (let y = 2026; y <= 2050; y++) {
    const v = bal[y] ?? 0;
    balance.push({
      y,
      v,
      h: Math.max((v / first) * 100, 0.6).toFixed(2) + "%",
      color: y >= 2047 ? "terracotta" : y === 2026 ? "forest" : "sage",
      label: (y - 2026) % 4 === 0 || y === 2048 ? "ʼ" + String(y).slice(2) : "",
    });
  }

  const proj = fund.cnmiPaymentsProjected;
  const govRows = [
    ["FY 2025 (paid)", M(fund.cnmiPaymentsHistory["2025"])],
    ...["2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033"].map((y) => ["FY " + y, M(proj[y])]),
    ["2034–2047", M(proj["2034_2047_each"])],
  ];
  const govMax = Math.max(...govRows.map((r) => r[1]));
  const govpay = govRows.map(([y, v], i) => ({
    y,
    v: "$" + (Number.isInteger(v) ? v : v.toFixed(1)) + "M",
    w: pct(v, govMax),
    color: i === 0 ? "sage-muted" : i === 1 ? "almond" : "sage-pale",
  }));

  const inv = fund.investments;
  const goal = fund.assumedReturn * 100;
  const maxR = 10;
  const returns = copy.returns.map((r) => {
    const v = inv.returnsNetOfFees[r.key];
    return { label: r.label, v: v.toFixed(2) + "%", w: pct(v, maxR), above: v >= goal };
  });

  const allocation = copy.allocation.map((a) => ({ ...a, pct: round1(inv.allocationPct[a.key]) }));

  const m = fund.members;
  const people = [
    { v: m.total.toLocaleString("en-US"), label: "members in total", note: `As of 30 September 2025, down from ${m.totalPriorYear.toLocaleString("en-US")} a year earlier.` },
    { v: m.receiving.toLocaleString("en-US"), label: "receiving a benefit", note: `${m.healthyRetirees.toLocaleString("en-US")} retirees, ${m.survivingSpouses} surviving spouses, ${m.childPensioners} children and others.` },
    { v: String(Math.round(m.averageAge)), label: "average age", note: "Across everyone receiving or waiting for a benefit." },
    { v: String(m.averageRemainingLifeExpectancy), label: "years of life expected, on average", note: "This is what the plan is built around." },
  ];

  const health = fund.healthInsurance.fy2027RetireeCost;

  return {
    startBalance: "$" + round1(M(p.beginningBalance)) + "M",
    endBalance: "$" + round1(M(p.endingBalance)) + "M",
    invested: "$" + round1(M(inv.marketValue)) + "M",
    goal: goal.toFixed(1),
    goalLeft: pct(goal, maxR),
    healthTotal: "$" + round1(M(health.health + health.life)) + "M",
    healthSplit: `About $${round1(M(health.health))}M for retiree health and $${Math.round(health.life / 1000)}K for retiree life insurance`,
    finalInstallment: "$" + round1(M(fund.fy2026PaymentStatus.finalInstallment)) + " million",
    required2026: "$" + M(fund.fy2026PaymentStatus.required) + " million",
    flows,
    balance,
    govpay,
    returns,
    allocation,
    people,
  };
}
