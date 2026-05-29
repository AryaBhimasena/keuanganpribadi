const BASE_URL =
  "https://script.google.com/macros/s/AKfycbxLUHemZUZjplprrdjy61hh5-68YZAT-2Ob9u4jROiRIT3Q4IRtmojk2wPC-YCscnAAZA/exec";

/* ====================================== */
/* TYPES */
/* ====================================== */

export type IncomePayload = {
  tanggal: number;
  bulan: number;
  tahun: number;
  pendapatan: number;
  keterangan: string;
};

export type ExpensePayload = {
  tanggal: number;
  bulan: number;
  tahun: number;
  pengeluaran: number;
  keterangan: string;
};

export type DailyGoalPayload = {
  tanggal: number;
  bulan: number;
  tahun: number;
  goals: string;
  target?: string;
  status?: string;
};

export type KewajibanPayload = {
  id_akun: string;
  akun: string;
  kewajiban: number;
  sisa_kewajiban: number;
  tanggal_pinjam: number;
  bulan_pinjam: number;
  tahun_pinjam: number;
  pembayaran: number;
  tanggal_bayar: number;
  bulan_bayar: number;
  tahun_bayar: number;
  keterangan: string;
  status: string;
};

/* ====================================== */
/* BASE FETCH */
/* ====================================== */

