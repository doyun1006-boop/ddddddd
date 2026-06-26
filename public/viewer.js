const board = document.querySelector("#scheduleBoard");
const emptyState = document.querySelector("#emptyState");
const notice = document.querySelector("#notice");
const connectionWarning = document.querySelector("#connectionWarning");
const academyName = document.querySelector("#academyName");
const heroTitle = document.querySelector("#heroTitle");
const heroDescription = document.querySelector("#heroDescription");
const quickLinkRow = document.querySelector("#quickLinkRow");
const lastUpdated = document.querySelector("#lastUpdated");
const liveDot = document.querySelector("#liveDot");
const categoryTabs = document.querySelector("#categoryTabs");

const dayOrder = ["월", "화", "수", "목", "금", "토", "일"];
const weekdayOrder = ["월", "화", "수", "목", "금"];
const weekendOrder = ["토", "일"];
const defaultCategories = [
  { id: "basketball", label: "농구교실", shortLabel: "농구", icon: "🏀" },
  { id: "soccer", label: "축구교실", shortLabel: "축구", icon: "⚽" },
  { id: "kids", label: "키즈스포츠", shortLabel: "키즈", icon: "🧒" }
];

const defaults = {
  academyName: "DO SPORTS 잠실점 시간표",
  heroTitle: "농구 · 축구 · 키즈 수업을 한눈에 보는 시간표",
  heroDescription: "학부모님이 바로 확인할 수 있는 실시간 반별 시간표입니다.",
  notice: "축구교실 농구교실 취미&심화 모집   ✦   연령별 대표반 모집   🔔 ⚽🏀 반 축구 반 농구",
  openingLinkLabel: "개설 희망",
  openingLinkUrl: "https://classroute-site.netlify.app/",
  gatheringLinkLabel: "반 모으기",
  gatheringLinkUrl: "https://classroute-site.netlify.app/",
  counselLinkLabel: "상담 및 신청서 작성",
  counselLinkUrl: "https://dosportslink.netlify.app/",
  categories: defaultCategories,
  actionLinks: [
    { id: "opening", label: "개설 희망", url: "https://classroute-site.netlify.app/", style: "secondary" },
    { id: "gathering", label: "반 모으기", url: "https://classroute-site.netlify.app/", style: "secondary" },
    { id: "counsel", label: "상담 및 신청서 작성", url: "https://dosportslink.netlify.app/", style: "primary" }
  ]
};

const fallbackSchedule = {
  ...defaults,
  lessons: [
    { id: "sample-basketball-1", category: "basketball", day: "월", startTime: "15:00", endTime: "16:00", name: "모집중", grade: "초등부", capacity: 12, currentStudents: 7, place: "1코트" },
    { id: "sample-basketball-2", category: "basketball", day: "수", startTime: "16:00", endTime: "17:00", name: "오픈반", grade: "초4-6", capacity: 12, currentStudents: 6, place: "메인코트" },
    { id: "sample-basketball-3", category: "basketball", day: "금", startTime: "19:00", endTime: "20:00", name: "오픈반", grade: "초5-중등", capacity: 12, currentStudents: 4, place: "메인코트" },
    { id: "sample-soccer-1", category: "soccer", day: "화", startTime: "16:00", endTime: "17:00", name: "초등부", grade: "초5-6", capacity: 10, currentStudents: 3, place: "풋살장" },
    { id: "sample-soccer-2", category: "soccer", day: "목", startTime: "18:00", endTime: "19:00", name: "비기너 화,목 주2회", grade: "초등 저학년", capacity: 8, currentStudents: 0, place: "풋살장" },
    { id: "sample-kids-1", category: "kids", day: "월", startTime: "17:00", endTime: "18:00", name: "유치부 모집", grade: "5세반, 6세반, 7세반", capacity: 8, currentStudents: 3, place: "키즈룸" },
    { id: "sample-kids-2", category: "kids", day: "토", startTime: "11:00", endTime: "11:50", name: "유아 밸런스", grade: "5-7세", capacity: 8, currentStudents: 6, place: "키즈룸" }
  ]
};

