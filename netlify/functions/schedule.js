const { getStore } = require("@netlify/blobs");
const { randomUUID } = require("crypto");

const allowedDays = ["월", "화", "수", "목", "금", "토", "일"];

const defaultCategories = [
  { id: "basketball", label: "농구", icon: "🏀" },
  { id: "soccer", label: "축구", icon: "⚽" },
  { id: "kids", label: "키즈", icon: "🧒" }
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
  openingLinkLabel: "개설 희망",
  openingLinkUrl: "https://classroute-site.netlify.app/",
  gatheringLinkLabel: "반 모으기",
  gatheringLinkUrl: "https://classroute-site.netlify.app/",
  counselLinkLabel: "상담 및 신청서 작성",
  counselLinkUrl: "https://dosportslink.netlify.app/",
  categories: defaultCategories,
  actionLinks: defaultActionLinks
};

const seedSchedule = {
  ...defaults,
  lessons: [
    { id: "sample-basketball-1", category: "basketball", day: "월", startTime: "15:00", endTime: "16:00", name: "농구 기초반", grade: "초1-3", capacity: 10, currentStudents: 7, place: "1코트" },
    { id: "sample-basketball-2", category: "basketball", day: "수", startTime: "17:00", endTime: "18:20", name: "농구 스킬반", grade: "초4-6", capacity: 12, currentStudents: 10, place: "메인코트" },
    { id: "sample-basketball-3", category: "basketball", day: "금", startTime: "19:00", endTime: "20:30", name: "중등 농구반", grade: "중1-3", capacity: 12, currentStudents: 8, place: "메인코트" },
    { id: "sample-soccer-1", category: "soccer", day: "화", startTime: "16:00", endTime: "17:00", name: "축구 기초반", grade: "초1-2", capacity: 12, currentStudents: 9, place: "풋살장" },
    { id: "sample-soccer-2", category: "soccer", day: "목", startTime: "18:00", endTime: "19:20", name: "축구 게임반", grade: "초3-5", capacity: 14, currentStudents: 14, place: "풋살장" },
    { id: "sample-kids-1", category: "kids", day: "월", startTime: "16:20", endTime: "17:10", name: "키즈 체육", grade: "6-7세", capacity: 8, currentStudents: 5, place: "키즈룸" },
    { id: "sample-kids-2", category: "kids", day: "토", startTime: "11:00", endTime: "11:50", name: "유아 밸런스", grade: "5-7세", capacity: 8, currentStudents: 6, place: "키즈룸" }
  ]
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

function safeDay(value) {
  return allowedDays.includes(value) ? value : "월";
}

function safeUrl(value, fallback) {
  const url = String(value || "").trim().slice(0, 250);
  return url.startsWith("https://") || url.startsWith("http://") ? url : fallback;
}

function safeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function safeCategoryId(value, categories) {
  const categoryIds = categories.map((category) => category.id);
  return categoryIds.includes(value) ? value : categories[0].id;
}

function sanitizeCategories(input = {}) {
  const source = Array.isArray(input.categories) && input.categories.length ? input.categories : defaultCategories;
  const usedIds = new Set();
  const categories = [];

  source.slice(0, 20).forEach((category, index) => {
    const fallback = defaultCategories[index] || { label: "수업", icon: "🏷️" };
    const rawLabel = String(category.label || category.shortLabel || fallback.label || "수업분류").trim().slice(0, 30);
    const rawId = String(category.id || `category-${index + 1}`).trim().slice(0, 80);
    const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, "-") || `category-${index + 1}`;
    let id = cleanId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${cleanId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    categories.push({
      id,
      label: rawLabel || fallback.label || "수업분류",
      shortLabel: String(category.shortLabel || rawLabel || fallback.label || "수업").trim().slice(0, 20),
      icon: String(category.icon || fallback.icon || "🏷️").trim().slice(0, 8)
    });
  });

  return categories.length ? categories : defaultCategories;
}

function legacyActionLinks(input = {}) {
  return [
    { id: "opening", label: input.openingLinkLabel || defaults.openingLinkLabel, url: input.openingLinkUrl || defaults.openingLinkUrl, style: "secondary" },
    { id: "gathering", label: input.gatheringLinkLabel || defaults.gatheringLinkLabel, url: input.gatheringLinkUrl || defaults.gatheringLinkUrl, style: "secondary" },
    { id: "counsel", label: input.counselLinkLabel || defaults.counselLinkLabel, url: input.counselLinkUrl || defaults.counselLinkUrl, style: "primary" }
  ];
}

function sanitizeActionLinks(input = {}) {
  const source = Array.isArray(input.actionLinks) && input.actionLinks.length ? input.actionLinks : legacyActionLinks(input);

  return source
    .slice(0, 10)
    .map((link, index) => {
      const fallback = defaultActionLinks[index] || defaultActionLinks[defaultActionLinks.length - 1];
      return {
        id: String(link.id || randomUUID()).slice(0, 80),
        label: String(link.label || fallback.label || "바로가기").slice(0, 50),
        url: safeUrl(link.url, fallback.url || defaults.counselLinkUrl),
        style: link.style === "primary" ? "primary" : "secondary"
      };
    })
    .filter((link) => link.label && link.url);
}

function sanitizeSchedule(input = {}) {
  const categories = sanitizeCategories(input);

  return {
    academyName: String(input.academyName || defaults.academyName).slice(0, 80),
    heroTitle: String(input.heroTitle || defaults.heroTitle).slice(0, 120),
    heroDescription: String(input.heroDescription || defaults.heroDescription).slice(0, 300),
    notice: String(input.notice || "").slice(0, 500),
    openingLinkLabel: String(input.openingLinkLabel || defaults.openingLinkLabel).slice(0, 40),
    openingLinkUrl: safeUrl(input.openingLinkUrl, defaults.openingLinkUrl),
    gatheringLinkLabel: String(input.gatheringLinkLabel || defaults.gatheringLinkLabel).slice(0, 40),
    gatheringLinkUrl: safeUrl(input.gatheringLinkUrl, defaults.gatheringLinkUrl),
    counselLinkLabel: String(input.counselLinkLabel || defaults.counselLinkLabel).slice(0, 60),
    counselLinkUrl: safeUrl(input.counselLinkUrl, defaults.counselLinkUrl),
    categories,
    actionLinks: sanitizeActionLinks(input),
    lessons: Array.isArray(input.lessons)
      ? input.lessons.map((lesson) => ({
          id: String(lesson.id || randomUUID()).slice(0, 80),
          category: safeCategoryId(lesson.category, categories),
          day: safeDay(lesson.day),
          startTime: String(lesson.startTime || "").slice(0, 5),
          endTime: String(lesson.endTime || "").slice(0, 5),
          name: String(lesson.name || "").slice(0, 80),
          grade: String(lesson.grade || "").slice(0, 40),
          capacity: safeNumber(lesson.capacity),
          currentStudents: safeNumber(lesson.currentStudents),
          place: String(lesson.place || lesson.room || "").slice(0, 50)
        }))
      : []
  };
}

function getScheduleStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;

  if (siteID && token) {
    return getStore({ name: "academy-schedule", siteID, token });
  }

  return getStore({ name: "academy-schedule" });
}

