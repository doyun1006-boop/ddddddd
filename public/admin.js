const dialog = document.querySelector("#passwordDialog");
const passwordInput = document.querySelector("#passwordInput");
const unlockBtn = document.querySelector("#unlockBtn");
const academyNameInput = document.querySelector("#academyNameInput");
const heroTitleInput = document.querySelector("#heroTitleInput");
const heroDescriptionInput = document.querySelector("#heroDescriptionInput");
const noticeInput = document.querySelector("#noticeInput");
const linkEditorList = document.querySelector("#linkEditorList");
const addLinkBtn = document.querySelector("#addLinkBtn");
const categoryEditorList = document.querySelector("#categoryEditorList");
const addCategoryBtn = document.querySelector("#addCategoryBtn");
const addClassBtn = document.querySelector("#addClassBtn");
const saveBtn = document.querySelector("#saveBtn");
const list = document.querySelector("#classEditorList");
const classCount = document.querySelector("#classCount");
const adminMessage = document.querySelector("#adminMessage");
const adminCategoryTabs = document.querySelector("#adminCategoryTabs");

const days = ["월", "화", "수", "목", "금", "토", "일"];
const defaultCategories = [
  { id: "basketball", label: "농구", shortLabel: "농구", icon: "🏀" },
  { id: "soccer", label: "축구", shortLabel: "축구", icon: "⚽" },
  { id: "kids", label: "키즈", shortLabel: "키즈", icon: "🧒" }
];

const defaultActionLinks = [
  { id: "opening", label: "개설 희망", url: "https://classroute-site.netlify.app/", style: "secondary" },
  { id: "gathering", label: "반 모으기", url: "https://classroute-site.netlify.app/", style: "secondary" },
  { id: "counsel", label: "상담 및 신청서 작성", url: "https://dosportslink.netlify.app/", style: "primary" }
];

const defaults = {
  academyName: "DO SPORTS ACADEMY",
  heroTitle: "농구 · 축구 · 키즈 수업을 한눈에 보는 시간표",
  heroDescription: "수업 시간, 학년, 정원, 장소를 확인하시고 변경 사항은 최대 2초 안에 자동 반영됩니다.",
  notice: "시간표는 수시로 변경될 수 있습니다. 장소와 정원 현황을 꼭 확인해 주세요.",
  categories: defaultCategories,
  actionLinks: defaultActionLinks
};

const fallbackLessons = [
  { id: "sample-basketball-1", category: "basketball", day: "월", startTime: "15:00", endTime: "16:00", name: "농구 기초반", grade: "초1-3", capacity: 10, currentStudents: 7, place: "1코트" },
  { id: "sample-basketball-2", category: "basketball", day: "수", startTime: "17:00", endTime: "18:20", name: "농구 스킬반", grade: "초4-6", capacity: 12, currentStudents: 10, place: "메인코트" },
  { id: "sample-basketball-3", category: "basketball", day: "금", startTime: "19:00", endTime: "20:30", name: "중등 농구반", grade: "중1-3", capacity: 12, currentStudents: 8, place: "메인코트" },
  { id: "sample-soccer-1", category: "soccer", day: "화", startTime: "16:00", endTime: "17:00", name: "축구 기초반", grade: "초1-2", capacity: 12, currentStudents: 9, place: "풋살장" },
  { id: "sample-soccer-2", category: "soccer", day: "목", startTime: "18:00", endTime: "19:20", name: "축구 게임반", grade: "초3-5", capacity: 14, currentStudents: 14, place: "풋살장" },
  { id: "sample-kids-1", category: "kids", day: "월", startTime: "16:20", endTime: "17:10", name: "키즈 체육", grade: "6-7세", capacity: 8, currentStudents: 5, place: "키즈룸" },
  { id: "sample-kids-2", category: "kids", day: "토", startTime: "11:00", endTime: "11:50", name: "유아 밸런스", grade: "5-7세", capacity: 8, currentStudents: 6, place: "키즈룸" }
];

let adminPassword = sessionStorage.getItem("academyAdminPassword") || "";
let activeCategory = sessionStorage.getItem("academyAdminCategory") || "basketball";
let categories = [...defaultCategories];
let lessons = [];
let actionLinks = [...defaultActionLinks];

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function categoryId() {
  return `category-${uid().replaceAll("-", "").slice(0, 12)}`;
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value, fallback = "https://dosportslink.netlify.app/") {
  const url = String(value || "").trim();
  return url.startsWith("https://") || url.startsWith("http://") ? url : fallback;
}

