/* =========================================================
   app/deret-angka/page.js
   MATRIKS DERET ANGKA 00-99
========================================================= */

"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "@/styles/deret-angka.css";

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

const INVEST_COUNT = 4;

const MAX_COMBINATIONS = 20;

const MAX_ALLOCATED_COMBINATIONS =
  INVEST_COUNT * MAX_COMBINATIONS;

/* =========================================================
   MARKET SCHEDULE
========================================================= */

const MARKET_SCHEDULE = [
  {
    name: "Lisbon",
    close: "11:50:00",
  },
  {
    name: "Sydney",
    close: "14:50:00",
  },
  {
    name: "Japan",
    close: "18:20:00",
  },
  {
    name: "Taiwan",
    close: "21:45:00",
  },
  {
    name: "Hongkong",
    close: "23:50:00",
  },
];

/* =========================================================
   MARKET RESULT API
========================================================= */

const MARKET_RESULTS_API =
  "/api/market-results";

/* =========================================================
   HELPER — TIME
========================================================= */

const parseTime = (time) => {
  const [hours, minutes, seconds] =
    time.split(":").map(Number);

  return {
    hours,
    minutes,
    seconds,
  };
};

const getTodayAtTime = (
  date,
  time
) => {
  const {
    hours,
    minutes,
    seconds,
  } = parseTime(time);

  const target = new Date(date);

  target.setHours(
    hours,
    minutes,
    seconds,
    0
  );

  return target;
};

