const BASE_URL =
  "https://script.google.com/macros/s/AKfycbxLUHemZUZjplprrdjy61hh5-68YZAT-2Ob9u4jROiRIT3Q4IRtmojk2wPC-YCscnAAZA/exec";

// ================= CORE FETCH =================
async function request(params = {}) {
  const url = new URL(BASE_URL);

  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store", // penting untuk data realtime
    });

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();

    // standar dari GAS kamu
    if (data.success === false) {
      throw new Error(data.message || "API Error");
    }

    return data;
  } catch (err) {
    console.error("API ERROR:", err.message);
    throw err;
  }
}

// ================= GENERIC =================
export async function apiGet(action, params = {}) {
  return request({
    action,
    ...params,
  });
}

// ================= TARGET =================
export async function getWeeklyTarget(offset = 0) {
  return apiGet("weeklyTarget", { offset });
}

// (future ready)
export async function getMonthlyTarget() {
  return apiGet("monthlyTarget");
}