function normalizeCategories(data = {}) {
  const source = Array.isArray(data.categories) && data.categories.length ? data.categories : defaultCategories;
  const used = new Set();

  const result = source.slice(0, 20).map((category, index) => {
    const fallback = defaultCategories[index] || { label: "수업분류", icon: "🏷️" };
    const rawId = String(category.id || `category-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, "-") || `category-${index + 1}`;
    let id = rawId;
    let suffix = 2;
    while (used.has(id)) {
      id = `${rawId}-${suffix}`;
      suffix += 1;
    }
    used.add(id);

    const label = String(category.label || category.shortLabel || fallback.label || "수업분류").trim() || "수업분류";
    return {
      id,
      label: label.slice(0, 30),
      shortLabel: String(category.shortLabel || label).trim().slice(0, 20),
      icon: String(category.icon || fallback.icon || "🏷️").trim().slice(0, 8)
    };
  });

  return result.length ? result : [...defaultCategories];
}

function firstCategoryId() {
  return categories[0]?.id || "basketball";
}

function ensureActiveCategory() {
  if (!categories.some((category) => category.id === activeCategory)) {
    activeCategory = firstCategoryId();
    sessionStorage.setItem("academyAdminCategory", activeCategory);
  }
}

function normalizeActionLinks(data = {}) {
  const legacyLinks = [
    { id: "opening", label: data.openingLinkLabel || "개설 희망", url: data.openingLinkUrl || "https://classroute-site.netlify.app/", style: "secondary" },
    { id: "gathering", label: data.gatheringLinkLabel || "반 모으기", url: data.gatheringLinkUrl || "https://classroute-site.netlify.app/", style: "secondary" },
    { id: "counsel", label: data.counselLinkLabel || "상담 및 신청서 작성", url: data.counselLinkUrl || "https://dosportslink.netlify.app/", style: "primary" }
  ];

  const source = Array.isArray(data.actionLinks) && data.actionLinks.length ? data.actionLinks : legacyLinks;

  return source.slice(0, 10).map((link, index) => {
    const fallback = defaultActionLinks[index] || defaultActionLinks[defaultActionLinks.length - 1];
    return {
      id: link.id || uid(),
      label: link.label || fallback.label || "바로가기",
      url: safeUrl(link.url, fallback.url),
      style: link.style === "primary" ? "primary" : "secondary"
    };
  });
}

function normalizeLesson(lesson) {
  const categoryIds = categories.map((category) => category.id);
  return {
    id: lesson.id || uid(),
    category: categoryIds.includes(lesson.category) ? lesson.category : firstCategoryId(),
    day: days.includes(lesson.day) ? lesson.day : "월",
    startTime: lesson.startTime || "15:00",
    endTime: lesson.endTime || "16:00",
    name: lesson.name || "",
    grade: lesson.grade || "",
    capacity: Number(lesson.capacity || 0),
    currentStudents: Number(lesson.currentStudents || 0),
    place: lesson.place || lesson.room || ""
  };
}

function newLesson() {
  return {
    id: uid(),
    category: activeCategory,
    day: "월",
    startTime: "15:00",
    endTime: "16:00",
    name: "",
    grade: "",
    capacity: 8,
    currentStudents: 0,
    place: ""
  };
}

function newActionLink() {
  return {
    id: uid(),
    label: "상담 신청",
    url: "https://dosportslink.netlify.app/",
    style: "secondary"
  };
}

function newCategory() {
  return {
    id: categoryId(),
    label: "새 수업분류",
    shortLabel: "새 분류",
    icon: "🏷️"
  };
}

function setMessage(text, isError = false) {
  adminMessage.textContent = text;
  adminMessage.style.color = isError ? "#ef4444" : "#16a34a";
}

function readRow(row) {
  return {
    id: row.dataset.id,
    category: row.querySelector("[data-field='category']").value,
    day: row.querySelector("[data-field='day']").value,
    startTime: row.querySelector("[data-field='startTime']").value,
    endTime: row.querySelector("[data-field='endTime']").value,
    name: row.querySelector("[data-field='name']").value.trim(),
    grade: row.querySelector("[data-field='grade']").value.trim(),
    capacity: Number(row.querySelector("[data-field='capacity']").value || 0),
    currentStudents: Number(row.querySelector("[data-field='currentStudents']").value || 0),
    place: row.querySelector("[data-field='place']").value.trim()
  };
}

function readLinkRow(row) {
  return {
    id: row.dataset.id,
    label: row.querySelector("[data-link-field='label']").value.trim(),
    url: row.querySelector("[data-link-field='url']").value.trim(),
    style: row.querySelector("[data-link-field='style']").value
  };
}

function readCategoryRow(row) {
  const label = row.querySelector("[data-category-field='label']").value.trim();
  return {
    id: row.dataset.id,
    label,
    shortLabel: label,
    icon: row.querySelector("[data-category-field='icon']").value.trim() || "🏷️"
  };
}

function updateFromInputs() {
  if (categoryEditorList) {
    const categoryRows = [...categoryEditorList.querySelectorAll(".category-row")];
    if (categoryRows.length) {
      categories = normalizeCategories({ categories: categoryRows.map(readCategoryRow) });
      ensureActiveCategory();
    }
  }

  const visibleRows = [...list.querySelectorAll(".class-row")];
  if (visibleRows.length) {
    const updatedById = new Map(visibleRows.map((row) => [row.dataset.id, normalizeLesson(readRow(row))]));
    lessons = lessons.map((lesson) => updatedById.get(lesson.id) || lesson);
  }

  actionLinks = [...linkEditorList.querySelectorAll(".link-row")]
    .map(readLinkRow)
    .filter((link) => link.label && link.url)
    .map((link) => ({
      id: link.id || uid(),
      label: link.label,
      url: link.url,
      style: link.style === "primary" ? "primary" : "secondary"
    }));
}

function renderLinkEditor() {
  linkEditorList.innerHTML = "";

  if (!actionLinks.length) {
    const empty = document.createElement("div");
    empty.className = "editor-empty small-empty";
    empty.textContent = "등록된 버튼이 없습니다. 아래 버튼을 눌러 상담/신청 버튼을 추가해 주세요.";
    linkEditorList.append(empty);
    return;
  }

  actionLinks.forEach((link, index) => {
    const row = document.createElement("div");
    row.className = "link-row";
    row.dataset.id = link.id || uid();
    row.innerHTML = `
      <label>버튼명
        <input data-link-field="label" type="text" value="${escapeAttr(link.label)}" placeholder="예: 상담 신청" />
      </label>
      <label>연결 링크
        <input data-link-field="url" type="url" value="${escapeAttr(link.url)}" placeholder="https://..." />
      </label>
      <label>강조
        <select data-link-field="style">
          <option value="secondary" ${link.style !== "primary" ? "selected" : ""}>일반</option>
          <option value="primary" ${link.style === "primary" ? "selected" : ""}>강조</option>
        </select>
      </label>
      <div class="row-actions link-actions">
        <button type="button" data-link-action="up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-link-action="down" ${index === actionLinks.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" class="danger" data-link-action="remove">삭제</button>
      </div>
    `;
    linkEditorList.append(row);
  });
}

function renderCategoryEditor() {
  if (!categoryEditorList) return;
  categoryEditorList.innerHTML = "";

  categories.forEach((category, index) => {
    const count = lessons.filter((lesson) => lesson.category === category.id).length;
    const row = document.createElement("div");
    row.className = "category-row";
    row.dataset.id = category.id;
    row.innerHTML = `
      <label>아이콘
        <input data-category-field="icon" type="text" value="${escapeAttr(category.icon || "🏷️")}" maxlength="4" placeholder="🏀" />
      </label>
      <label>수업분류명
        <input data-category-field="label" type="text" value="${escapeAttr(category.label)}" placeholder="예: 입시체육" />
      </label>
      <div class="category-count">${count}개 수업</div>
      <div class="row-actions category-actions">
        <button type="button" data-category-action="up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-category-action="down" ${index === categories.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" class="danger" data-category-action="remove" ${categories.length === 1 ? "disabled" : ""}>삭제</button>
      </div>
    `;
    categoryEditorList.append(row);
  });
}

function renderAdminTabs() {
  adminCategoryTabs.innerHTML = "";
  ensureActiveCategory();

  categories.forEach((category) => {
    const count = lessons.filter((lesson) => lesson.category === category.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tab-button ${activeCategory === category.id ? "active" : ""}`;
    button.dataset.category = category.id;
    button.innerHTML = `<span>${escapeAttr(category.icon || "")} ${escapeAttr(category.label)}</span><strong>${count}</strong>`;
    adminCategoryTabs.append(button);
  });
}

function renderEditor() {
  list.innerHTML = "";
  renderCategoryEditor();
  renderAdminTabs();
  renderLinkEditor();

  const filteredLessons = lessons
    .filter((lesson) => lesson.category === activeCategory)
    .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.startTime.localeCompare(b.startTime));

  const activeLabel = categories.find((category) => category.id === activeCategory)?.label || "선택 탭";
  classCount.textContent = `${activeLabel} ${filteredLessons.length}개 / 전체 ${lessons.length}개`;

  if (!filteredLessons.length) {
    const empty = document.createElement("div");
    empty.className = "editor-empty";
    empty.textContent = `${activeLabel} 탭에 등록된 수업이 없습니다. 왼쪽의 수업 추가 버튼을 눌러주세요.`;
    list.append(empty);
    return;
  }

  filteredLessons.forEach((lesson) => {
    const row = document.createElement("div");
    row.className = "class-row";
    row.dataset.id = lesson.id || uid();
    row.innerHTML = `
      <label>종목
        <select data-field="category">
          ${categories.map((category) => `<option value="${escapeAttr(category.id)}" ${lesson.category === category.id ? "selected" : ""}>${escapeAttr(`${category.icon || ""} ${category.label}`)}</option>`).join("")}
        </select>
      </label>
      <label>요일
        <select data-field="day">
          ${days.map((day) => `<option value="${day}" ${lesson.day === day ? "selected" : ""}>${day}</option>`).join("")}
        </select>
      </label>
      <label>시작
        <input data-field="startTime" type="time" value="${escapeAttr(lesson.startTime)}" />
      </label>
      <label>종료
        <input data-field="endTime" type="time" value="${escapeAttr(lesson.endTime)}" />
      </label>
      <label>수업명
        <input data-field="name" type="text" value="${escapeAttr(lesson.name)}" placeholder="예: 초등 농구 기초반" />
      </label>
      <label>학년
        <input data-field="grade" type="text" value="${escapeAttr(lesson.grade)}" placeholder="예: 초1-3" />
      </label>
      <label>정원
        <input data-field="capacity" type="number" min="0" value="${Number(lesson.capacity || 0)}" />
      </label>
      <label>현재원
        <input data-field="currentStudents" type="number" min="0" value="${Number(lesson.currentStudents || 0)}" />
      </label>
      <label>장소
        <input data-field="place" type="text" value="${escapeAttr(lesson.place)}" placeholder="예: 1코트 / 풋살장 / 키즈룸" />
      </label>
      <div class="row-actions">
        <button type="button" class="danger" data-action="remove">삭제</button>
      </div>
    `;
    list.append(row);
  });
}