const formatCountdown = (
  milliseconds
) => {
  if (milliseconds <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(
    milliseconds / 1000
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  return [
    hours,
    minutes,
    seconds,
  ]
    .map((value) =>
      String(value).padStart(2, "0")
    )
    .join(":");
};

/* =========================================================
   MARKET STATUS
========================================================= */

const getActiveMarket = (
  currentTime
) => {
  const today = new Date(
    currentTime
  );

  for (
    let index = 0;
    index < MARKET_SCHEDULE.length;
    index++
  ) {
    const market =
      MARKET_SCHEDULE[index];

    const closeTime =
      getTodayAtTime(
        today,
        market.close
      );

    if (
      currentTime < closeTime
    ) {
      return {
        market,
        index,
        closeTime,
      };
    }
  }

  const tomorrow = new Date(
    currentTime
  );

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const firstMarket =
    MARKET_SCHEDULE[0];

  return {
    market: firstMarket,
    index: 0,
    closeTime: getTodayAtTime(
      tomorrow,
      firstMarket.close
    ),
  };
};

export default function DeretAngkaPage() {
  const [disabledRows, setDisabledRows] =
    useState([]);

  const [disabledCols, setDisabledCols] =
    useState([]);

  const [investments, setInvestments] =
    useState(
      Array(INVEST_COUNT).fill("")
    );

  const [balance, setBalance] =
    useState(0);

  const [
    allocationPercent,
    setAllocationPercent,
  ] = useState(70);

  const [balanceInput, setBalanceInput] =
    useState("");

  const [
    allocationInput,
    setAllocationInput,
  ] = useState("70");

  const [
    showBalanceModal,
    setShowBalanceModal,
  ] = useState(false);

  const [copied, setCopied] =
    useState(null);

  /* =========================================================
     MARKET CLOCK
  ========================================================= */

  const [currentTime, setCurrentTime] =
    useState(new Date());

  /* =========================================================
     MARKET RESULTS
  ========================================================= */

  const [
    marketResults,
    setMarketResults,
  ] = useState([]);

  const [
    marketResultsLoading,
    setMarketResultsLoading,
  ] = useState(false);

  const [
    marketResultsError,
    setMarketResultsError,
  ] = useState(false);

  /*
   * Menyimpan rekomendasi sebelumnya.
   */
  const previousRecommendations =
    useRef(
      Array(INVEST_COUNT).fill(0)
    );

  /* =========================================================
     MARKET CLOCK — UPDATE SETIAP DETIK
  ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /* =========================================================
     MARKET STATUS
  ========================================================= */

  const activeMarketInfo = useMemo(
    () =>
      getActiveMarket(
        currentTime
      ),
    [currentTime]
  );

  const activeMarket =
    activeMarketInfo.market;

  const activeMarketIndex =
    activeMarketInfo.index;

  const marketCloseTime =
    activeMarketInfo.closeTime;

  const marketCountdown =
    Math.max(
      0,
      marketCloseTime.getTime() -
        currentTime.getTime()
    );

  /* =========================================================
     MARKET RESULTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadMarketResults =
      async () => {
        setMarketResultsLoading(
          true
        );

        setMarketResultsError(
          false
        );

        try {
          const params =
            new URLSearchParams({
              market:
                activeMarket.name,
              limit: "10",
            });

          const response =
            await fetch(
              `${MARKET_RESULTS_API}?${params.toString()}`,
              {
                cache: "no-store",
              }
            );

          if (!response.ok) {
            throw new Error(
              "Gagal mengambil result market."
            );
          }

          const data =
            await response.json();

          const results = Array.isArray(
            data
          )
            ? data
            : Array.isArray(
                data?.results
              )
            ? data.results
            : [];

          if (!cancelled) {
            setMarketResults(
              results.slice(0, 10)
            );
          }
        } catch (error) {
          console.error(
            "Gagal mengambil market result:",
            error
          );

          if (!cancelled) {
            setMarketResults([]);
            setMarketResultsError(
              true
            );
          }
        } finally {
          if (!cancelled) {
            setMarketResultsLoading(
              false
            );
          }
        }
      };

    loadMarketResults();

    return () => {
      cancelled = true;
    };
  }, [activeMarket.name]);

  /* =========================================================
     FORMAT TANGGAL RESULT
  ========================================================= */

  const formatResultDate = (
    value
  ) => {
    if (!value) return "—";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     ROW / COLUMN
  ========================================================= */

  const toggleRow = (digit) => {
    setDisabledRows((prev) =>
      prev.includes(digit)
        ? prev.filter(
            (item) => item !== digit
          )
        : [...prev, digit]
    );
  };

  const toggleCol = (digit) => {
    setDisabledCols((prev) =>
      prev.includes(digit)
        ? prev.filter(
            (item) => item !== digit
          )
        : [...prev, digit]
    );
  };

  const isDisabled = (
    row,
    col
  ) =>
    disabledRows.includes(row) ||
    disabledCols.includes(col);

  /* =========================================================
     KOMBINASI TERSISA
  ========================================================= */

  const remainingNumbers =
    useMemo(
      () =>
        DIGITS.flatMap((row) =>
          DIGITS.filter(
            (col) =>
              !isDisabled(
                row,
                col
              )
          ).map(
            (col) =>
              `${row}${col}`
          )
        ),
      [
        disabledRows,
        disabledCols,
      ]
    );

  /* =========================================================
     ACAK & PEMBAGIAN KOMBINASI
  ========================================================= */

  const investmentNumbers =
    useMemo(() => {
      const shuffled = [
        ...remainingNumbers,
      ];

      for (
        let i =
          shuffled.length - 1;
        i > 0;
        i--
      ) {
        const randomIndex =
          Math.floor(
            Math.random() *
              (i + 1)
          );

        [
          shuffled[i],
          shuffled[randomIndex],
        ] = [
          shuffled[randomIndex],
          shuffled[i],
        ];
      }

      const allocated =
        shuffled.slice(
          0,
          MAX_ALLOCATED_COMBINATIONS
        );

      const total =
        allocated.length;

      if (!total) {
        return Array(
          INVEST_COUNT
        ).fill([]);
      }

      const investCount =
        Math.min(
          INVEST_COUNT,
          Math.ceil(
            total /
              MAX_COMBINATIONS
          )
        );

      const baseCount =
        Math.floor(
          total /
            investCount
        );

      const counts =
        Array(
          investCount
        ).fill(
          baseCount
        );

      let remainder =
        total %
        investCount;

      for (
        let i = 0;
        i <
          investCount &&
        remainder > 0;
        i++
      ) {
        if (
          counts[i] <
          MAX_COMBINATIONS
        ) {
          counts[i]++;
          remainder--;
        }
      }

      const result = [];

      let start = 0;

      counts.forEach(
        (count) => {
          result.push(
            allocated.slice(
              start,
              start + count
            )
          );

          start += count;
        }
      );

      while (
        result.length <
        INVEST_COUNT
      ) {
        result.push([]);
      }

      return result;
    }, [remainingNumbers]);

  /* =========================================================
     FORMAT NOMINAL
  ========================================================= */

  const formatNumber = (
    value
  ) => {
    const numeric = String(
      value
    ).replace(/\D/g, "");

    if (!numeric) return "";

    return Number(
      numeric
    ).toLocaleString("id-ID");
  };

  const getNumericValue = (
    value
  ) => {
    const numeric = String(
      value
    ).replace(/\D/g, "");

    return numeric
      ? Number(numeric)
      : 0;
  };

  /* =========================================================
     FORMAT PERSENTASE
  ========================================================= */

  const formatPercent = (
    value
  ) => {
    const numeric = String(
      value
    ).replace(/\D/g, "");

    if (!numeric) return "";

    return Math.min(
      100,
      Number(numeric)
    ).toString();
  };

  /* =========================================================
     INPUT BALANCE
  ========================================================= */

  const handleBalanceChange = (
    value
  ) => {
    setBalanceInput(
      formatNumber(value)
    );
  };

  const handleAllocationChange = (
    value
  ) => {
    setAllocationInput(
      formatPercent(value)
    );
  };

  /* =========================================================
     SIMPAN BALANCE
  ========================================================= */

  const handleSaveBalance = () => {
    const newBalance =
      getNumericValue(
        balanceInput
      );

    const newPercent =
      Math.min(
        100,
        Math.max(
          0,
          Number(
            allocationInput
          ) || 0
        )
      );

    setBalance(
      newBalance
    );

    setAllocationPercent(
      newPercent
    );

    setAllocationInput(
      String(newPercent)
    );

    setShowBalanceModal(
      false
    );
  };

  /* =========================================================
     BATAS ALOKASI BALANCE
  ========================================================= */

  const allocationLimit =
    useMemo(
      () =>
        Math.floor(
          balance *
            (allocationPercent /
              100)
        ),
      [
        balance,
        allocationPercent,
      ]
    );

  /* =========================================================
     REKOMENDASI NOMINAL INVESTASI
  ========================================================= */

  const recommendedInvestments =
    useMemo(() => {
      const counts =
        investmentNumbers.map(
          (numbers) =>
            numbers.length
        );

      if (
        !allocationLimit ||
        !counts.some(Boolean)
      ) {
        return Array(
          INVEST_COUNT
        ).fill(0);
      }

      const highestCount =
        Math.max(...counts);

      if (!highestCount) {
        return Array(
          INVEST_COUNT
        ).fill(0);
      }

      let bestNominals =
        Array(
          INVEST_COUNT
        ).fill(0);

      let bestTotal = 0;

      const maxBase =
        Math.floor(
          allocationLimit /
            highestCount /
            100
        );

      for (
        let base = 1;
        base <= maxBase;
        base++
      ) {
        const nominals =
          counts.map(
            (
              count,
              index
            ) =>
              count
                ? (base +
                    index) *
                  100
                : 0
          );

        const total =
          nominals.reduce(
            (
              sum,
              nominal,
              index
            ) =>
              sum +
              nominal *
                counts[index],
            0
          );

        if (
          total <=
            allocationLimit &&
          total > bestTotal
        ) {
          bestTotal = total;
          bestNominals =
            nominals;
        }
      }

      return bestNominals;
    }, [
      investmentNumbers,
      allocationLimit,
    ]);

  /* =========================================================
     MASUKKAN REKOMENDASI
  ========================================================= */

  useEffect(() => {
    setInvestments((prev) => {
      const next = [...prev];

      let changed = false;

      recommendedInvestments.forEach(
        (
          recommended,
          index
        ) => {
          const current =
            getNumericValue(
              prev[index]
            );

          const previous =
            previousRecommendations
              .current[index];

          const shouldApply =
            !current ||
            current ===
              previous;

          if (shouldApply) {
            const nextValue =
              recommended
                ? formatNumber(
                    String(
                      recommended
                    )
                  )
                : "";

            if (
              next[index] !==
              nextValue
            ) {
              next[index] =
                nextValue;

              changed = true;
            }
          }
        }
      );

      previousRecommendations
        .current = [
        ...recommendedInvestments,
      ];

      return changed
        ? next
        : prev;
    });
  }, [
    recommendedInvestments,
  ]);

  /* =========================================================
     TOTAL INVESTASI PER INVEST
  ========================================================= */

  const investmentTotals =
    useMemo(
      () =>
        investmentNumbers.map(
          (
            numbers,
            index
          ) =>
            numbers.length *
            getNumericValue(
              investments[index]
            )
        ),
      [
        investmentNumbers,
        investments,
      ]
    );

  /* =========================================================
     TOTAL INVESTASI
  ========================================================= */

  const totalInvestment =
    useMemo(
      () =>
        investmentTotals.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        ),
      [investmentTotals]
    );

  /* =========================================================
     ANALISA SURPLUS / DEFISIT
  ========================================================= */

  const calculationResults =
    useMemo(
      () =>
        investments.map(
          (value) =>
            getNumericValue(
              value
            ) *
              100 -
            totalInvestment
        ),
      [
        investments,
        totalInvestment,
      ]
    );

  /* =========================================================
     STATUS ANALISA
  ========================================================= */

  const getAnalysisStatus =
    (value) => {
      if (value > 0)
        return "Surplus";

      if (value < 0)
        return "Defisit";

      return "Seimbang";
    };

  /* =========================================================
     INPUT NOMINAL INVESTASI
  ========================================================= */

  const handleInvestmentChange = (
    index,
    value
  ) => {
    const formatted =
      formatNumber(value);

    setInvestments((prev) => {
      const next = [...prev];

      next[index] =
        formatted;

      return next;
    });
  };

  /* =========================================================
     FORMAT RUPIAH
  ========================================================= */

  const formatRupiah = (
    value
  ) =>
    `Rp ${Number(
      value || 0
    ).toLocaleString(
      "id-ID"
    )}`;

  const formatSignedRupiah = (
    value
  ) => {
    if (value > 0) {
      return `+ ${formatRupiah(
        value
      )}`;
    }

    if (value < 0) {
      return `- ${formatRupiah(
        Math.abs(value)
      )}`;
    }

    return formatRupiah(0);
  };

  /* =========================================================
     COPY
  ========================================================= */

  const handleCopy = async (
    index
  ) => {
    const numbers =
      investmentNumbers[index];

    if (!numbers.length)
      return;

    try {
      await navigator.clipboard.writeText(
        numbers.join(", ")
      );

      setCopied(index);

      setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch (error) {
      console.error(
        "Gagal menyalin:",
        error
      );
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    setDisabledRows([]);
    setDisabledCols([]);

    setInvestments(
      Array(
        INVEST_COUNT
      ).fill("")
    );

    setBalance(0);

    setAllocationPercent(
      70
    );

    setBalanceInput("");

    setAllocationInput(
      "70"
    );

    setShowBalanceModal(
      false
    );

    setCopied(null);

    previousRecommendations
      .current =
      Array(
        INVEST_COUNT
      ).fill(0);
  };

    return (
    <main className="deret-page">
      <div className="deret-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="deret-header">
          <div>
            <span className="deret-eyebrow">
              NUMBER MATRIX
            </span>

            <h1>
              Matriks Deret Angka
            </h1>

            <p>
              Pilih baris atau kolom
              untuk mengatur
              kombinasi aktif.
            </p>
          </div>

          <button
            type="button"
            className="deret-reset"
            onClick={handleReset}
          >
            Reset
          </button>
        </header>


        {/* =====================================================
            WORKSPACE

            WORKSPACE
            ├── MAIN GRID
            │   ├── LEFT
            │   ├── MATRIX
            │   ├── INVEST 1-4
            │   ├── TOTAL INVEST
            │   └── COMBINATION RESULTS
            │
            └── RIGHT GRID
                ├── MARKET
                └── 10 RESULT TERAKHIR
        ===================================================== */}

        <section className="deret-workspace">


          {/* ===================================================
              MAIN GRID
          =================================================== */}

          <main className="deret-main-grid">


            {/* =================================================
                MAIN GRID — KIRI
            ================================================= */}

            <div className="deret-left">

              {/* ===============================================
                  BALANCE
              =============================================== */}

              <section className="deret-card deret-balance-card">

                <div className="deret-balance-top">

                  <div>
                    <span className="deret-card-label">
                      Balance
                    </span>

                    <small>
                      Dana yang tersedia
                    </small>
                  </div>

                  <button
                    type="button"
                    className="deret-balance-button"
                    onClick={() => {
                      setBalanceInput(
                        balance
                          ? formatNumber(
                              String(balance)
                            )
                          : ""
                      );

                      setAllocationInput(
                        String(
                          allocationPercent
                        )
                      );

                      setShowBalanceModal(
                        true
                      );
                    }}
                  >
                    Input Balance
                  </button>
                </div>

                <strong className="deret-balance-value">
                  {formatRupiah(balance)}
                </strong>

                <div className="deret-balance-details">

                  <div>
                    <span>
                      Penggunaan
                    </span>

                    <strong>
                      {allocationPercent}%
                    </strong>
                  </div>

                  <div>
                    <span>
                      Batas Alokasi
                    </span>

                    <strong>
                      {formatRupiah(
                        allocationLimit
                      )}
                    </strong>
                  </div>

                </div>
              </section>


              {/* ===============================================
                  STATUS KOMBINASI
              =============================================== */}

              <section className="deret-card deret-status-card">

                <div className="deret-status-item">

                  <div>
                    <span className="deret-card-label">
                      Kombinasi Tersisa
                    </span>

                    <small>
                      Dari 100 kombinasi
                    </small>
                  </div>

                  <strong className="is-primary">
                    {remainingNumbers.length}
                  </strong>

                </div>


                <div className="deret-status-divider" />


                <div className="deret-status-item">

                  <div>
                    <span className="deret-card-label">
                      Baris Dimatikan
                    </span>

                    <small>
                      Digit pertama
                    </small>
                  </div>

                  <strong>
                    {disabledRows.length
                      ? disabledRows.join(", ")
                      : "—"}
                  </strong>

                </div>


                <div className="deret-status-divider" />


                <div className="deret-status-item">

                  <div>
                    <span className="deret-card-label">
                      Kolom Dimatikan
                    </span>

                    <small>
                      Digit kedua
                    </small>
                  </div>

                  <strong>
                    {disabledCols.length
                      ? disabledCols.join(", ")
                      : "—"}
                  </strong>

                </div>


                <div className="deret-status-divider" />


                <div className="deret-status-item">

                  <div>
                    <span className="deret-card-label">
                      Digunakan
                    </span>

                    <small>
                      Maksimal 80 kombinasi
                    </small>
                  </div>

                  <strong>
                    {Math.min(
                      remainingNumbers.length,
                      MAX_ALLOCATED_COMBINATIONS
                    )}
                  </strong>

                </div>

              </section>

            </div>


            {/* =================================================
                MAIN GRID — KANAN
                MATRIX
            ================================================= */}

            <section className="deret-matrix-card">

              <div className="deret-matrix-top">

                <div>
                  <span className="deret-card-label">
                    Matriks 00–99
                  </span>

                  <small>
                    Klik header untuk
                    mematikan baris
                    atau kolom.
                  </small>
                </div>

                <span className="deret-active-count">
                  {remainingNumbers.length} aktif
                </span>

              </div>


              <div className="deret-matrix">

                <div className="matrix-corner">
                  ↘
                </div>


                {DIGITS.map((col) => (
                  <button
                    key={`col-${col}`}
                    type="button"
                    className={`matrix-header ${
                      disabledCols.includes(col)
                        ? "is-disabled"
                        : ""
                    }`}
                    onClick={() =>
                      toggleCol(col)
                    }
                    title={`Matikan kolom ${col}`}
                  >
                    {col}
                  </button>
                ))}


                {DIGITS.map((row) => (
                  <div
                    key={`row-${row}`}
                    className="matrix-row"
                  >

                    <button
                      type="button"
                      className={`matrix-header matrix-row-header ${
                        disabledRows.includes(row)
                          ? "is-disabled"
                          : ""
                      }`}
                      onClick={() =>
                        toggleRow(row)
                      }
                      title={`Matikan baris ${row}`}
                    >
                      {row}
                    </button>


                    {DIGITS.map((col) => (
                      <div
                        key={`${row}${col}`}
                        className={`matrix-cell ${
                          isDisabled(
                            row,
                            col
                          )
                            ? "is-disabled"
                            : ""
                        }`}
                      >
                        {row}
                        {col}
                      </div>
                    ))}

                  </div>
                ))}

              </div>

            </section>


            {/* =================================================
                MAIN GRID — BAWAH
                INVEST 1 - 4

                Sengaja berada di dalam MAIN GRID,
                bukan di RIGHT GRID.
            ================================================= */}

            <section className="deret-invest-list">

              {investmentNumbers.map(
                (numbers, index) => {

                  const result =
                    calculationResults[index];

                  const isSurplus =
                    result > 0;

                  const isDeficit =
                    result < 0;

                  return (
                    <article
                      key={index}
                      className={`deret-card deret-invest-card ${
                        isSurplus
                          ? "is-surplus"
                          : isDeficit
                          ? "is-deficit"
                          : "is-balanced"
                      }`}
                    >

                      <div className="deret-invest-heading">

                        <span className="deret-card-label">
                          Invest {index + 1}
                        </span>

                        <strong className="deret-invest-count">
                          {numbers.length} kombinasi
                        </strong>

                      </div>


                      <div className="deret-input-wrap">

                        <span>
                          Rp
                        </span>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            investments[index]
                          }
                          onChange={(event) =>
                            handleInvestmentChange(
                              index,
                              event.target.value
                            )
                          }
                          placeholder="0"
                        />

                      </div>


                      <div className="deret-invest-preview">

                        <span>
                          Rekomendasi
                        </span>

                        <strong>
                          {formatRupiah(
                            recommendedInvestments[
                              index
                            ]
                          )}
                        </strong>

                      </div>


                      <div className="deret-invest-preview">

                        <span>
                          Total Invest
                        </span>

                        <strong>
                          {formatRupiah(
                            investmentTotals[
                              index
                            ]
                          )}
                        </strong>

                      </div>


                      <div className="deret-invest-analysis">

                        <span>
                          {getAnalysisStatus(
                            result
                          )}
                        </span>

                        <strong>
                          {formatSignedRupiah(
                            result
                          )}
                        </strong>

                      </div>

                    </article>
                  );
                }
              )}

            </section>


            {/* =================================================
                MAIN GRID — TOTAL NOMINAL INVESTASI
            ================================================= */}

            <section className="deret-total-info">

              <div>

                <span>
                  Total Investasi
                </span>

                <small>
                  Batas alokasi{" "}
                  {allocationPercent}%
                </small>

              </div>

              <strong>
                {formatRupiah(
                  totalInvestment
                )}
              </strong>

            </section>


            {/* =================================================
                MAIN GRID — KOMBINASI INVEST 1 - 4
            ================================================= */}

            <section className="deret-results">

              {investmentNumbers.map(
                (numbers, index) => (

                  <article
                    key={index}
                    className="deret-result-card"
                  >

                    <div className="deret-result-top">

                      <div>

                        <span className="deret-card-label">
                          Invest {index + 1}
                        </span>

                        <strong>
                          {numbers.length} kombinasi
                        </strong>

                      </div>


                      <button
                        type="button"
                        className={`deret-copy ${
                          copied === index
                            ? "is-copied"
                            : ""
                        }`}
                        onClick={() =>
                          handleCopy(index)
                        }
                        disabled={
                          !numbers.length
                        }
                      >
                        {copied === index
                          ? "Tersalin"
                          : "Copy"}
                      </button>

                    </div>


                    <textarea
                      className="deret-output"
                      value={numbers.join(", ")}
                      readOnly
                      placeholder="Tidak ada kombinasi."
                      onFocus={(event) =>
                        event.target.select()
                      }
                    />

                  </article>

                )
              )}

            </section>

          </main>


          {/* ===================================================
              RIGHT GRID

              INI BERDIRI SENDIRI.

              Tidak menjadi bagian dari MAIN GRID.
              Tidak berisi Matrix.
              Tidak berisi Invest.
              Tidak berisi Total Invest.
              Tidak berisi Combination Results.
          =================================================== */}

          <aside className="deret-market-panel">


            {/* =================================================
                RIGHT GRID — ATAS
                CARD MARKET
            ================================================= */}

            <section className="deret-card deret-market-card">

              <div className="deret-market-heading">

                <div>

                  <span className="deret-card-label">
                    Market
                  </span>

                  <small>
                    Market aktif berdasarkan
                    closing time
                  </small>

                </div>

                <span className="deret-market-live">
                  LIVE
                </span>

              </div>


              {/* ===============================================
                  ACTIVE MARKET
              =============================================== */}

              <div className="deret-market-active">

                <div>

                  <span>
                    {activeMarket.name}
                  </span>

                  <small>
                    Closed Market
                  </small>

                </div>

                <strong>
                  {formatCountdown(
                    marketCountdown
                  )}
                </strong>

              </div>


              {/* ===============================================
                  MARKET SCHEDULE
              =============================================== */}

              <div className="deret-market-list">

                {MARKET_SCHEDULE.map(
                  (market, index) => {

                    const isActive =
                      index ===
                      activeMarketIndex;

                    return (
                      <div
                        key={market.name}
                        className={`deret-market-row ${
                          isActive
                            ? "is-active"
                            : ""
                        }`}
                      >

                        <div>

                          <strong className="deret-market-name">
                            {market.name}
                          </strong>

                          {isActive && (
                            <span className="deret-market-status is-open">
                              Aktif
                            </span>
                          )}

                        </div>

                        <strong className="deret-market-time">
                          {market.close}
                        </strong>

                      </div>
                    );
                  }
                )}

              </div>

            </section>


            {/* =================================================
                RIGHT GRID — BAWAH
                10 RESULT TERAKHIR
            ================================================= */}

            <section className="deret-card deret-market-results">

              <div className="deret-market-results-header">

                <div>

                  <span className="deret-market-results-title">
                    Result Terakhir
                  </span>

                  <span className="deret-market-results-subtitle">
                    {activeMarket.name}
                  </span>

                </div>

                <span className="deret-market-results-count">
                  {Math.min(
                    marketResults.length,
                    10
                  )}{" "}
                  / 10
                </span>

              </div>


              {marketResultsLoading ? (

                <div className="deret-market-result-empty">
                  Memuat result...
                </div>

              ) : marketResultsError ? (

                <div className="deret-market-result-empty">
                  Belum ada data result.
                </div>

              ) : marketResults.length === 0 ? (

                <div className="deret-market-result-empty">
                  Belum ada data result.
                </div>

              ) : (

                <div className="deret-market-results-list">

                  {marketResults
                    .slice(0, 10)
                    .map(
                      (item, index) => (

                        <div
                          key={`${item.date}-${item.result}-${index}`}
                          className="deret-market-result-row"
                        >

                          <span className="deret-market-result-date">
                            {formatResultDate(
                              item.date
                            )}
                          </span>

                          <strong className="deret-market-result-value">
                            {item.result}
                          </strong>

                        </div>

                      )
                    )}

                </div>

              )}

            </section>

          </aside>

        </section>

      </div>


      {/* =======================================================
          BALANCE MODAL
      ======================================================= */}

      {showBalanceModal && (

        <div
          className="deret-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setShowBalanceModal(false);
            }

          }}
        >

          <div className="deret-modal">


            <div className="deret-modal-header">

              <div>

                <span className="deret-card-label">
                  Pengaturan Dana
                </span>

                <h2>
                  Input Balance
                </h2>

                <p>
                  Masukkan balance dan
                  persentase penggunaannya.
                </p>

              </div>


              <button
                type="button"
                className="deret-modal-close"
                onClick={() =>
                  setShowBalanceModal(false)
                }
              >
                ×
              </button>

            </div>


            <div className="deret-modal-field">

              <label htmlFor="balance">
                Balance
              </label>

              <div className="deret-input-wrap">

                <span>
                  Rp
                </span>

                <input
                  id="balance"
                  type="text"
                  inputMode="numeric"
                  value={balanceInput}
                  onChange={(event) =>
                    handleBalanceChange(
                      event.target.value
                    )
                  }
                  placeholder="0"
                  autoFocus
                />

              </div>

            </div>


            <div className="deret-modal-field">

              <label htmlFor="allocation">
                Persentase Penggunaan
              </label>

              <div className="deret-input-wrap">

                <input
                  id="allocation"
                  type="text"
                  inputMode="numeric"
                  value={allocationInput}
                  onChange={(event) =>
                    handleAllocationChange(
                      event.target.value
                    )
                  }
                  placeholder="70"
                />

                <span>
                  %
                </span>

              </div>

            </div>


            <div className="deret-modal-limit">

              <span>
                Batas Alokasi
              </span>

              <strong>
                {formatRupiah(
                  getNumericValue(
                    balanceInput
                  ) *
                    (
                      (Number(
                        allocationInput
                      ) || 0) / 100
                    )
                )}
              </strong>

            </div>


            <div className="deret-modal-actions">

              <button
                type="button"
                className="deret-modal-cancel"
                onClick={() =>
                  setShowBalanceModal(false)
                }
              >
                Batal
              </button>

              <button
                type="button"
                className="deret-modal-save"
                onClick={handleSaveBalance}
              >
                Simpan Balance
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}