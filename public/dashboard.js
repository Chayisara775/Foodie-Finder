// =====================================================================
// dashboard.js — Foodie Finder
// =====================================================================

// =====================================================================
// ตัวแปร
// =====================================================================

let currentMeals = [];
let currentAlgorithm = 'selection';
let currentOrder = 'asc';

// =====================================================================
// โหลดเมนู
// =====================================================================

async function loadDashboard() {

  currentAlgorithm =
    document.getElementById('algo').value;

  currentOrder =
    document.getElementById('order').value;

  const keyword =
    document.getElementById('searchInput').value.trim();

  const country =
    document.getElementById('country').value;

  try {

    let url;

    // ถ้ามีคำค้น
    if (keyword) {

      url =
        `/search?q=${encodeURIComponent(keyword)}`;

    } else {

      url =
        `/meals?sort=${currentAlgorithm}&order=${currentOrder}`;

    }

    const res =
      await fetch(url);

    if (!res.ok) {
      throw new Error('โหลดข้อมูลไม่สำเร็จ');
    }

    const result =
      await res.json();

    let data =
      result.data || [];

    // ===============================================================
    // Filter ประเทศ
    // ===============================================================

    if (country) {

      data =
        data.filter(meal =>
          meal.area === country
        );

    }

    // ===============================================================
    // Sort
    // ถ้ามี keyword หรือ filter ประเทศ
    // ต้อง Sort ฝั่งหน้าเว็บอีกครั้ง
    // ===============================================================

    if (keyword || country) {

      data =
        sortMeals(
          data,
          currentAlgorithm,
          currentOrder
        );

    }

    currentMeals = data;

    renderMeals(data);

    // ===============================================================
    // แสดงข้อมูล Sort
    // ===============================================================

    const algorithmName = {

      selection: 'Selection Sort',
      insertion: 'Insertion Sort',
      bubble: 'Bubble Sort'

    };

    const orderName =
      currentOrder === 'asc'
        ? 'A → Z'
        : 'Z → A';

    document.getElementById(
      'sortInfo'
    ).innerHTML = `
      🔀 ${algorithmName[currentAlgorithm]}
      <span>•</span>
      ${orderName}
      <span>•</span>
      พบ ${data.length} เมนู
    `;

    document.getElementById(
      'error'
    ).style.display = 'none';

  } catch (err) {

    showError(err.message);

  }

}

// =====================================================================
// Sort
// =====================================================================

function sortMeals(arr, algo, order) {

  if (algo === 'insertion') {

    return insertionSort(
      arr,
      order
    );

  }

  if (algo === 'bubble') {

    return bubbleSort(
      arr,
      order
    );

  }

  return selectionSort(
    arr,
    order
  );

}

// =====================================================================
// Selection Sort
// =====================================================================

function selectionSort(arr, order = 'asc') {

  const a = [...arr];

  for (
    let i = 0;
    i < a.length - 1;
    i++
  ) {

    let targetIdx = i;

    for (
      let j = i + 1;
      j < a.length;
      j++
    ) {

      const compare =
        a[j].name.localeCompare(
          a[targetIdx].name
        );

      if (
        (order === 'asc' && compare < 0) ||
        (order === 'desc' && compare > 0)
      ) {

        targetIdx = j;

      }

    }

    [
      a[i],
      a[targetIdx]
    ] = [
      a[targetIdx],
      a[i]
    ];

  }

  return a;
}

// =====================================================================
// Insertion Sort
// =====================================================================

function insertionSort(arr, order = 'asc') {

  const a = [...arr];

  for (
    let i = 1;
    i < a.length;
    i++
  ) {

    const key = a[i];

    let j = i - 1;

    while (j >= 0) {

      const compare =
        a[j].name.localeCompare(
          key.name
        );

      const shouldMove =
        order === 'asc'
          ? compare > 0
          : compare < 0;

      if (!shouldMove) {
        break;
      }

      a[j + 1] =
        a[j];

      j--;

    }

    a[j + 1] =
      key;

  }

  return a;
}

// =====================================================================
// Bubble Sort
// =====================================================================

