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

const zoomOptions = [
  { value: "fit", label: "전체보기" },
  { value: "0.8", label: "80%" },
  { value: "1", label: "100%" },
  { value: "1.25", label: "125%" },
  { value: "1.5", label: "150%" }
];

// v20: transform 축소 대신 실제 레이아웃 크기를 계산해 핀치 확대 후 스크롤이 자연스럽게 작동하도록 별도 키를 사용합니다.
let timetableZoomMode = normalizeZoomMode(getStorageItem("academyTimetableZoomModeV20", "fit"));

function normalizeZoomMode(value) {
  const raw = String(value || "fit").trim();
  if (raw === "fit") return "fit";
  const allowed = zoomOptions.map((option) => option.value);
  return allowed.includes(raw) ? raw : "fit";
}

function getManualZoom(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}

function resolveTimetableZoom(totalWidth) {
  if (timetableZoomMode !== "fit") return getManualZoom(timetableZoomMode);

  const viewportWidth = Math.max(260, Math.floor((board && board.clientWidth) || window.innerWidth || totalWidth));
  const safeWidth = Math.max(220, viewportWidth - 4);
  if (!totalWidth || totalWidth <= safeWidth) return 1;

  // 전체 요일을 한 화면에 넣는 것이 목적이므로 모바일에서도 충분히 축소합니다.
  return Math.max(0.16, Math.min(1, safeWidth / totalWidth));
}

function setTimetableZoom(value) {
  timetableZoomMode = normalizeZoomMode(value);
  setStorageItem("academyTimetableZoomModeV20", timetableZoomMode);
  if (latestData) render(latestData);
}

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

function getResponsiveSlotBaseHeight() {
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
    return 136;
  }
  return 156;
}

function getResponsiveHeaderHeight() {
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
    return 36;
  }
  return 48;
}

function getResponsiveTimeColumnWidth() {
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
    return 58;
  }
  return 96;
}

function getResponsiveDayBaseWidth() {
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
    return 240;
  }
  return 280;
}

function getResponsiveLaneMinWidth() {
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
    return 218;
  }
  return 250;
}

function lessonOverlapsSlot(range, slot) {
  return range.start < slot.endMinutes && range.end > slot.startMinutes;
}

