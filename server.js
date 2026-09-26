// =====================================================================
// 801201 Week 8 — Foodie Finder
// TheMealDB API + Sort + Hash Table
// =====================================================================

const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const API_URL =
  'https://www.themealdb.com/api/json/v1/1/search.php?s=chicken';

let meals = [];

// =====================================================================
// Hash Table
// =====================================================================

const mealTable = {};

// =====================================================================
// โหลดข้อมูลจาก TheMealDB
// =====================================================================

async function loadMeals() {

  try {

    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error('API ตอบ status ' + res.status);
    }

    const data = await res.json();

    meals = (data.meals || []).map(meal => ({
      id: Number(meal.idMeal),
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      image: meal.strMealThumb,
      instructions: meal.strInstructions
    }));

    // สร้าง Hash Table
    meals.forEach(meal => {
      mealTable[meal.id] = meal;
    });

    console.log(`✅ โหลดอาหารสำเร็จ: ${meals.length} เมนู`);
    console.log(
      `✅ Hash Table สำเร็จ: ${Object.keys(mealTable).length} รายการ`
    );

  } catch (err) {

    console.log(
      `❌ โหลด TheMealDB ไม่สำเร็จ: ${err.message}`
    );

    meals = [];
  }

}

// =====================================================================
// Selection Sort
// =====================================================================

function selectionSort(arr, order = 'asc') {

  const a = [...arr];

  for (let i = 0; i < a.length - 1; i++) {

    let targetIdx = i;

    for (let j = i + 1; j < a.length; j++) {

      const compare =
        a[j].name.localeCompare(a[targetIdx].name);

      if (
        (order === 'asc' && compare < 0) ||
        (order === 'desc' && compare > 0)
      ) {
        targetIdx = j;
      }

    }

    [a[i], a[targetIdx]] =
      [a[targetIdx], a[i]];
  }

  return a;
}

// =====================================================================
// Insertion Sort
// =====================================================================

function insertionSort(arr, order = 'asc') {

  const a = [...arr];

  for (let i = 1; i < a.length; i++) {

    const key = a[i];

    let j = i - 1;

    while (j >= 0) {

      const compare =
        a[j].name.localeCompare(key.name);

      const shouldMove =
        order === 'asc'
          ? compare > 0
          : compare < 0;

      if (!shouldMove) break;

      a[j + 1] = a[j];
      j--;
    }

    a[j + 1] = key;
  }

  return a;
}

// =====================================================================
// Bubble Sort
// =====================================================================

function bubbleSort(arr, order = 'asc') {

  const a = [...arr];

  for (let i = 0; i < a.length - 1; i++) {

    for (
      let j = 0;
      j < a.length - 1 - i;
      j++
    ) {

      const compare =
        a[j].name.localeCompare(a[j + 1].name);

      const shouldSwap =
        order === 'asc'
          ? compare > 0
          : compare < 0;

      if (shouldSwap) {

        [a[j], a[j + 1]] =
          [a[j + 1], a[j]];

      }
    }
  }

  return a;
}

// =====================================================================
// เลือก Sort
// =====================================================================

function sortMeals(arr, algo, order) {

  if (algo === 'insertion') {
    return insertionSort(arr, order);
  }

  if (algo === 'bubble') {
    return bubbleSort(arr, order);
  }

  return selectionSort(arr, order);
}

// =====================================================================
// GET /meals
// =====================================================================

app.get('/meals', (req, res) => {

  const algo = req.query.sort || 'selection';
  const order = req.query.order || 'asc';

  const t0 = performance.now();

  const sorted = sortMeals(
    meals,
    algo,
    order
  );

  const ms =
    (performance.now() - t0).toFixed(3);

  res.json({
    algorithm: algo,
    order: order,
    count: sorted.length,
    ms: ms,
    data: sorted
  });

});

// =====================================================================
// GET /search
// ค้นหาอาหารจาก TheMealDB โดยตรง
// =====================================================================

app.get('/search', async (req, res) => {

  const keyword =
    (req.query.q || '').trim();

  if (!keyword) {

    return res.json({
      keyword: '',
      count: meals.length,
      data: meals
    });

  }

  try {

    const url =
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(keyword)}`;

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error('ค้นหา API ไม่สำเร็จ');
    }

    const data =
      await response.json();

    const result =
      (data.meals || []).map(meal => ({

        id: Number(meal.idMeal),
        name: meal.strMeal,
        category: meal.strCategory,
        area: meal.strArea,
        image: meal.strMealThumb,
        instructions: meal.strInstructions

      }));

    // เพิ่มข้อมูลลง Hash Table
    result.forEach(meal => {
      mealTable[meal.id] = meal;
    });

    res.json({
      keyword: keyword,
      count: result.length,
      data: result
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// =====================================================================
// GET /meals/:id
// Hash Table Lookup
// =====================================================================

app.get('/meals/:id', async (req, res) => {

  const id =
    Number(req.params.id);

  // ค้นจาก Hash Table ก่อน
  if (mealTable[id]) {

    return res.json(
      mealTable[id]
    );

  }

  // ถ้าไม่มี ให้ขอจาก API
  try {

    const response =
      await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );

    const data =
      await response.json();

    if (!data.meals) {

      return res.status(404).json({
        error: 'ไม่พบเมนูนี้'
      });

    }

    const m =
      data.meals[0];

    const meal = {

      id: Number(m.idMeal),
      name: m.strMeal,
      category: m.strCategory,
      area: m.strArea,
      image: m.strMealThumb,
      instructions: m.strInstructions

    };

    // เก็บลง Hash Table
    mealTable[id] = meal;

    res.json(meal);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// =====================================================================
// GET /random
// สุ่มเมนู
// =====================================================================

app.get('/random', async (req, res) => {

  try {

    const response =
      await fetch(
        'https://www.themealdb.com/api/json/v1/1/random.php'
      );

    const data =
      await response.json();

    if (!data.meals) {

      return res.status(404).json({
        error: 'สุ่มเมนูไม่สำเร็จ'
      });

    }

    const m =
      data.meals[0];

    const meal = {

      id: Number(m.idMeal),
      name: m.strMeal,
      category: m.strCategory,
      area: m.strArea,
      image: m.strMealThumb,
      instructions: m.strInstructions

    };

    mealTable[meal.id] = meal;

    res.json(meal);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// =====================================================================
// GET /areas
// รายชื่อประเทศ/พื้นที่
// =====================================================================

app.get('/areas', async (req, res) => {

  try {

    const response =
      await fetch(
        'https://www.themealdb.com/api/json/v1/1/list.php?a=list'
      );

    const data =
      await response.json();

    const areas =
      (data.meals || [])
        .map(item => item.strArea);

    res.json(areas);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// =====================================================================
// Start Server
// =====================================================================

loadMeals().then(() => {

  app.listen(PORT, () => {

    console.log('');
    console.log('🍓 Foodie Finder พร้อมใช้งาน');
    console.log(`🌐 http://localhost:${PORT}`);

  });

});