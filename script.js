
function getRecords() {
    const stored = localStorage.getItem("records");
    return stored ? JSON.parse(stored) : {};
}

function saveRecords(records) {
    localStorage.setItem("records", JSON.stringify(records));
}

function getTodayKey() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
}

function saveData() {
    const key = getTodayKey();
    const records = getRecords();

    if (!records[key]) {
        records[key] = { breakfast: {}, lunch: {}, dinner: {} };
    }

    const time = new Date().toTimeString().slice(0, 5);
    const preMeal = document.getElementById("preMealBloodSugar").value;
    const carbs = document.getElementById("carbs").value;
    const ci = document.getElementById("ci").value;
    const insulin = document.getElementById("insulin").value;
    const note = document.getElementById("note").value;
    const correction = document.getElementById("correctionFactor").value;
    const target = document.getElementById("targetBloodSugar").value;

    const suggested = preMeal && carbs && ci ? ( (preMeal - target) / correction + carbs / ci ) : null;
    const estimate = insulin && carbs && ci ? ( target - (insulin - carbs / ci) * correction ) : null;

    let meal = "breakfast";
    const hour = new Date().getHours();
    if (hour >= 15) meal = "dinner";
    else if (hour >= 11) meal = "lunch";

    records[key][meal] = {
        time, preMeal, carbs, ci, insulin, note,
        suggested: suggested ? suggested.toFixed(2) : null,
        estimate: estimate ? Math.round(estimate) : null
    };

    saveRecords(records);
    showRecords();
}

function showRecords() {
    const key = getTodayKey();
    const records = getRecords()[key] || {};
    const container = document.getElementById("recordList");
    container.innerHTML = "";

    let html = "<table><tr><th>餐別</th><th>時間</th><th>餐前</th><th>碳水</th><th>CI</th><th>施打</th><th>建議</th><th>預估</th><th>備註</th></tr>";
    ["breakfast", "lunch", "dinner"].forEach(meal => {
        const r = records[meal] || {};
        html += `<tr><td>${meal}</td><td>${r.time || ""}</td><td>${r.preMeal || ""}</td><td>${r.carbs || ""}</td><td>${r.ci || ""}</td>
        <td>${r.insulin || ""}</td><td>${r.suggested || ""}</td><td>${r.estimate || ""}</td><td>${r.note || ""}</td></tr>`;
    });
    html += "</table>";
    container.innerHTML = html;
}

function exportExcel() {
    const key = getTodayKey();
    const records = getRecords()[key];
    if (!records) return alert("無資料可匯出");

    let content = "data:application/vnd.ms-excel,";
    content += encodeURIComponent("項目\t早餐\t中餐\t晚餐\n");

    const fields = ["time", "preMeal", "carbs", "ci", "insulin", "suggested", "estimate", "note"];
    const labels = ["時間", "餐前血糖", "碳水", "CI", "施打", "建議", "預估", "備註"];

    labels.forEach((label, i) => {
        content += label + "\t";
        ["breakfast", "lunch", "dinner"].forEach(meal => {
            content += (records[meal]?.[fields[i]] || "") + "\t";
        });
        content += "\n";
    });

    const a = document.createElement("a");
    a.href = content;
    a.download = "血糖紀錄_" + key.replace(/-/g, "") + ".xls";
    a.click();
}

showRecords();