function buildDurationGridLayout(days, sectionLessons, slots) {
  const dayData = new Map();
  days.forEach((day) => {
    const dayLessons = sectionLessons.filter((lesson) => lesson.day === day).sort(byTime);
    const laneResult = assignLessonLanes(dayLessons);
    dayData.set(day, { dayLessons, assignments: laneResult.assignments, maxLaneCount: laneResult.maxLaneCount });
  });

  const dayBaseWidth = getResponsiveDayBaseWidth();
  const laneMinWidth = getResponsiveLaneMinWidth();
  const dayWidths = days.map((day) => {
    const data = dayData.get(day);
    const maxLaneCount = Math.max(1, Number(data?.maxLaneCount || 1));
    // v18: 겹치는 수업은 글씨를 줄이지 않고, 읽을 수 있는 폭이 확보될 때까지 요일 칸을 확장합니다.
    return Math.max(dayBaseWidth, maxLaneCount * laneMinWidth + 28);
  });
  const timeColumnWidth = getResponsiveTimeColumnWidth();
  const dayOffsets = [];
  let runningLeft = timeColumnWidth;
  dayWidths.forEach((width) => {
    dayOffsets.push(runningLeft);
    runningLeft += width;
  });
  const totalWidth = timeColumnWidth + dayWidths.reduce((sum, width) => sum + width, 0);

  const baseHeight = getResponsiveSlotBaseHeight();
  const rowHeights = slots.map((slot) => {
    let maxOverlap = 1;
    let hasShortLesson = false;
    let hasLongTitle = false;

    days.forEach((day) => {
      const data = dayData.get(day);
      if (!data) return;
      const activeLessons = data.dayLessons.filter((lesson) => {
        const range = lessonRange(lesson);
        return range && lessonOverlapsSlot(range, slot);
      });
      if (!activeLessons.length) return;
      maxOverlap = Math.max(maxOverlap, activeLessons.length);
      activeLessons.forEach((lesson) => {
        const range = lessonRange(lesson);
        const key = lesson.id || `${lesson.day}-${lesson.startTime}-${lesson.name}`;
        const assignment = data.assignments.get(key);
        if (assignment) maxOverlap = Math.max(maxOverlap, assignment.laneCount || 1);
        if (range && range.end - range.start < 60) hasShortLesson = true;
        if (String(lesson.name || "").length >= 8 || String(lesson.grade || "").length >= 8) hasLongTitle = true;
      });
    });

    let multiplier = 1.1;
    // v17에서는 폭을 키우므로 겹침만으로 세로를 과하게 키우지 않습니다.
    // 대신 긴 제목/짧은 수업은 약간 더 높여서 모든 텍스트가 보이게 합니다.
    if (hasLongTitle) multiplier += 0.12;
    if (hasShortLesson) multiplier += 0.15;
    if (maxOverlap >= 3) multiplier += 0.08;
    return Math.round(baseHeight * multiplier);
  });

  const rowOffsets = [];
  let runningOffset = 0;
  rowHeights.forEach((height) => {
    rowOffsets.push(runningOffset);
    runningOffset += height;
  });

  function positionFromMinutes(minutes) {
    if (!slots.length) return 0;
    if (minutes <= slots[0].startMinutes) return 0;
    const lastSlot = slots[slots.length - 1];
    if (minutes >= lastSlot.endMinutes) return runningOffset;

    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index];
      if (minutes >= slot.startMinutes && minutes <= slot.endMinutes) {
        const ratio = Math.min(1, Math.max(0, (minutes - slot.startMinutes) / 60));
        return rowOffsets[index] + rowHeights[index] * ratio;
      }
    }
    return runningOffset;
  }

  return {
    dayData,
    rowHeights,
    dayWidths,
    dayOffsets,
    timeColumnWidth,
    totalWidth,
    headerHeight: getResponsiveHeaderHeight(),
    totalHeight: runningOffset,
    positionFromMinutes
  };
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

  const maxLaneCount = positionedItems.reduce((max, item) => Math.max(max, item.laneCount || 1), 1);

  return { assignments, maxLaneCount };
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
  const laneCount = Number(options.laneCount || 1);
  // v17: 글씨 축소/말줄임 대신 요일 칸을 오른쪽으로 넓혀 가독성을 확보합니다.
  card.className = `timetable-lesson ${lessonVariant(lesson)}${laneCount > 1 ? " is-overlap" : ""}`;
  const exactTime = `${lesson.startTime || "--:--"}~${lesson.endTime || "--:--"}`;
  const detailText = [
    exactTime,
    lesson.name || "수업명 미입력",
    lesson.grade || "학년 미정",
    capacityText(lesson),
    lesson.place || ""
  ].filter(Boolean).join(" · ");
  card.title = detailText;
  card.setAttribute("aria-label", detailText);
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

  const layout = buildDurationGridLayout(days, sectionLessons, slots);

  const section = document.createElement("section");
  section.className = "board-section";

  const heading = document.createElement("div");
  heading.className = "board-section-heading";
  heading.innerHTML = `<strong>🗓️ ${escapeHtml(title)}</strong><span>${escapeHtml(categoryInfo().label)} ${sectionLessons.length}개</span>`;
  section.append(heading);

  const effectiveZoom = resolveTimetableZoom(layout.totalWidth);
  const contentHeight = layout.headerHeight + layout.totalHeight;
  const scaled = (value) => Math.max(1, Math.round(value * effectiveZoom));
  const scaledFloat = (value) => Math.max(0, value * effectiveZoom);
  const scaledTotalWidth = scaled(layout.totalWidth);
  const scaledContentHeight = scaled(contentHeight);

  const controls = document.createElement("div");
  controls.className = "timetable-view-controls";
  controls.innerHTML = `
    <div class="view-zoom-group" aria-label="시간표 보기 크기">
      <span>보기</span>
      ${zoomOptions.map((option) => `
        <button type="button" class="view-zoom-button ${option.value === timetableZoomMode ? "active" : ""}" data-schedule-zoom="${option.value}">${escapeHtml(option.label)}</button>
      `).join("")}
      <small>${timetableZoomMode === "fit" ? `현재 ${Math.round(effectiveZoom * 100)}%` : ""}</small>
    </div>
    <div class="day-jump-group" aria-label="요일 빠른 이동">
      <span>요일 이동</span>
      ${days.map((day, index) => `
        <button type="button" class="day-jump-button" data-day-scroll="${Math.max(0, ((layout.dayOffsets[index] || 0) - layout.timeColumnWidth) * effectiveZoom)}">${escapeHtml(day)}</button>
      `).join("")}
    </div>
  `;
  section.append(controls);

  const scroller = document.createElement("div");
  scroller.className = `timetable-scroller schedule-grid-scroller ${timetableZoomMode === "fit" ? "fit-mode" : "free-zoom-mode"}`;

  const fitShell = document.createElement("div");
  fitShell.className = "schedule-fit-shell";
  fitShell.style.width = `${scaledTotalWidth}px`;
  fitShell.style.minWidth = `${scaledTotalWidth}px`;
  fitShell.style.height = `${scaledContentHeight}px`;

  const grid = document.createElement("div");
  grid.className = "schedule-grid duration-timetable";
  grid.style.setProperty("--days-count", days.length);
  grid.style.setProperty("--slot-count", slots.length);
  grid.style.setProperty("--header-height", `${scaled(layout.headerHeight)}px`);
  grid.style.setProperty("--time-col", `${scaled(layout.timeColumnWidth)}px`);
  grid.style.setProperty("--grid-min-width", `${scaledTotalWidth}px`);
  grid.style.gridTemplateColumns = `${scaled(layout.timeColumnWidth)}px ${layout.dayWidths.map((width) => `${scaled(width)}px`).join(" ")}`;
  grid.style.gridTemplateRows = `${scaled(layout.headerHeight)}px ${layout.rowHeights.map((height) => `${scaled(height)}px`).join(" ")}`;
  grid.style.width = `${scaledTotalWidth}px`;
  grid.style.minWidth = `${scaledTotalWidth}px`;
  grid.style.height = `${scaledContentHeight}px`;
  grid.style.transform = "none";
  grid.style.transformOrigin = "top left";
  grid.style.setProperty("--schedule-zoom", String(effectiveZoom));

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

    const data = layout.dayData.get(day) || { dayLessons: [], assignments: new Map() };
    const dayLessons = data.dayLessons;
    const assignments = data.assignments;

    dayLessons.forEach((lesson) => {
      const range = lessonRange(lesson);
      if (!range) return;
      const assignmentKey = lesson.id || `${lesson.day}-${lesson.startTime}-${lesson.name}`;
      const assignment = assignments.get(assignmentKey) || { lane: 0, laneCount: 1 };
      const durationMinutes = Math.max(1, range.end - range.start);
      const topPixels = layout.positionFromMinutes(range.start);
      const bottomPixels = layout.positionFromMinutes(range.end);
      const heightPixels = Math.max(54, bottomPixels - topPixels);
      const lessonLaneCount = Math.max(1, assignment.laneCount || 1);
      const laneWidth = 100 / lessonLaneCount;
      const card = renderLessonCard(lesson, {
        durationMinutes,
        laneCount: lessonLaneCount
      });
      card.style.setProperty("--lesson-top", `${scaledFloat(Math.max(0, topPixels)).toFixed(2)}px`);
      card.style.setProperty("--lesson-height", `${scaledFloat(heightPixels).toFixed(2)}px`);
      card.style.setProperty("--lesson-left", `${assignment.lane * laneWidth}%`);
      card.style.setProperty("--lesson-width", `${laneWidth}%`);
      track.append(card);
    });

    grid.append(track);
  });

  fitShell.append(grid);
  scroller.append(fitShell);
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

board.addEventListener("click", (event) => {
  const zoomButton = event.target.closest("button[data-schedule-zoom]");
  if (zoomButton) {
    setTimetableZoom(zoomButton.dataset.scheduleZoom);
    return;
  }

  const dayButton = event.target.closest("button[data-day-scroll]");
  if (dayButton) {
    const section = dayButton.closest(".board-section");
    const scroller = section?.querySelector(".schedule-grid-scroller");
    const targetLeft = Number(dayButton.dataset.dayScroll || 0);
    if (scroller) {
      scroller.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }
  }
});

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  setStorageItem("academyActiveCategory", activeCategory);
  if (latestData) render(latestData);
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (latestData) render(latestData);
  }, 180);
});

loadSchedule();
setInterval(loadSchedule, 2000);