let categories = [...defaultCategories];

function getStorageItem(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // 저장소 접근이 제한된 환경에서는 탭 선택 저장을 생략합니다.
  }
}

let activeCategory = getStorageItem("academyActiveCategory", "basketball");
let latestData = null;
let latestDataHash = "";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function ensureActiveCategory() {
  if (!categories.some((category) => category.id === activeCategory)) {
    activeCategory = categories[0]?.id || "basketball";
    setStorageItem("academyActiveCategory", activeCategory);
  }
}

function normalizeLesson(lesson) {
  const categoryIds = categories.map((category) => category.id);
  return {
    ...lesson,
    category: categoryIds.includes(lesson.category) ? lesson.category : (categories[0]?.id || "basketball"),
    place: lesson.place || lesson.room || ""
  };
}

function safeUrl(value, fallback) {
  const url = String(value || "").trim();
  return url.startsWith("https://") || url.startsWith("http://") ? url : fallback;
}

function normalizeActionLinks(data = {}) {
  const legacyLinks = [
    { id: "opening", label: data.openingLinkLabel || defaults.openingLinkLabel, url: data.openingLinkUrl || defaults.openingLinkUrl, style: "secondary" },
    { id: "gathering", label: data.gatheringLinkLabel || defaults.gatheringLinkLabel, url: data.gatheringLinkUrl || defaults.gatheringLinkUrl, style: "secondary" },
    { id: "counsel", label: data.counselLinkLabel || defaults.counselLinkLabel, url: data.counselLinkUrl || defaults.counselLinkUrl, style: "primary" }
  ];

  const source = Array.isArray(data.actionLinks) && data.actionLinks.length ? data.actionLinks : legacyLinks;
  return source
    .map((link, index) => {
      const fallback = defaults.actionLinks[index] || defaults.actionLinks[defaults.actionLinks.length - 1];
      return {
        id: link.id || `link-${index}`,
        label: link.label || fallback.label || "바로가기",
        url: safeUrl(link.url, fallback.url),
        style: link.style === "primary" ? "primary" : "secondary"
      };
    })
    .filter((link) => link.label && link.url);
}

function renderActionLinks(data) {
  if (!quickLinkRow) return;
  const links = normalizeActionLinks(data);
  quickLinkRow.innerHTML = "";
  quickLinkRow.hidden = !links.length;

  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = `quick-link ${link.style === "primary" ? "primary" : ""}`;
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.textContent = link.label;
    quickLinkRow.append(anchor);
  });
}

function byTime(a, b) {
  return (a.startTime || "").localeCompare(b.startTime || "") || (a.endTime || "").localeCompare(b.endTime || "");
}

function byDayAndTime(a, b) {
  const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  return dayDiff || byTime(a, b);
}

function capacityText(lesson) {
  const current = Number(lesson.currentStudents || 0);
  const limit = Number(lesson.capacity || 0);
  if (!limit) return "정원 미정";
  return `${current}/${limit}명`;
}

function categoryInfo(id = activeCategory) {
  return categories.find((category) => category.id === id) || categories[0] || defaultCategories[0];
}

function categoryIndex(id) {
  return Math.max(0, categories.findIndex((category) => category.id === id));
}

function lessonVariant(lesson) {
  const category = categoryInfo(lesson.category);
  const text = `${category.label || ""} ${lesson.name || ""} ${lesson.grade || ""} ${lesson.place || ""}`;
  if (/유치|유아|키즈|5세|6세|7세/.test(text)) return "variant-kids";
  if (/축구|비기너|풋살/.test(text)) return "variant-soccer";
  if (/입시|성인|결스|대표|심화|특강/.test(text)) return "variant-special";
  if (/모집/.test(text)) return "variant-recruit";
  return ["variant-basketball", "variant-soccer", "variant-kids", "variant-special", "variant-recruit"][categoryIndex(lesson.category) % 5];
}