function bubbleSort(arr, order = 'asc') {

  const a = [...arr];

  for (
    let i = 0;
    i < a.length - 1;
    i++
  ) {

    for (
      let j = 0;
      j < a.length - 1 - i;
      j++
    ) {

      const compare =
        a[j].name.localeCompare(
          a[j + 1].name
        );

      const shouldSwap =
        order === 'asc'
          ? compare > 0
          : compare < 0;

      if (shouldSwap) {

        [
          a[j],
          a[j + 1]
        ] = [
          a[j + 1],
          a[j]
        ];

      }

    }

  }

  return a;
}

// =====================================================================
// แสดงเมนู
// =====================================================================

function renderMeals(meals) {

  const box =
    document.getElementById('meals');

  if (meals.length === 0) {

    box.innerHTML = `
      <div class="empty">
        😭 ไม่พบเมนูอาหาร
      </div>
    `;

    return;
  }

  box.innerHTML =
    meals.map((meal, index) => {

      const favorite =
        isFavorite(meal.id);

      return `

        <div class="meal-card">

          <div class="rank">
            #${index + 1}
          </div>

          <img
            src="${meal.image}"
            alt="${meal.name}"
          >

          <div class="meal-info">

            <h3>
              ${meal.name}
            </h3>

            <div class="meal-tags">

              <span class="tag">
                🍽️ ${meal.category || 'Food'}
              </span>

              <span class="tag">
                🌎 ${meal.area || 'World'}
              </span>

            </div>

            <div class="card-buttons">

              <button
                class="favorite-button
                ${favorite ? 'active' : ''}"
                onclick="toggleFavorite(${meal.id})"
              >
                ${favorite ? '❤️' : '♡'}
              </button>

              <button
                class="detail-button"
                onclick="showDetail(${meal.id})"
              >
                ดูวิธีทำ ♡
              </button>

            </div>

          </div>

        </div>

      `;

    }).join('');

}

// =====================================================================
// ดูรายละเอียด
// =====================================================================

async function showDetail(id) {

  try {

    const res =
      await fetch(`/meals/${id}`);

    if (!res.ok) {

      throw new Error(
        'ไม่พบข้อมูลเมนู'
      );

    }

    const meal =
      await res.json();

    document.getElementById(
      'detail'
    ).innerHTML = `

      <div class="detail-content">

        <img
          src="${meal.image}"
          alt="${meal.name}"
        >

        <div>

          <h2>
            ${meal.name}
          </h2>

          <p>
            🍽️ <b>ประเภท:</b>
            ${meal.category || '-'}
          </p>

          <p>
            🌎 <b>ประเทศ:</b>
            ${meal.area || '-'}
          </p>

          <p>
            🔑 <b>Meal ID:</b>
            ${meal.id}
          </p>

          <h3>
            👩🏻‍🍳 วิธีทำ
          </h3>

          <p class="instructions">
            ${meal.instructions ||
            'ไม่มีข้อมูลวิธีทำ'}
          </p>

        </div>

      </div>

    `;

    document.getElementById(
      'detail'
    ).scrollIntoView({
      behavior: 'smooth'
    });

  } catch (err) {

    showError(err.message);

  }

}

// =====================================================================
// 🎲 สุ่มเมนู
// =====================================================================

async function randomMeal() {

  try {

    const button =
      document.getElementById(
        'randomButton'
      );

    button.textContent =
      '🎲 กำลังสุ่ม...';

    const res =
      await fetch('/random');

    if (!res.ok) {

      throw new Error(
        'สุ่มเมนูไม่สำเร็จ'
      );

    }

    const meal =
      await res.json();

    // แสดงเมนูที่สุ่ม
    document.getElementById(
      'randomResult'
    ).innerHTML = `

      <div class="random-card">

        <img
          src="${meal.image}"
          alt="${meal.name}"
        >

        <div>

          <span>
            ✨ เมนูที่สุ่มได้
          </span>

          <h2>
            ${meal.name}
          </h2>

          <p>
            🍽️ ${meal.category || '-'}
          </p>

          <p>
            🌎 ${meal.area || '-'}
          </p>

          <button
            class="detail-button"
            onclick="showDetail(${meal.id})"
          >
            ดูวิธีทำ
          </button>

        </div>

      </div>

    `;

    document.getElementById(
      'randomResult'
    ).scrollIntoView({
      behavior: 'smooth'
    });

    button.textContent =
      '🎲 สุ่มเมนูอีกครั้ง';

  } catch (err) {

    showError(err.message);

    document.getElementById(
      'randomButton'
    ).textContent =
      '🎲 สุ่มเมนู';

  }

}