async function loadSchedule() {
  try {
    const response = await fetch("/.netlify/functions/schedule", { cache: "no-store" });
    if (!response.ok) throw new Error(`시간표 API 오류 ${response.status}`);
    const data = await response.json();
    academyNameInput.value = data.academyName || defaults.academyName;
    heroTitleInput.value = data.heroTitle || defaults.heroTitle;
    heroDescriptionInput.value = data.heroDescription || defaults.heroDescription;
    noticeInput.value = data.notice || "";
    categories = normalizeCategories(data);
    ensureActiveCategory();
    actionLinks = normalizeActionLinks(data);
    lessons = (data.lessons || []).map(normalizeLesson);
    renderEditor();
  } catch (error) {
    academyNameInput.value = defaults.academyName;
    heroTitleInput.value = defaults.heroTitle;
    heroDescriptionInput.value = defaults.heroDescription;
    noticeInput.value = defaults.notice;
    categories = normalizeCategories(defaults);
    ensureActiveCategory();
    actionLinks = normalizeActionLinks(defaults);
    lessons = fallbackLessons.map(normalizeLesson);
    renderEditor();
    throw new Error("시간표 저장 서버와 연결되지 않았습니다. GitHub 파일 구조와 Netlify Functions 배포 상태를 확인해 주세요.");
  }
}