function parseTimeToMinutes(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function formatHourLabel(hour) {
  return `${String(hour).padStart(2, "0")}:00~`;
}

function makeTimeSlots(lessons) {
  const ranges = lessons
    .map((lesson) => {
      const start = parseTimeToMinutes(lesson.startTime);
      const rawEnd = parseTimeToMinutes(lesson.endTime);
      if (start === null) return null;
      const end = rawEnd !== null && rawEnd > start ? rawEnd : start + 60;
      return { start, end };
    })
    .filter(Boolean);

  if (!ranges.length) return [];

  const minHour = Math.max(6, Math.floor(Math.min(...ranges.map((range) => range.start)) / 60));
  const maxHour = Math.min(24, Math.ceil(Math.max(...ranges.map((range) => range.end)) / 60));
  const slots = [];
  for (let hour = minHour; hour < maxHour; hour += 1) {
    slots.push({
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`,
      startHour: hour,
      endHour: hour + 1,
      startMinutes: hour * 60,
      endMinutes: (hour + 1) * 60,
      key: `${hour}`
    });
  }
  return slots;
}

function lessonRange(lesson) {
  const start = parseTimeToMinutes(lesson.startTime);
  const rawEnd = parseTimeToMinutes(lesson.endTime);
  if (start === null) return null;
  const end = rawEnd !== null && rawEnd > start ? rawEnd : start + 60;
  return { start, end };
}

function assignLessonLanes(dayLessons) {
  const sorted = [...dayLessons]
    .map((lesson) => ({ lesson, range: lessonRange(lesson) }))
    .filter((item) => item.range)
    .sort((a, b) => a.range.start - b.range.start || a.range.end - b.range.end);

  const active = [];
  const positionedItems = [];
  const assignments = new Map();

  sorted.forEach((item) => {
    for (let i = active.length - 1; i >= 0; i -= 1) {
      if (active[i].range.end <= item.range.start) active.splice(i, 1);
    }

    let lane = 0;
    const usedLanes = new Set(active.map((activeItem) => activeItem.lane));
    while (usedLanes.has(lane)) lane += 1;

    const positioned = { ...item, lane, laneCount: 1 };
    active.push(positioned);
    positionedItems.push(positioned);
  });

  // 전체 요일을 무조건 반으로 나누지 않고, 실제로 겹치는 수업끼리만 폭을 나눕니다.
  positionedItems.forEach((item) => {
    const overlaps = positionedItems.filter((other) =>
      other.range.start < item.range.end && other.range.end > item.range.start
    );
    item.laneCount = Math.max(1, ...overlaps.map((other) => other.lane + 1));
    assignments.set(item.lesson.id || `${item.lesson.day}-${item.lesson.startTime}-${item.lesson.name}`, item);
  });

  return { assignments };
}

function renderTabs(lessons) {
  categoryTabs.innerHTML = "";
  ensureActiveCategory();

  categories.forEach((category) => {
    const count = lessons.filter((lesson) => lesson.category === category.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tab-button ${activeCategory === category.id ? "active" : ""}`;
    button.dataset.category = category.id;
    button.innerHTML = `<span>${escapeHtml(category.icon || "")} ${escapeHtml(category.label)}</span><strong>${count}</strong>`;
    categoryTabs.append(button);
  });
}

function renderLessonCard(lesson, options = {}) {
  const card = document.createElement("div");
  const duration = Number(options.durationMinutes || 60);
  const laneCount = Number(options.laneCount || 1);
  const compact = Boolean(options.compact || laneCount > 1 || duration < 60);
  const mini = Boolean(options.mini || laneCount >= 3 || duration <= 45);
  card.className = `timetable-lesson ${lessonVariant(lesson)}${compact ? " is-compact" : ""}${mini ? " is-mini" : ""}${laneCount > 1 ? " is-overlap" : ""}`;
  const exactTime = `${lesson.startTime || "--:--"}~${lesson.endTime || "--:--"}`;
  const detailText = [
    exactTime,
    lesson.name || "수업명 미입력",
    lesson.grade || "학년 미정",
    capacityText(lesson),
    lesson.place || ""
  ].filter(Boolean).join(" · ");
  card.title = detailText;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${detailText} 자세히 보기`);
  card.innerHTML = `
    <span class="lesson-time">${escapeHtml(exactTime)}</span>
    <p class="lesson-name">${escapeHtml(lesson.name || "수업명 미입력")}</p>
    <span class="lesson-subline">
      <span class="grade-chip">${escapeHtml(lesson.grade || "학년 미정")}</span>
      <strong class="capacity-text">${escapeHtml(capacityText(lesson))}</strong>
    </span>
    ${lesson.place ? `<small class="place-text">${escapeHtml(lesson.place)}</small>` : ""}
  `;
  return card;
}

function renderTimetableSection(title, days, lessons) {
  const sectionLessons = lessons.filter((lesson) => days.includes(lesson.day));
  if (!sectionLessons.length) return null;

  const slots = makeTimeSlots(sectionLessons);
  if (!slots.length) return null;

  const minMinutes = slots[0].startMinutes;
  const maxMinutes = slots[slots.length - 1].endMinutes;
  const totalMinutes = Math.max(60, maxMinutes - minMinutes);

  const section = document.createElement("section");
  section.className = "board-section";

  const heading = document.createElement("div");
  heading.className = "board-section-heading";
  heading.innerHTML = `<strong>🗓️ ${escapeHtml(title)}</strong><span>${escapeHtml(categoryInfo().label)} ${sectionLessons.length}개</span>`;
  section.append(heading);

  const scroller = document.createElement("div");
  scroller.className = "timetable-scroller schedule-grid-scroller";

  const grid = document.createElement("div");
  grid.className = "schedule-grid duration-timetable";
  grid.style.setProperty("--days-count", days.length);
  grid.style.setProperty("--slot-count", slots.length);

  const timeHead = document.createElement("div");
  timeHead.className = "grid-head time-head";
  timeHead.style.gridColumn = "1";
  timeHead.style.gridRow = "1";
  timeHead.textContent = "시간";
  grid.append(timeHead);

  days.forEach((day, dayIndex) => {
    const dayHead = document.createElement("div");
    dayHead.className = "grid-head day-head";
    dayHead.style.gridColumn = String(dayIndex + 2);
    dayHead.style.gridRow = "1";
    dayHead.textContent = day;
    grid.append(dayHead);
  });

  slots.forEach((slot, slotIndex) => {
    const rowNumber = slotIndex + 2;
    const timeCell = document.createElement("div");
    timeCell.className = "grid-time-cell time-cell";
    timeCell.style.gridColumn = "1";
    timeCell.style.gridRow = String(rowNumber);
    timeCell.innerHTML = `<strong>${escapeHtml(formatHourLabel(slot.startHour))}</strong>`;
    grid.append(timeCell);

    days.forEach((day, dayIndex) => {
      const gridSlot = document.createElement("div");
      gridSlot.className = "grid-slot";
      gridSlot.style.gridColumn = String(dayIndex + 2);
      gridSlot.style.gridRow = String(rowNumber);
      grid.append(gridSlot);
    });
  });

  days.forEach((day, dayIndex) => {
    const track = document.createElement("div");
    track.className = "day-track";
    track.style.gridColumn = String(dayIndex + 2);
    track.style.gridRow = `2 / span ${slots.length}`;

    const dayLessons = sectionLessons.filter((lesson) => lesson.day === day).sort(byTime);
    const { assignments } = assignLessonLanes(dayLessons);

    dayLessons.forEach((lesson) => {
      const range = lessonRange(lesson);
      if (!range) return;
      const assignmentKey = lesson.id || `${lesson.day}-${lesson.startTime}-${lesson.name}`;
      const assignment = assignments.get(assignmentKey) || { lane: 0, laneCount: 1 };
      const durationMinutes = Math.max(1, range.end - range.start);
      const topPercent = ((range.start - minMinutes) / totalMinutes) * 100;
      const heightPercent = (durationMinutes / totalMinutes) * 100;
      const lessonLaneCount = Math.max(1, assignment.laneCount || 1);
      const laneWidth = 100 / lessonLaneCount;
      const card = renderLessonCard(lesson, {
        durationMinutes,
        laneCount: lessonLaneCount,
        compact: lessonLaneCount > 1 || durationMinutes < 60,
        mini: lessonLaneCount >= 3 || durationMinutes <= 45
      });
      card.style.setProperty("--lesson-top", `${Math.max(0, topPercent)}%`);
      card.style.setProperty("--lesson-height", `${Math.max(6, heightPercent)}%`);
      card.style.setProperty("--lesson-left", `${assignment.lane * laneWidth}%`);
      card.style.setProperty("--lesson-width", `${laneWidth}%`);
      track.append(card);
    });

    grid.append(track);
  });

  scroller.append(grid);
  section.append(scroller);
  return section;
}

function renderTimetable(lessons) {
  const filteredLessons = lessons.filter((lesson) => lesson.category === activeCategory).sort(byDayAndTime);
  board.innerHTML = "";

  if (!filteredLessons.length) {
    emptyState.hidden = false;
    emptyState.textContent = `${categoryInfo().label} 시간표에 등록된 수업이 없습니다.`;
    return;
  }

  emptyState.hidden = true;

  const weekdaySection = renderTimetableSection("평일 수업 (월~금)", weekdayOrder, filteredLessons);
  const weekendSection = renderTimetableSection("주말 수업 (토~일)", weekendOrder, filteredLessons);

  if (weekdaySection) board.append(weekdaySection);
  if (weekendSection) board.append(weekendSection);
}

function scheduleHash(data) {
  return JSON.stringify(data || {});
}

function render(data) {
  categories = normalizeCategories(data);
  ensureActiveCategory();

  academyName.textContent = data.academyName || defaults.academyName;
  heroTitle.textContent = data.heroTitle || defaults.heroTitle;
  heroDescription.textContent = data.heroDescription || defaults.heroDescription;
  notice.hidden = !data.notice;
  notice.textContent = data.notice || "";

  renderActionLinks(data);

  const lessons = [...(data.lessons || [])].map(normalizeLesson).sort(byDayAndTime);
  renderTabs(lessons);
  renderTimetable(lessons);
}

async function loadSchedule() {
  try {
    const response = await fetch("/.netlify/functions/schedule", { cache: "no-store" });
    if (!response.ok) throw new Error(`시간표 API 오류 ${response.status}`);
    const incomingData = await response.json();
    const incomingHash = scheduleHash(incomingData);

    if (incomingHash !== latestDataHash) {
      latestData = incomingData;
      latestDataHash = incomingHash;
      render(latestData);
    } else {
      latestData = incomingData;
    }

    liveDot.classList.remove("offline");
    connectionWarning.hidden = true;
    lastUpdated.textContent = "연결됨";
  } catch (error) {
    liveDot.classList.add("offline");
    lastUpdated.textContent = "연결 재시도 중";

    if (!latestData) {
      latestData = fallbackSchedule;
      latestDataHash = scheduleHash(fallbackSchedule);
      render(fallbackSchedule);
      connectionWarning.hidden = false;
      connectionWarning.textContent = "현재 시간표 저장 서버와 연결되지 않아 예시 시간표를 표시하고 있습니다.";
    }
  }
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  setStorageItem("academyActiveCategory", activeCategory);
  if (latestData) render(latestData);
});

board.addEventListener("click", (event) => {
  const card = event.target.closest(".timetable-lesson");
  if (!card) return;
  board.querySelectorAll(".timetable-lesson.expanded").forEach((openCard) => {
    if (openCard !== card) openCard.classList.remove("expanded");
  });
  card.classList.toggle("expanded");
});

board.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".timetable-lesson");
  if (!card) return;
  event.preventDefault();
  card.click();
});

loadSchedule();
setInterval(loadSchedule, 2000);