async function apiFetch(
  params: URLSearchParams
) {

  const response =
    await fetch(
      `${BASE_URL}?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

  return response.json();
}

/* ====================================== */
/* GET MONTHLY */
/* ====================================== */

export async function getMonthlyIncome(
  bulan: number,
  tahun: number
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "getMonthlyIncome"
  );

  params.append(
    "bulan",
    bulan.toString()
  );

  params.append(
    "tahun",
    tahun.toString()
  );

  return apiFetch(params);
}

export async function getMonthlyExpense(
  bulan: number,
  tahun: number
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "getMonthlyExpense"
  );

  params.append(
    "bulan",
    bulan.toString()
  );

  params.append(
    "tahun",
    tahun.toString()
  );

  return apiFetch(params);
}

export async function getKewajiban() {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "getKewajiban"
  );

  return apiFetch(params);
}

/* ====================================== */
/* DAILY GOALS */
/* ====================================== */

export async function getDailyGoals(
  tanggal: number,
  bulan: number,
  tahun: number
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "getDailyGoals"
  );

  params.append(
    "tanggal",
    tanggal.toString()
  );

  params.append(
    "bulan",
    bulan.toString()
  );

  params.append(
    "tahun",
    tahun.toString()
  );

  return apiFetch(params);
}

/* ====================================== */
/* CREATE */
/* ====================================== */

export async function createIncome(
  payload: IncomePayload
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "createIncome"
  );

  params.append(
    "tanggal",
    payload.tanggal.toString()
  );

  params.append(
    "bulan",
    payload.bulan.toString()
  );

  params.append(
    "tahun",
    payload.tahun.toString()
  );

  params.append(
    "pendapatan",
    payload.pendapatan.toString()
  );

  params.append(
    "keterangan",
    payload.keterangan
  );

  return apiFetch(params);
}

export async function createExpense(
  payload: ExpensePayload
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "createExpense"
  );

  params.append(
    "tanggal",
    payload.tanggal.toString()
  );

  params.append(
    "bulan",
    payload.bulan.toString()
  );

  params.append(
    "tahun",
    payload.tahun.toString()
  );

  params.append(
    "pengeluaran",
    payload.pengeluaran.toString()
  );

  params.append(
    "keterangan",
    payload.keterangan
  );

  return apiFetch(params);
}

export async function createDailyGoal(
  payload: DailyGoalPayload
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "createDailyGoal"
  );

  params.append(
    "tanggal",
    payload.tanggal.toString()
  );

  params.append(
    "bulan",
    payload.bulan.toString()
  );

  params.append(
    "tahun",
    payload.tahun.toString()
  );

  params.append(
    "goals",
    payload.goals
  );

  params.append(
    "target",
    payload.target || ""
  );

  params.append(
    "status",
    payload.status || ""
  );

  return apiFetch(params);
}

export async function createKewajiban(
  payload: KewajibanPayload
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "createKewajiban"
  );

  params.append(
    "id_akun",
    payload.id_akun
  );

  params.append(
    "akun",
    payload.akun
  );

  params.append(
    "kewajiban",
    payload.kewajiban.toString()
  );

  params.append(
    "sisa_kewajiban",
    payload.sisa_kewajiban.toString()
  );

  params.append(
    "tanggal_pinjam",
    payload.tanggal_pinjam.toString()
  );

  params.append(
    "bulan_pinjam",
    payload.bulan_pinjam.toString()
  );

  params.append(
    "tahun_pinjam",
    payload.tahun_pinjam.toString()
  );

  params.append(
    "pembayaran",
    payload.pembayaran.toString()
  );

  params.append(
    "tanggal_bayar",
    payload.tanggal_bayar.toString()
  );

  params.append(
    "bulan_bayar",
    payload.bulan_bayar.toString()
  );

  params.append(
    "tahun_bayar",
    payload.tahun_bayar.toString()
  );

  params.append(
    "keterangan",
    payload.keterangan
  );

  params.append(
    "status",
    payload.status
  );

  return apiFetch(params);
}

/* ====================================== */
/* UPDATE */
/* ====================================== */

export async function updateIncome(
  rowIndex: number,
  payload: IncomePayload
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "updateIncome"
  );

  params.append(
    "rowIndex",
    rowIndex.toString()
  );

  params.append(
    "tanggal",
    payload.tanggal.toString()
  );

  params.append(
    "bulan",
    payload.bulan.toString()
  );

  params.append(
    "tahun",
    payload.tahun.toString()
  );

  params.append(
    "pendapatan",
    payload.pendapatan.toString()
  );

  params.append(
    "keterangan",
    payload.keterangan
  );

  return apiFetch(params);
}

export async function updateExpense(
  rowIndex: number,
  payload: ExpensePayload
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "updateExpense"
  );

  params.append(
    "rowIndex",
    rowIndex.toString()
  );

  params.append(
    "tanggal",
    payload.tanggal.toString()
  );

  params.append(
    "bulan",
    payload.bulan.toString()
  );

  params.append(
    "tahun",
    payload.tahun.toString()
  );

  params.append(
    "pengeluaran",
    payload.pengeluaran.toString()
  );

  params.append(
    "keterangan",
    payload.keterangan
  );

  return apiFetch(params);
}

export async function updateDailyGoal(
  rowIndex: number,
  payload: DailyGoalPayload
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "updateDailyGoal"
  );

  params.append(
    "rowIndex",
    rowIndex.toString()
  );

  params.append(
    "tanggal",
    payload.tanggal.toString()
  );

  params.append(
    "bulan",
    payload.bulan.toString()
  );

  params.append(
    "tahun",
    payload.tahun.toString()
  );

  params.append(
    "goals",
    payload.goals
  );

  params.append(
    "target",
    payload.target || ""
  );

  params.append(
    "status",
    payload.status || ""
  );

  return apiFetch(params);
}

export async function updateKewajiban(
  rowIndex: number,
  payload: KewajibanPayload
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "updateKewajiban"
  );

  params.append(
    "rowIndex",
    rowIndex.toString()
  );

  params.append(
    "id_akun",
    payload.id_akun
  );

  params.append(
    "akun",
    payload.akun
  );

  params.append(
    "kewajiban",
    payload.kewajiban.toString()
  );

  params.append(
    "sisa_kewajiban",
    payload.sisa_kewajiban.toString()
  );

  params.append(
    "tanggal_pinjam",
    payload.tanggal_pinjam.toString()
  );

  params.append(
    "bulan_pinjam",
    payload.bulan_pinjam.toString()
  );

  params.append(
    "tahun_pinjam",
    payload.tahun_pinjam.toString()
  );

  params.append(
    "pembayaran",
    payload.pembayaran.toString()
  );

  params.append(
    "tanggal_bayar",
    payload.tanggal_bayar.toString()
  );

  params.append(
    "bulan_bayar",
    payload.bulan_bayar.toString()
  );

  params.append(
    "tahun_bayar",
    payload.tahun_bayar.toString()
  );

  params.append(
    "keterangan",
    payload.keterangan
  );

  params.append(
    "status",
    payload.status
  );

  return apiFetch(params);
}

/* ====================================== */
/* DELETE */
/* ====================================== */

export async function deleteIncome(
  rowIndex: number
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "deleteIncome"
  );

  params.append(
    "rowIndex",
    rowIndex.toString()
  );

  return apiFetch(params);
}

export async function deleteExpense(
  rowIndex: number
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "deleteExpense"
  );

  params.append(
    "rowIndex",
    rowIndex.toString()
  );

  return apiFetch(params);
}

export async function deleteDailyGoal(
  rowIndex: number
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "deleteDailyGoal"
  );

  params.append(
    "rowIndex",
    rowIndex.toString()
  );

  return apiFetch(params);
}

export async function deleteKewajiban(
  rowIndex: number
) {

  const params =
    new URLSearchParams();

  params.append(
    "action",
    "deleteKewajiban"
  );

  params.append(
    "rowIndex",
    rowIndex.toString()
  );

  return apiFetch(params);
}