async function saveSchedule() {
  updateFromInputs();
  const payload = {
    academyName: academyNameInput.value.trim() || defaults.academyName,
    heroTitle: heroTitleInput.value.trim() || defaults.heroTitle,
    heroDescription: heroDescriptionInput.value.trim() || defaults.heroDescription,
    notice: noticeInput.value.trim(),
    categories: categories.map((category) => ({
      id: category.id,
      label: category.label,
      shortLabel: category.shortLabel || category.label,
      icon: category.icon || "🏷️"
    })),
    actionLinks: actionLinks.map((link) => ({
      id: link.id || uid(),
      label: link.label,
      url: link.url,
      style: link.style === "primary" ? "primary" : "secondary"
    })),
    lessons: lessons.map(normalizeLesson)
  };

  const response = await fetch("/.netlify/functions/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": adminPassword
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "저장에 실패했습니다.");
  }

  setMessage(`저장되었습니다. ${new Date().toLocaleTimeString("ko-KR")}`);
  renderEditor();
}

unlockBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  adminPassword = passwordInput.value;
  sessionStorage.setItem("academyAdminPassword", adminPassword);
  dialog.close();
  try {
    await loadSchedule();
    setMessage("관리자 화면이 준비되었습니다.");
  } catch (error) {
    setMessage(error.message, true);
  }
});

