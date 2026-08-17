"use client";

import { useMemo, useState } from "react";
import "@/styles/strategi.css";

const PERIODE = ["Pagi", "Siang", "Sore"];
const JUMLAH_HARI = 7;

// =========================================================
// HELPER TANGGAL LOCAL
// =========================================================

const getTodayLocal = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// =========================================================
// PAGE
// =========================================================

export default function StrategiPage() {
  // =========================================================
  // CONFIG
  // =========================================================

  const [config, setConfig] = useState({
    modalAwal: 100000,
    persenTarget: 10,
    tanggalMulai: getTodayLocal(),
  });

  // =========================================================
  // FORM CONFIG
  // =========================================================

  const [configForm, setConfigForm] = useState({
    modalAwal: 100000,
    persenTarget: 10,
    tanggalMulai: getTodayLocal(),
  });

  const [showConfigModal, setShowConfigModal] =
    useState(false);

  // =========================================================
  // LOCK PERIODE
  //
  // Contoh:
  //
  // {
  //   "2026-08-17-pagi": {
  //      profit: 10000
  //   }
  // }
  //
  // TARGET selalu dihitung.
  //
  // PROFIT hanya menggunakan target ketika
  // periode sudah di-lock.
  // =========================================================

  const [lockedPeriods, setLockedPeriods] =
    useState({});

  // =========================================================
  // PENARIKAN
  //
  // {
  //   "2026-08-17": {
  //      value: 20000,
  //      locked: true
  //   }
  // }
  //
  // value   = nilai input penarikan
  // locked  = apakah sudah dihitung
  // =========================================================

  const [withdrawals, setWithdrawals] =
    useState({});

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  const formatRp = (value) =>
    new Intl.NumberFormat("id-ID").format(
      Math.round(value || 0)
    );

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // =========================================================
  // TAMBAH HARI
  // =========================================================

  const tambahHari = (
    tanggal,
    jumlah
  ) => {
    const date = new Date(
      `${tanggal}T00:00:00`
    );

    date.setDate(
      date.getDate() + jumlah
    );

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // BUKA CONFIG
  // =========================================================

  const bukaConfig = () => {
    setConfigForm({
      ...config,
    });

    setShowConfigModal(true);
  };

  // =========================================================
  // SIMPAN CONFIG
  // =========================================================

  const simpanConfig = () => {
    const modalAwal = Number(
      configForm.modalAwal
    );

    const persenTarget = Number(
      configForm.persenTarget
    );

    const hariIni = getTodayLocal();

    if (modalAwal <= 0) {
      alert(
        "Modal awal harus lebih dari 0."
      );
      return;
    }

    if (persenTarget <= 0) {
      alert(
        "Persentase target harus lebih dari 0."
      );
      return;
    }

    if (persenTarget > 40) {
      alert(
        "Persentase target maksimal 40%."
      );
      return;
    }

    if (!configForm.tanggalMulai) {
      alert(
        "Tanggal mulai harus diisi."
      );
      return;
    }

    // =======================================================
    // TANGGAL TIDAK BOLEH MASA LALU
    // =======================================================

    if (
      configForm.tanggalMulai < hariIni
    ) {
      alert(
        "Tanggal mulai tidak boleh menggunakan tanggal yang sudah terlewat."
      );
      return;
    }

    setConfig({
      modalAwal,
      persenTarget,
      tanggalMulai:
        configForm.tanggalMulai,
    });

    setShowConfigModal(false);
  };

  // =========================================================
  // LOCK / UNLOCK PERIODE
  //
  // TARGET selalu tersedia.
  //
  // Ketika CHECKED:
  //   target saat itu disimpan sebagai PROFIT FINAL.
  //
  // Ketika UNCHECKED:
  //   profit tidak lagi dihitung.
  // =========================================================

  const toggleLock = (
    lockKey,
    targetProfit
  ) => {
    setLockedPeriods((prev) => {
      const next = {
        ...prev,
      };

      if (next[lockKey]) {
        delete next[lockKey];
      } else {
        next[lockKey] = {
          profit:
            Number(targetProfit) || 0,
        };
      }

      return next;
    });
  };

  // =========================================================
  // UBAH NILAI PENARIKAN
  // =========================================================

  const handleWithdrawalChange = (
    tanggal,
    value
  ) => {
    const numericValue = Math.max(
      0,
      Number(value) || 0
    );

    setWithdrawals((prev) => ({
      ...prev,

      [tanggal]: {
        value: numericValue,

        locked:
          prev[tanggal]?.locked ||
          false,
      },
    }));
  };

  // =========================================================
  // LOCK / UNLOCK PENARIKAN
  //
  // Ketika LOCK:
  //   nilai input saat ini menjadi nilai yang dihitung.
  //
  // Ketika UNLOCK:
  //   penarikan tidak lagi mengurangi modal.
  // =========================================================

  const toggleWithdrawalLock = (
    tanggal
  ) => {
    setWithdrawals((prev) => {
      const current =
        prev[tanggal] || {
          value: 0,
          locked: false,
        };

      return {
        ...prev,

        [tanggal]: {
          value:
            Number(current.value) || 0,

          locked:
            !current.locked,
        },
      };
    });
  };

  // =========================================================
  // SIMULASI
  //
  // ATURAN:
  //
  // 1. Hari pertama = tanggal mulai.
  //
  // 2. Hari masa depan tidak dihitung.
  //
  // 3. Semua periode menggunakan modal awal hari
  //    yang sama untuk menentukan TARGET.
  //
  // 4. Target setiap periode selalu dihitung:
  //
  //       modalAwalHari × persenTarget
  //
  // 5. Target selalu ditampilkan pada tabel.
  //
  // 6. Target hanya menjadi PROFIT ketika checkbox
  //    periode dicentang.
  //
  // 7. Profit yang sudah di-lock tidak berubah
  //    mengikuti perubahan target konfigurasi.
  //
  // 8. Penarikan selalu bisa diinput.
  //
  // 9. Penarikan hanya mengurangi modal ketika
  //    checkbox penarikan dicentang.
  //
  // 10. Modal hari berikutnya mengikuti modal akhir
  //     hari sebelumnya.
  // =========================================================

  const simulasi = useMemo(() => {
    let modalBerjalan =
      Number(config.modalAwal);

    const hasil = [];

    const hariIni =
      getTodayLocal();

    for (
      let hariIndex = 0;
      hariIndex < JUMLAH_HARI;
      hariIndex++
    ) {
      const tanggal =
        tambahHari(
          config.tanggalMulai,
          hariIndex
        );

      // =====================================================
      // MASA DEPAN
      // =====================================================

      if (tanggal > hariIni) {
        hasil.push({
          index: hariIndex,

          tanggal,

          hari:
            formatTanggal(tanggal),

          modalAwal: null,

          periode: {
            pagi: {
              target: null,
              profit: null,
              locked: false,
            },

            siang: {
              target: null,
              profit: null,
              locked: false,
            },

            sore: {
              target: null,
              profit: null,
              locked: false,
            },
          },

          totalProfit: null,

          penarikan:
            withdrawals[tanggal]
              ?.value || 0,

          penarikanLocked:
            withdrawals[tanggal]
              ?.locked || false,

          modalAkhir: null,

          future: true,
        });

        continue;
      }

      // =====================================================
      // MODAL AWAL HARI
      // =====================================================

      const modalAwalHari =
        modalBerjalan;

      // =====================================================
      // TARGET PER PERIODE
      //
      // Semua periode menggunakan modal awal hari
      // yang sama.
      // =====================================================

      const targetProfit =
        modalAwalHari *
        (
          Number(
            config.persenTarget
          ) / 100
        );

      const periodeData = {};

      // =====================================================
      // BANGUN DATA PERIODE
      // =====================================================

      PERIODE.forEach(
        (periode) => {
          const periodeKey =
            periode.toLowerCase();

          const lockKey =
            `${tanggal}-${periodeKey}`;

          const locked =
            lockedPeriods[
              lockKey
            ];

          // ===================================================
          // TARGET SELALU ADA
          //
          // Jika belum lock:
          //   target = targetProfit
          //   profit = 0
          //
          // Jika sudah lock:
          //   target = targetProfit
          //   profit = nilai target saat dikunci
          // ===================================================

          periodeData[
            periodeKey
          ] = {
            target:
              targetProfit,

            profit:
              locked
                ? Number(
                    locked.profit
                  ) || 0
                : 0,

            locked:
              Boolean(locked),
          };
        }
      );

      // =====================================================
      // TOTAL PROFIT
      //
      // HANYA PERIODE YANG SUDAH LOCK.
      //
      // Target yang belum dicentang tidak masuk.
      // =====================================================

      const totalProfit =
        PERIODE.reduce(
          (
            total,
            periode
          ) => {
            const periodeKey =
              periode.toLowerCase();

            const data =
              periodeData[
                periodeKey
              ];

            return (
              total +
              (
                data.locked
                  ? Number(
                      data.profit
                    ) || 0
                  : 0
              )
            );
          },
          0
        );

      // =====================================================
      // PENARIKAN
      // =====================================================

      const withdrawalData =
        withdrawals[tanggal];

      const withdrawalValue =
        Number(
          withdrawalData?.value
        ) || 0;

      const penarikanLocked =
        Boolean(
          withdrawalData?.locked
        );

      // =====================================================
      // PENARIKAN HANYA DIHITUNG
      // KETIKA SUDAH LOCK
      // =====================================================

      const penarikan =
        penarikanLocked
          ? withdrawalValue
          : 0;

      // =====================================================
      // MODAL AKHIR
      // =====================================================

      const modalAkhir =
        modalAwalHari +
        totalProfit -
        penarikan;

      // =====================================================
      // SIMPAN DATA
      // =====================================================

      hasil.push({
        index: hariIndex,

        tanggal,

        hari:
          formatTanggal(tanggal),

        modalAwal:
          modalAwalHari,

        periode:
          periodeData,

        totalProfit,

        // Nilai yang ditampilkan tetap nilai input.
        // Nilai ini baru masuk kalkulasi jika locked.
        penarikan:
          withdrawalValue,

        penarikanLocked,

        modalAkhir,

        future: false,
      });

      // =====================================================
      // MODAL HARI BERIKUTNYA
      // =====================================================

      modalBerjalan =
        modalAkhir;
    }

    return hasil;
  }, [
    config,
    lockedPeriods,
    withdrawals,
  ]);

  // =========================================================
  // DATA AKTIF
  // =========================================================

  const simulasiAktif =
    simulasi.filter(
      (hari) =>
        !hari.future
    );

  // =========================================================
  // SUMMARY
  // =========================================================

  const modalSaatIni =
    simulasiAktif[
      simulasiAktif.length - 1
    ]?.modalAkhir || 0;

  const totalProfit =
    simulasiAktif.reduce(
      (
        total,
        hari
      ) =>
        total +
        (
          hari.totalProfit ||
          0
        ),
      0
    );

  const totalPenarikan =
    simulasiAktif.reduce(
      (
        total,
        hari
      ) =>
        total +
        (
          hari.penarikanLocked
            ? hari.penarikan || 0
            : 0
        ),
      0
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="strategi-page">

      <div className="container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="hero">

          <div>

            <h1>
              Strategi Disiplin 7 Hari
            </h1>

            <p>
              Simulasi pertumbuhan modal
              berdasarkan target per
              periode.
            </p>

          </div>

          <button
            className="btn-primary"
            onClick={
              bukaConfig
            }
          >
            ⚙ Konfigurasi
          </button>

        </header>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="summary-grid">

          <div className="card summary-card">

            <span>
              Modal Awal
            </span>

            <strong>
              Rp{" "}
              {formatRp(
                config.modalAwal
              )}
            </strong>

          </div>

          <div className="card summary-card">

            <span>
              Modal Saat Ini
            </span>

            <strong>
              Rp{" "}
              {formatRp(
                modalSaatIni
              )}
            </strong>

          </div>

          <div className="card summary-card">

            <span>
              Total Profit
            </span>

            <strong>
              Rp{" "}
              {formatRp(
                totalProfit
              )}
            </strong>

          </div>

          <div className="card summary-card">

            <span>
              Total Penarikan
            </span>

            <strong>
              Rp{" "}
              {formatRp(
                totalPenarikan
              )}
            </strong>

          </div>

        </section>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="card">

          <div className="section-header">

            <div>

              <h2>
                Simulasi Pertumbuhan Modal
              </h2>

              <p>
                Target selalu ditampilkan.
                Centang periode untuk
                merealisasikan target
                sebagai profit.
              </p>

            </div>

          </div>

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Hari / Tanggal
                  </th>

                  <th>
                    Modal Awal
                  </th>

                  <th>
                    Pagi
                  </th>

                  <th>
                    Siang
                  </th>

                  <th>
                    Sore
                  </th>

                  <th>
                    Total Profit
                  </th>

                  <th>
                    Penarikan
                  </th>

                  <th>
                    Modal Akhir
                  </th>

                </tr>

              </thead>

              <tbody>

                {simulasi.map(
                  (hari) => {

                    const pagi =
                      hari.periode.pagi;

                    const siang =
                      hari.periode.siang;

                    const sore =
                      hari.periode.sore;

                    return (

                      <tr
                        key={
                          hari.tanggal
                        }
                        className={
                          hari.future
                            ? "future-row"
                            : ""
                        }
                      >

                        {/* =================================
                            TANGGAL
                        ================================= */}

                        <td className="date-cell">

                          <strong>
                            {hari.hari}
                          </strong>

                        </td>

                        {/* =================================
                            MODAL AWAL
                        ================================= */}

                        <td className="money-cell">

                          {hari.future
                            ? "—"
                            : `Rp ${formatRp(
                                hari.modalAwal
                              )}`}

                        </td>

                        {/* =================================
                            PAGI
                        ================================= */}

                        <td>

                          <div
                            className={
                              `period-cell ${
                                pagi.locked
                                  ? "is-locked"
                                  : ""
                              } ${
                                hari.future
                                  ? "is-future"
                                  : ""
                              }`
                            }
                          >

                            {hari.future ? (

                              <span className="future-value">
                                —
                              </span>

                            ) : (

                              <div className="period-inline">

                                {/* TARGET SELALU DITAMPILKAN */}

                                <strong>
                                  Rp{" "}
                                  {formatRp(
                                    pagi.locked
                                      ? pagi.profit
                                      : pagi.target
                                  )}
                                </strong>

                                <label className="lock-checkbox">

                                  <input
                                    type="checkbox"
                                    checked={
                                      pagi.locked
                                    }
                                    onChange={() =>
                                      toggleLock(
                                        `${hari.tanggal}-pagi`,
                                        pagi.target
                                      )
                                    }
                                  />

                                  <span>
                                    {pagi.locked
                                      ? "Terkunci"
                                      : "Lock"}
                                  </span>

                                </label>

                              </div>

                            )}

                          </div>

                        </td>

                        {/* =================================
                            SIANG
                        ================================= */}

                        <td>

                          <div
                            className={
                              `period-cell ${
                                siang.locked
                                  ? "is-locked"
                                  : ""
                              } ${
                                hari.future
                                  ? "is-future"
                                  : ""
                              }`
                            }
                          >

                            {hari.future ? (

                              <span className="future-value">
                                —
                              </span>

                            ) : (

                              <div className="period-inline">

                                {/* TARGET SELALU DITAMPILKAN */}

                                <strong>
                                  Rp{" "}
                                  {formatRp(
                                    siang.locked
                                      ? siang.profit
                                      : siang.target
                                  )}
                                </strong>

                                <label className="lock-checkbox">

                                  <input
                                    type="checkbox"
                                    checked={
                                      siang.locked
                                    }
                                    onChange={() =>
                                      toggleLock(
                                        `${hari.tanggal}-siang`,
                                        siang.target
                                      )
                                    }
                                  />

                                  <span>
                                    {siang.locked
                                      ? "Terkunci"
                                      : "Lock"}
                                  </span>

                                </label>

                              </div>

                            )}

                          </div>

                        </td>

                        {/* =================================
                            SORE
                        ================================= */}

                        <td>

                          <div
                            className={
                              `period-cell ${
                                sore.locked
                                  ? "is-locked"
                                  : ""
                              } ${
                                hari.future
                                  ? "is-future"
                                  : ""
                              }`
                            }
                          >

                            {hari.future ? (

                              <span className="future-value">
                                —
                              </span>

                            ) : (

                              <div className="period-inline">

                                {/* TARGET SELALU DITAMPILKAN */}

                                <strong>
                                  Rp{" "}
                                  {formatRp(
                                    sore.locked
                                      ? sore.profit
                                      : sore.target
                                  )}
                                </strong>

                                <label className="lock-checkbox">

                                  <input
                                    type="checkbox"
                                    checked={
                                      sore.locked
                                    }
                                    onChange={() =>
                                      toggleLock(
                                        `${hari.tanggal}-sore`,
                                        sore.target
                                      )
                                    }
                                  />

                                  <span>
                                    {sore.locked
                                      ? "Terkunci"
                                      : "Lock"}
                                  </span>

                                </label>

                              </div>

                            )}

                          </div>

                        </td>

                        {/* =================================
                            TOTAL PROFIT
                        ================================= */}

                        <td className="money-cell profit-total">

                          {hari.future
                            ? "—"
                            : `Rp ${formatRp(
                                hari.totalProfit
                              )}`}

                        </td>

                        {/* =================================
                            PENARIKAN
                        ================================= */}

                        <td className="withdrawal-cell">

                          {hari.future ? (

                            <span className="future-value">
                              —
                            </span>

                          ) : (

                            <div
                              className={
                                `withdrawal-inline ${
                                  hari.penarikanLocked
                                    ? "is-locked"
                                    : ""
                                }`
                              }
                            >

                              <div className="withdrawal-input">

                                <span>
                                  Rp
                                </span>

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    withdrawals[
                                      hari.tanggal
                                    ]?.value ??
                                    ""
                                  }
                                  placeholder="0"
                                  disabled={
                                    hari.penarikanLocked
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    handleWithdrawalChange(
                                      hari.tanggal,
                                      e.target
                                        .value
                                    )
                                  }
                                />

                              </div>

                              <label className="lock-checkbox">

                                <input
                                  type="checkbox"
                                  checked={
                                    hari.penarikanLocked
                                  }
                                  onChange={() =>
                                    toggleWithdrawalLock(
                                      hari.tanggal
                                    )
                                  }
                                />

                                <span>
                                  {hari.penarikanLocked
                                    ? "Terkunci"
                                    : "Lock"}
                                </span>

                              </label>

                            </div>

                          )}

                        </td>

                        {/* =================================
                            MODAL AKHIR
                        ================================= */}

                        <td className="money-cell modal-end">

                          {hari.future
                            ? "—"
                            : `Rp ${formatRp(
                                hari.modalAkhir
                              )}`}

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =================================================
            TATA TERTIB
        ================================================= */}

        <section className="card">

          <h2>
            Tata Tertib Disiplin Pribadi
          </h2>

          <div className="rules-grid">

            <div className="rule-box">

              <h3>
                Pasal 1 - Modal
              </h3>

              <ul>

                <li>
                  Tidak menambah modal.
                </li>

                <li>
                  Tidak menggunakan
                  dana kebutuhan hidup.
                </li>

                <li>
                  Modal berikutnya
                  mengikuti rencana.
                </li>

              </ul>

            </div>

            <div className="rule-box">

              <h3>
                Pasal 2 - Waktu
              </h3>

              <ul>

                <li>
                  Sesi Pagi.
                </li>

                <li>
                  Sesi Siang.
                </li>

                <li>
                  Sesi Sore.
                </li>

                <li>
                  Tidak ada sesi tambahan.
                </li>

              </ul>

            </div>

            <div className="rule-box">

              <h3>
                Pasal 3 - Disiplin
              </h3>

              <ul>

                <li>
                  Tidak mengubah aturan
                  karena emosi.
                </li>

                <li>
                  Catat seluruh
                  pelanggaran.
                </li>

                <li>
                  Fokus pada
                  konsistensi.
                </li>

              </ul>

            </div>

          </div>

        </section>

        {/* =================================================
            MODAL CONFIG
        ================================================= */}

        {showConfigModal && (

          <div
            className="modal-overlay"
            onMouseDown={(e) => {

              if (
                e.target ===
                e.currentTarget
              ) {
                setShowConfigModal(
                  false
                );
              }

            }}
          >

            <div className="config-modal">

              <div className="modal-header">

                <div>

                  <h2>
                    Konfigurasi Strategi
                  </h2>

                  <p>
                    Atur modal awal, target
                    periode, dan tanggal
                    mulai.
                  </p>

                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setShowConfigModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              <div className="modal-body">

                {/* MODAL AWAL */}

                <div className="field">

                  <label>
                    Modal Awal
                  </label>

                  <div className="input-prefix">

                    <span>
                      Rp
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        configForm.modalAwal
                      }
                      onChange={(e) =>
                        setConfigForm(
                          (prev) => ({
                            ...prev,
                            modalAwal:
                              Number(
                                e.target
                                  .value
                              ) || 0,
                          })
                        )
                      }
                    />

                  </div>

                </div>

                {/* TARGET */}

                <div className="field">

                  <label>
                    Target Profit / Periode
                  </label>

                  <div className="input-prefix">

                    <input
                      type="number"
                      min="0"
                      max="40"
                      step="0.1"
                      value={
                        configForm.persenTarget
                      }
                      onChange={(e) =>
                        setConfigForm(
                          (prev) => ({
                            ...prev,
                            persenTarget:
                              Math.min(
                                40,
                                Number(
                                  e.target
                                    .value
                                ) || 0
                              ),
                          })
                        )
                      }
                    />

                    <span>
                      %
                    </span>

                  </div>

                  <small>
                    Persentase ini digunakan
                    untuk menentukan target
                    Pagi, Siang, dan Sore.
                  </small>

                </div>

                {/* TANGGAL */}

                <div className="field">

                  <label>
                    Tanggal Mulai
                  </label>

                  <input
                    type="date"
                    min={getTodayLocal()}
                    value={
                      configForm.tanggalMulai
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      if (
                        value <
                        getTodayLocal()
                      ) {
                        return;
                      }

                      setConfigForm(
                        (prev) => ({
                          ...prev,
                          tanggalMulai:
                            value,
                        })
                      );
                    }}
                  />

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setShowConfigModal(
                      false
                    )
                  }
                >
                  Batal
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={
                    simpanConfig
                  }
                >
                  Simpan Konfigurasi
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}