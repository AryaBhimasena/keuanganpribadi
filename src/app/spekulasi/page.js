"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "@/styles/halaman-spekulasi.css";

const TIERS = [
  { min: 0, rate: 0.2, label: "20%" },
  { min: 2185000, rate: 0.15, label: "15%" },
  { min: 4460000, rate: 0.1, label: "10%" },
  { min: 6232000, rate: 0.05, label: "5%" },
];
const PAYOUT = 0.96;
const ROUND = 1000;

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const num = (v) => Number(String(v).replace(/\D/g, "")) || 0;

const tierOf = (balance) =>
  [...TIERS].reverse().find((t) => balance >= t.min) || TIERS[0];

const betOf = (balance) => {
  const t = tierOf(balance);
  return Math.round((balance * t.rate) / ROUND) * ROUND;
};

export default function SpekulasiPage() {
  const [initial, setInitial] = useState(700000);
  const [initialInput, setInitialInput] = useState("700000");
  const [result, setResult] = useState("W");
  const [bet, setBet] = useState("");
  const [history, setHistory] = useState([]);
  const tableScrollRef = useRef(null);

  const balance = history.length
    ? history[history.length - 1].end
    : initial;

  const tier = useMemo(() => tierOf(balance), [balance]);
  const nextBet = useMemo(() => betOf(balance), [balance]);
  const profit = balance - initial;
  const wins = history.filter((x) => x.result === "W").length;
  const losses = history.length - wins;
  const winRate = history.length ? (wins / history.length) * 100 : 0;

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history.length]);

  function applyInitial() {
    const value = num(initialInput);
    if (!value) return;
    setInitial(value);
    setHistory([]);
    setBet("");
  }

  function addPlay() {
    const value = num(bet) || nextBet;
    if (!value) return;

    const pl = result === "W" ? Math.round(value * PAYOUT) : -value;
    const start = balance;
    const end = start + pl;

    setHistory((prev) => [
      ...prev,
      {
        play: prev.length + 1,
        result,
        start,
        tier: tier.label,
        bet: value,
        pl,
        end,
      },
    ]);
    setBet("");
  }

  function reset() {
    setHistory([]);
    setBet("");
    setResult("W");
    setInitialInput(String(initial));
  }

  return (
    <main className="spekulasi-page">
      <div className="spekulasi-shell">

        <header className="spekulasi-header">
          <div>
            <span className="spekulasi-kicker">BANKROLL / SIMULATOR</span>
            <h1>Spekulasi</h1>
          </div>
          <button className="spekulasi-reset" onClick={reset}>Reset</button>
        </header>

        <section className="spekulasi-dashboard">

          <div className="spekulasi-bankroll">
            <span className="spekulasi-label">BANKROLL</span>
            <strong>{rupiah(balance)}</strong>
            <small className={profit >= 0 ? "up" : "down"}>
              {profit >= 0 ? "+" : ""}{rupiah(profit)}
            </small>
          </div>

          <div className="spekulasi-metric">
            <span className="spekulasi-label">TIER</span>
            <strong>{tier.label}</strong>
            <small>Risk per play</small>
          </div>

          <div className="spekulasi-metric">
            <span className="spekulasi-label">BET BERIKUTNYA</span>
            <strong>{rupiah(nextBet)}</strong>
            <small>Auto calculation</small>
          </div>

          <div className="spekulasi-metric">
            <span className="spekulasi-label">PLAY</span>
            <strong>{history.length}</strong>
            <small>W {wins} / L {losses}</small>
          </div>

        </section>

        <section className="spekulasi-workspace">

          <aside className="spekulasi-panel">

            <div className="spekulasi-panel-title">
              <span>CONTROL</span>
              <b>Input Play</b>
            </div>

            <label className="spekulasi-field-label">SALDO AWAL</label>
            <div className="spekulasi-input">
              <span>Rp</span>
              <input
                value={initialInput}
                inputMode="numeric"
                onChange={(e) => setInitialInput(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && applyInitial()}
              />
              <button onClick={applyInitial}>SET</button>
            </div>

            <div className="spekulasi-divider" />

            <label className="spekulasi-field-label">HASIL</label>
            <div className="spekulasi-result-buttons">
              <button
                className={result === "W" ? "active win" : ""}
                onClick={() => setResult("W")}
              >
                <b>W</b><span>WIN</span>
              </button>
              <button
                className={result === "L" ? "active loss" : ""}
                onClick={() => setResult("L")}
              >
                <b>L</b><span>LOSS</span>
              </button>
            </div>

            <label className="spekulasi-field-label">NILAI BET</label>
            <div className="spekulasi-bet-input">
              <span>Rp</span>
              <input
                value={bet}
                placeholder={String(nextBet)}
                inputMode="numeric"
                onChange={(e) => setBet(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && addPlay()}
              />
            </div>

            <button
              className="spekulasi-auto-bet"
              onClick={() => setBet(String(nextBet))}
            >
              Gunakan bet otomatis&nbsp; · &nbsp;{rupiah(nextBet)}
            </button>

            <button className="spekulasi-add" onClick={addPlay}>
              CATAT {result === "W" ? "WIN" : "LOSS"}
              <span>↵</span>
            </button>

            <div className="spekulasi-live">
              <span>POSISI SETELAH PLAY</span>
              <b>
                {result === "W"
                  ? rupiah(balance + Math.round((num(bet) || nextBet) * PAYOUT))
                  : rupiah(balance - (num(bet) || nextBet))}
              </b>
            </div>

          </aside>

          <section className="spekulasi-history-panel">

            <div className="spekulasi-history-head">
              <div>
                <span className="spekulasi-kicker">TRANSACTION LOG</span>
                <h2>History</h2>
              </div>
              <div className="spekulasi-history-summary">
                <span>{history.length} PLAY</span>
                <span>{winRate.toFixed(1)}% WIN RATE</span>
              </div>
            </div>

            <div
              ref={tableScrollRef}
              className="spekulasi-table-scroll"
            >
              {history.length === 0 ? (
                <div className="spekulasi-empty">
                  <b>Belum ada data</b>
                  <span>Pilih W / L, masukkan nominal, lalu catat play.</span>
                </div>
              ) : (
                <table className="spekulasi-table">
                  <thead>
                    <tr>
                      <th>PLAY</th>
                      <th>HASIL</th>
                      <th>SALDO AWAL</th>
                      <th>TIER</th>
                      <th>BET</th>
                      <th>P / L</th>
                      <th>SALDO AKHIR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((x) => (
                      <tr key={x.play}>
                        <td>{x.play}</td>
                        <td>
                          <i className={`result-dot ${x.result === "W" ? "win" : "loss"}`}>
                            {x.result}
                          </i>
                        </td>
                        <td>{rupiah(x.start)}</td>
                        <td>{x.tier}</td>
                        <td>{rupiah(x.bet)}</td>
                        <td className={x.pl >= 0 ? "up" : "down"}>
                          {x.pl >= 0 ? "+" : ""}{rupiah(x.pl)}
                        </td>
                        <td className="ending">{rupiah(x.end)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </section>
        </section>

        <footer className="spekulasi-footer">
          <div>
            <span>20%</span><small>START</small>
          </div>
          <div>
            <span>15%</span><small>Rp2,185 jt+</small>
          </div>
          <div>
            <span>10%</span><small>Rp4,460 jt+</small>
          </div>
          <div>
            <span>5%</span><small>Rp6,232 jt+</small>
          </div>
          <p>Tier otomatis mengikuti posisi bankroll terakhir.</p>
        </footer>

      </div>
    </main>
  );
}