let currentMeals = [];
let favorites = JSON.parse(localStorage.getItem("foodieFavorites")) || [];


// ===============================
// LOAD MEALS
// ===============================
async function loadDashboard() {

  const mealsContainer = document.getElementById("meals");

  mealsContainer.innerHTML = `
    <div class="loading">
      🍳 กำลังโหลดเมนู...
    </div>
  `;

  try {

    const sort = document.getElementById("sort").value;
    const order = document.getElementById("order").value;
    const keyword = document.getElementById("searchInput").value.trim();

    let url;

    if (keyword) {
      url = `/search?q=${encodeURIComponent(keyword)}`;
    } else {
      url = `/meals?sort=${sort}&order=${order}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("โหลดข้อมูลไม่สำเร็จ");
    }

    const result = await response.json();

    currentMeals = result.data || [];

    renderMeals(currentMeals);

    document.getElementById("sortInfo").innerHTML = `
      <div style="margin-top:10px;">
        📊 ${result.algorithm || sort}
        | ${result.count || currentMeals.length} เมนู
        ${result.ms !== undefined ? `| ⏱️ ${result.ms} ms` : ""}
      </div>
    `;

    renderFavorites();

  } catch (error) {

    showError(error.message);

  }
}


// ===============================
// SELECTION SORT
// ===============================
function selectionSort(arr, order = "asc") {

  const data = [...arr];

  for (let i = 0; i < data.length - 1; i++) {

    let selected = i;

    for (let j = i + 1; j < data.length; j++) {

      const a = data[j].name.toLowerCase();
      const b = data[selected].name.toLowerCase();

      if (
        order === "asc"
          ? a < b
          : a > b
      ) {
        selected = j;
      }

    }

    if (selected !== i) {

      const temp = data[i];

      data[i] = data[selected];

      data[selected] = temp;
    }
  }

  return data;
}


// ===============================
// INSERTION SORT
// ===============================
function insertionSort(arr, order = "asc") {

  const data = [...arr];

  for (let i = 1; i < data.length; i++) {

    const current = data[i];

    let j = i - 1;

    while (
      j >= 0 &&
      (
        order === "asc"
          ? data[j].name.toLowerCase() > current.name.toLowerCase()
          : data[j].name.toLowerCase() < current.name.toLowerCase()
      )
    ) {

      data[j + 1] = data[j];

      j--;
    }

    data[j + 1] = current;
  }

  return data;
}


// ===============================
// BUBBLE SORT
// ===============================
function bubbleSort(arr, order = "asc") {

  const data = [...arr];

  for (let i = 0; i < data.length; i++) {

    for (let j = 0; j < data.length - i - 1; j++) {

      const a = data[j].name.toLowerCase();
      const b = data[j + 1].name.toLowerCase();

      const shouldSwap =
        order === "asc"
          ? a > b
          : a < b;

      if (shouldSwap) {

        const temp = data[j];

        data[j] = data[j + 1];

        data[j + 1] = temp;
      }
    }
  }

  return data;
}


// ===============================
// RENDER MEALS
// ===============================
function renderMeals(meals) {

  const container = document.getElementById("meals");

  if (!meals || meals.length === 0) {

    container.innerHTML = `
      <div class="empty">
        😭 ไม่พบเมนูอาหาร
      </div>
    `;

    return;
  }

  container.innerHTML = meals.map((meal, index) => {

    const isFavorite = favorites.some(
      item => String(item.id) === String(meal.id)
    );

    return `
      <div class="meal-card">

        <img
          src="${meal.image}"
          alt="${meal.name}"
        >

        <div class="meal-content">

          <h3>
            ${index + 1}. ${meal.name}
          </h3>

          <div class="meal-tags">

            <span class="tag">
              🍴 ${meal.category || "Unknown"}
            </span>

            <span class="tag">
              🌎 ${meal.area || "Unknown"}
            </span>

          </div>

          <div class="card-buttons">

            <button
              class="detail-btn"
              onclick="showDetail(${meal.id})"
            >
              👀 รายละเอียด
            </button>

            <button
              class="favorite-button"
              onclick="toggleFavorite(${meal.id})"
            >
              ${isFavorite ? "❤️" : "♡"}
            </button>

          </div>

        </div>

      </div>
    `;

  }).join("");
}


// ===============================
// SHOW DETAIL
// ===============================
async function showDetail(id) {

  const detail = document.getElementById("detail");

  detail.style.display = "block";

  detail.innerHTML = `
    <div class="loading">
      🍳 กำลังโหลดรายละเอียด...
    </div>
  `;

  try {

    const response = await fetch(`/meals/${id}`);

    if (!response.ok) {
      throw new Error("ไม่พบข้อมูลเมนู");
    }

    const meal = await response.json();

    detail.innerHTML = `

      <button
        onclick="closeDetail()"
        style="background:#ffe0ec;color:#c45a89;margin-bottom:15px;"
      >
        ✖ ปิด
      </button>

      <img
        src="${meal.image}"
        alt="${meal.name}"
      >

      <h2>
        🍽️ ${meal.name}
      </h2>

      <p>
        🆔 ID: ${meal.id}
      </p>

      <p>
        🍴 Category: ${meal.category || "Unknown"}
      </p>

      <p>
        🌎 Area: ${meal.area || "Unknown"}
      </p>

      <h3>
        📝 วิธีทำ
      </h3>

      <p class="instructions">
        ${meal.instructions || "ไม่มีข้อมูลวิธีทำ"}
      </p>

    `;

    detail.scrollIntoView({
      behavior: "smooth"
    });

  } catch (error) {

    detail.innerHTML = `
      <div class="error">
        ❌ ${error.message}
      </div>
    `;

  }
}


// ===============================
// CLOSE DETAIL
// ===============================
function closeDetail() {

  const detail = document.getElementById("detail");

  detail.style.display = "none";

  detail.innerHTML = "";

}


// ===============================
// RANDOM MEAL
// ===============================
async function randomMeal() {

  const result = document.getElementById("randomResult");

  result.innerHTML = `
    <div class="loading">
      🎲 กำลังสุ่มเมนู...
    </div>
  `;

  try {

    const response = await fetch("/random");

    if (!response.ok) {
      throw new Error("สุ่มเมนูไม่สำเร็จ");
    }

    const meal = await response.json();

    const isFavorite = favorites.some(
      item => String(item.id) === String(meal.id)
    );

    result.innerHTML = `

      <div class="random-card">

        <img
          src="${meal.image}"
          alt="${meal.name}"
        >

        <h2>
          🍓 ${meal.name}
        </h2>

        <p>
          🍴 Category: ${meal.category || "Unknown"}
        </p>

        <p>
          🌎 Area: ${meal.area || "Unknown"}
        </p>

        <p>
          🆔 ID: ${meal.id}
        </p>

        <button
          class="detail-btn"
          onclick="showDetail(${meal.id})"
        >
          👀 ดูรายละเอียด
        </button>

        <button
          class="favorite-button"
          onclick="toggleFavorite(${meal.id})"
        >
          ${isFavorite ? "❤️ อยู่ในเมนูโปรดแล้ว" : "♡ เพิ่มในเมนูโปรด"}
        </button>

      </div>

    `;

  } catch (error) {

    result.innerHTML = `
      <div class="error">
        ❌ ${error.message}
      </div>
    `;

  }
}


// ===============================
// FAVORITE
// ===============================
function toggleFavorite(id) {

  const meal =
    currentMeals.find(
      item => String(item.id) === String(id)
    );

  if (!meal) {

    const existing =
      favorites.find(
        item => String(item.id) === String(id)
      );

    if (existing) {

      favorites = favorites.filter(
        item => String(item.id) !== String(id)
      );

      saveFavorites();

    }

    return;
  }

  const exists = favorites.some(
    item => String(item.id) === String(id)
  );

  if (exists) {

    favorites = favorites.filter(
      item => String(item.id) !== String(id)
    );

  } else {

    favorites.push(meal);

  }

  saveFavorites();

  renderMeals(currentMeals);

  renderFavorites();
}


// ===============================
// SAVE FAVORITES
// ===============================
function saveFavorites() {

  localStorage.setItem(
    "foodieFavorites",
    JSON.stringify(favorites)
  );

}


// ===============================
// RENDER FAVORITES
// ===============================
function renderFavorites() {

  const container =
    document.getElementById("favorites");

  if (!favorites.length) {

    container.innerHTML = `
      <div class="empty">
        💗 ยังไม่มีเมนูโปรด
      </div>
    `;

    return;
  }

  container.innerHTML = favorites.map(meal => `

    <div class="favorite-item">

      <img
        src="${meal.image}"
        alt="${meal.name}"
      >

      <h4>
        ${meal.name}
      </h4>

      <p>
        🍴 ${meal.category || "Unknown"}
      </p>

      <p>
        🌎 ${meal.area || "Unknown"}
      </p>

      <button
        class="detail-btn"
        onclick="showDetail(${meal.id})"
      >
        👀 ดูรายละเอียด
      </button>

      <button
        class="favorite-button"
        onclick="toggleFavorite(${meal.id})"
      >
        💔 ลบออก
      </button>

    </div>

  `).join("");
}


// ===============================
// SEARCH
// ===============================
function searchMeals() {

  loadDashboard();

}


// ===============================
// ERROR
// ===============================
function showError(message) {

  document.getElementById("error").innerHTML = `
    <div class="error">
      ❌ ${message}
    </div>
  `;

}


// ===============================
// EVENTS
// ===============================
document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDashboard();

    renderFavorites();

    document
      .getElementById("sort")
      .addEventListener(
        "change",
        loadDashboard
      );

    document
      .getElementById("order")
      .addEventListener(
        "change",
        loadDashboard
      );

    document
      .getElementById("searchInput")
      .addEventListener(
        "keydown",
        event => {

          if (event.key === "Enter") {
            searchMeals();
          }

        }
      );

  }
);