addClassBtn.addEventListener("click", () => {
  updateFromInputs();
  ensureActiveCategory();
  lessons.push(newLesson());
  renderEditor();
});

addLinkBtn.addEventListener("click", () => {
  updateFromInputs();
  actionLinks.push(newActionLink());
  renderEditor();
});

if (addCategoryBtn) {
  addCategoryBtn.addEventListener("click", () => {
    updateFromInputs();
    const category = newCategory();
    categories.push(category);
    activeCategory = category.id;
    sessionStorage.setItem("academyAdminCategory", activeCategory);
    renderEditor();
  });
}

saveBtn.addEventListener("click", async () => {
  try {
    await saveSchedule();
  } catch (error) {
    setMessage(error.message, true);
  }
});

linkEditorList.addEventListener("click", (event) => {
  const action = event.target.dataset.linkAction;
  if (!action) return;

  updateFromInputs();
  const row = event.target.closest(".link-row");
  const index = actionLinks.findIndex((link) => link.id === row.dataset.id);
  if (index < 0) return;

  if (action === "remove") {
    actionLinks.splice(index, 1);
  }

  if (action === "up" && index > 0) {
    [actionLinks[index - 1], actionLinks[index]] = [actionLinks[index], actionLinks[index - 1]];
  }

  if (action === "down" && index < actionLinks.length - 1) {
    [actionLinks[index + 1], actionLinks[index]] = [actionLinks[index], actionLinks[index + 1]];
  }

  renderEditor();
});

if (categoryEditorList) {
  categoryEditorList.addEventListener("click", (event) => {
    const action = event.target.dataset.categoryAction;
    if (!action) return;

    updateFromInputs();
    const row = event.target.closest(".category-row");
    const index = categories.findIndex((category) => category.id === row.dataset.id);
    if (index < 0) return;

    if (action === "remove") {
      if (categories.length <= 1) return;
      const removed = categories[index];
      const fallback = categories[index === 0 ? 1 : 0];
      const lessonCount = lessons.filter((lesson) => lesson.category === removed.id).length;
      if (lessonCount && !window.confirm(`${removed.label} 분류에 수업 ${lessonCount}개가 있습니다. 삭제하면 해당 수업은 ${fallback.label} 분류로 이동합니다.`)) {
        return;
      }
      categories.splice(index, 1);
      lessons = lessons.map((lesson) => lesson.category === removed.id ? { ...lesson, category: fallback.id } : lesson);
      if (activeCategory === removed.id) {
        activeCategory = fallback.id;
        sessionStorage.setItem("academyAdminCategory", activeCategory);
      }
    }

    if (action === "up" && index > 0) {
      [categories[index - 1], categories[index]] = [categories[index], categories[index - 1]];
    }

    if (action === "down" && index < categories.length - 1) {
      [categories[index + 1], categories[index]] = [categories[index], categories[index + 1]];
    }

    ensureActiveCategory();
    renderEditor();
  });

  categoryEditorList.addEventListener("change", () => {
    updateFromInputs();
    renderEditor();
  });
}

list.addEventListener("click", (event) => {
  if (event.target.dataset.action !== "remove") return;
  updateFromInputs();
  lessons = lessons.filter((lesson) => lesson.id !== event.target.closest(".class-row").dataset.id);
  renderEditor();
});

list.addEventListener("change", (event) => {
  if (event.target.dataset.field !== "category") return;
  updateFromInputs();
  renderEditor();
});

adminCategoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  updateFromInputs();
  activeCategory = button.dataset.category;
  sessionStorage.setItem("academyAdminCategory", activeCategory);
  renderEditor();
});

if (!adminPassword) {
  dialog.showModal();
} else {
  loadSchedule().catch((error) => setMessage(error.message, true));
}