// =====================================================================
// 🌎 โหลดประเทศ
// =====================================================================

async function loadCountries() {

  try {

    const res =
      await fetch('/areas');

    if (!res.ok) {
      throw new Error(
        'โหลดประเทศไม่สำเร็จ'
      );
    }

    const areas =
      await res.json();

    const select =
      document.getElementById(
        'country'
      );

    areas.forEach(area => {

      const option =
        document.createElement(
          'option'
        );

      option.value = area;
      option.textContent =
        area;

      select.appendChild(
        option
      );

    });

  } catch (err) {

    console.log(
      'Country Error:',
      err.message
    );

  }

}

// =====================================================================
// ❤️ Favorite
// =====================================================================

function getFavorites() {

  return JSON.parse(
    localStorage.getItem(
      'foodieFavorites'
    ) || '[]'
  );

}

function saveFavorites(favorites) {

  localStorage.setItem(
    'foodieFavorites',
    JSON.stringify(favorites)
  );

}

function isFavorite(id) {

  const favorites =
    getFavorites();

  return favorites.includes(
    Number(id)
  );

}

function toggleFavorite(id) {

  let favorites =
    getFavorites();

  id = Number(id);

  if (favorites.includes(id)) {

    favorites =
      favorites.filter(
        item => item !== id
      );

  } else {

    favorites.push(id);

  }

  saveFavorites(favorites);

  renderMeals(
    currentMeals
  );

  renderFavorites();

}

// =====================================================================
// แสดงเมนูโปรด
// =====================================================================

async function renderFavorites() {

  const box =
    document.getElementById(
      'favorites'
    );

  const favorites =
    getFavorites();

  if (favorites.length === 0) {

    box.innerHTML = `
      <p class="empty">
        ♡ ยังไม่มีเมนูโปรด
      </p>
    `;

    return;

  }

  const results = [];

  for (
    const id of favorites
  ) {

    try {

      const res =
        await fetch(
          `/meals/${id}`
        );

      if (res.ok) {

        const meal =
          await res.json();

        results.push(meal);

      }

    } catch (err) {

      console.log(err);

    }

  }

  box.innerHTML =
    results.map(meal => `

      <div class="favorite-item">

        <img
          src="${meal.image}"
          alt="${meal.name}"
        >

        <div>

          <strong>
            ${meal.name}
          </strong>

          <small>
            🌎 ${meal.area || '-'}
          </small>

        </div>

        <button
          onclick="showDetail(${meal.id})"
        >
          ดู
        </button>

        <button
          class="remove-favorite"
          onclick="toggleFavorite(${meal.id})"
        >
          ✕
        </button>

      </div>

    `).join('');

}

// =====================================================================
// Search
// =====================================================================

function searchMeals() {

  loadDashboard();

}

// =====================================================================
// Error
// =====================================================================

function showError(msg) {

  const box =
    document.getElementById(
      'error'
    );

  box.textContent =
    msg;

  box.style.display =
    'block';

}

// =====================================================================
// เริ่มต้นเว็บ
// =====================================================================

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const input =
      document.getElementById(
        'searchInput'
      );

    const algo =
      document.getElementById(
        'algo'
      );

    const order =
      document.getElementById(
        'order'
      );

    const country =
      document.getElementById(
        'country'
      );

    input.addEventListener(
      'keydown',
      event => {

        if (
          event.key === 'Enter'
        ) {

          searchMeals();

        }

      }
    );

    // เปลี่ยน Sort แล้วเรียงทันที
    algo.addEventListener(
      'change',
      loadDashboard
    );

    // เปลี่ยน A-Z / Z-A
    order.addEventListener(
      'change',
      loadDashboard
    );

    // เปลี่ยนประเทศ
    country.addEventListener(
      'change',
      loadDashboard
    );

    loadCountries();

    loadDashboard();

    renderFavorites();

  }
);