function errorBody(prefix, error) {
  const message = error && error.message ? error.message : String(error || "알 수 없는 오류");
  console.error(prefix, error);

  if (message.includes("environment has not been configured") || message.includes("siteID") || message.includes("token")) {
    return {
      message: `${prefix}: Netlify Blobs 연결 정보가 없습니다. Netlify Environment variables에 NETLIFY_SITE_ID와 NETLIFY_BLOBS_TOKEN을 추가한 뒤 다시 배포해 주세요. 원문: ${message}`
    };
  }

  return {
    message: `${prefix}: ${message}`
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    try {
      const store = getScheduleStore();
      const saved = await store.get("current", { type: "json" });
      return json(200, saved ? sanitizeSchedule(saved) : seedSchedule);
    } catch (error) {
      console.error("GET schedule storage warning", error);
      return json(200, {
        ...seedSchedule,
        storageWarning: `Netlify Blobs 저장소 연결 전이라 기본 시간표를 표시합니다. 상세: ${error.message || error}`
      });
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const expectedPassword = process.env.ADMIN_PASSWORD;
      const providedPassword = event.headers["x-admin-password"];

      if (!expectedPassword) {
        return json(500, { message: "Netlify 환경변수 ADMIN_PASSWORD가 필요합니다." });
      }

      if (providedPassword !== expectedPassword) {
        return json(401, { message: "관리자 비밀번호가 올바르지 않습니다." });
      }

      const parsed = JSON.parse(event.body || "{}");
      const schedule = sanitizeSchedule(parsed);
      const store = getScheduleStore();
      await store.setJSON("current", schedule);
      return json(200, schedule);
    } catch (error) {
      return json(500, errorBody("시간표 저장 중 오류가 발생했습니다", error));
    }
  }

  return json(405, { message: "허용되지 않는 요청입니다." });
};
