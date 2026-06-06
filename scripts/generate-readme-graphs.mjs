import { mkdir, writeFile } from "node:fs/promises";

const config = {
  projectRepo: process.env.PROJECT_REPO || "danielgermano-data/bankguard",
  accentColor: process.env.ACCENT_COLOR || "#ff3131",
  backgroundColor: process.env.BACKGROUND_COLOR || "#0d1117",
  outputDir: "assets/readme",
};

const palette = {
  card: "#090615",
  border: "#8b5cf6",
  border2: "#38bdf8",
  title: "#c084fc",
  text: "#eef2ff",
  muted: "#b7c1ff",
  value: "#38bdf8",
  icon: "#c084fc",
  chart: "#8b5cf6",
  chartSoft: "#2e1065",
  axis: "#67e8f9",
};

const token = process.env.GITHUB_TOKEN;
const [owner, repo] = config.projectRepo.split("/");

if (!owner || !repo) {
  throw new Error("PROJECT_REPO must use the format owner/repository.");
}

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${path}`);
  }

  return response.json();
}

async function paginate(pathForPage, maxPages = 10) {
  const items = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const pageItems = await github(pathForPage(page));
    items.push(...pageItems);

    if (pageItems.length < 100) break;
  }

  return items;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(date) {
  const value = new Date(date);
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(value || 0);
}

function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = Math.max(0, now - then);
  const days = Math.floor(diffMs / 86400000);

  if (days < 45) return `ha ${Math.max(1, days)} dias`;

  const months = Math.floor(days / 30);
  if (months < 24) return `ha ${months} ${months === 1 ? "mes" : "meses"}`;

  const years = Math.floor(days / 365);
  return `ha ${years} ${years === 1 ? "ano" : "anos"}`;
}

function languageColor(language) {
  const colors = {
    Python: "#8b5cf6",
    SQL: "#38bdf8",
    YAML: "#cb171e",
    TOML: "#9c4221",
    Mermaid: "#ff3670",
    JSON: "#f1e05a",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#663399",
    "Jupyter Notebook": "#da5b0b",
    Shell: "#89e051",
    Java: "#b07219",
    C: "#555555",
    "C++": "#f34b7d",
    PowerShell: "#012456",
    Dockerfile: "#384d54",
    Makefile: "#427819",
    Go: "#00add8",
    Ruby: "#701516",
  };

  return colors[language] || "#8b949e";
}

function languageFromPath(path) {
  const cleanPath = path.toLowerCase();
  const extension = cleanPath.includes(".") ? cleanPath.slice(cleanPath.lastIndexOf(".")) : "";

  const byExtension = {
    ".py": "Python",
    ".sql": "SQL",
    ".yml": "YAML",
    ".yaml": "YAML",
    ".toml": "TOML",
    ".mmd": "Mermaid",
    ".json": "JSON",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".html": "HTML",
    ".css": "CSS",
    ".sh": "Shell",
    ".ps1": "PowerShell",
    ".dockerfile": "Dockerfile",
  };

  if (cleanPath.endsWith("dockerfile")) return "Dockerfile";
  return byExtension[extension] || null;
}

function languageStatsFromTree(tree) {
  const stats = {};
  const hiddenLanguages = new Set(["Mermaid", "YAML", "TOML", "JSON"]);

  for (const item of tree.tree || []) {
    if (item.type !== "blob") continue;
    if (item.path.endsWith(".gitkeep")) continue;

    const language = languageFromPath(item.path);
    if (!language) continue;
    if (hiddenLanguages.has(language)) continue;

    stats[language] = (stats[language] || 0) + (item.size || 0);
  }

  return stats;
}

function cardShell(width, height, label, content, options = {}) {
  const radius = options.radius ?? 6;
  const bg = options.bg ?? palette.card;
  const border = options.border ?? palette.border;
  const borderOpacity = options.borderOpacity ?? ".45";
  const background = options.transparent === false
    ? `<rect width="${width}" height="${height}" rx="${radius}" fill="${bg}"/>`
    : `<rect width="${width}" height="${height}" rx="${radius}" fill="none"/>`;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(label)}">
  <defs>
    <linearGradient id="borderGlow" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.border2}"/>
      <stop offset=".45" stop-color="${palette.border}"/>
      <stop offset="1" stop-color="${palette.border2}"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  ${background}
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${radius - 1}" stroke="url(#borderGlow)" stroke-opacity="${borderOpacity}"/>
  <path d="M18 20h34M18 20v34M${width - 18} ${height - 20}h-34M${width - 18} ${height - 20}v-34" stroke="${palette.border2}" stroke-opacity=".8" stroke-width="2" filter="url(#softGlow)"/>
  ${content}
</svg>`;
}

function icon(type, x, y) {
  const stroke = palette.icon;
  const common = `stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;

  if (type === "star") {
    return `<path ${common} d="M${x + 8} ${y + 1}l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5L${x} ${y + 6.3}l5-.7L${x + 8} ${y + 1}z"/>`;
  }

  if (type === "commit") {
    return `<circle ${common} cx="${x + 8}" cy="${y + 8}" r="5"/><path ${common} d="M${x} ${y + 8}h3M${x + 13} ${y + 8}h3"/>`;
  }

  if (type === "pull") {
    return `<circle ${common} cx="${x + 4}" cy="${y + 4}" r="3"/><circle ${common} cx="${x + 12}" cy="${y + 12}" r="3"/><path ${common} d="M${x + 4} ${y + 7}v7M${x + 12} ${y + 2}v7M${x + 12} ${y + 2}h-4"/>`;
  }

  if (type === "issue") {
    return `<circle ${common} cx="${x + 8}" cy="${y + 8}" r="7"/><path ${common} d="M${x + 8} ${y + 4}v5M${x + 8} ${y + 12}h.1"/>`;
  }

  return `<path ${common} d="M${x + 3} ${y + 2}h9l3 3v12H${x + 3}zM${x + 6} ${y + 6}h6M${x + 6} ${y + 10}h6M${x + 6} ${y + 14}h4"/>`;
}

function githubMark(x, y, size, fill = "#0d1117") {
  const scale = size / 96;
  const path = "M48 0C21.5 0 0 21.5 0 48c0 21.2 13.8 39.2 32.9 45.4 2.4.4 3.3-1 3.3-2.3 0-1.1 0-4.1-.1-8.1-13.4 2.9-16.2-6.5-16.2-6.5-2.2-5.6-5.4-7.1-5.4-7.1-4.4-3 .3-2.9.3-2.9 4.9.3 7.5 5 7.5 5 4.3 7.4 11.3 5.3 14.1 4 .4-3.1 1.7-5.3 3.1-6.5-10.7-1.2-21.9-5.3-21.9-23.6 0-5.2 1.9-9.4 5-12.7-.5-1.2-2.2-6.2.5-12.9 0 0 4.1-1.3 13.2 5 3.8-1.1 7.9-1.6 12-1.6s8.2.5 12 1.6c9.1-6.2 13.2-5 13.2-5 2.7 6.7 1 11.7.5 12.9 3.1 3.3 5 7.5 5 12.7 0 18.4-11.2 22.4-21.9 23.6 1.8 1.5 3.3 4.5 3.3 9.1 0 6.5-.1 11.8-.1 13.4 0 1.3.9 2.8 3.3 2.3C82.2 87.2 96 69.2 96 48 96 21.5 74.5 0 48 0Z";

  return `<g transform="translate(${x} ${y}) scale(${scale})"><path fill="${fill}" d="${path}"/></g>`;
}

function statsSvg(ownerInfo, summary) {
  const profileName = ownerInfo.name || owner;
  const rows = [
    ["star", "Estrelas coletadas:", summary.totalStars],
    ["commit", "XP de commits:", summary.lastYearCommits],
    ["pull", "Portais PR:", summary.pullRequests],
    ["issue", "Incidentes rastreados:", summary.issues],
    ["repo", "Projetos liberados:", summary.publicRepoCount],
  ];

  const body = `
  <text x="32" y="42" fill="${palette.title}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(profileName)} | Sistema GitHub</text>
  <text x="32" y="58" fill="${palette.border2}" font-family="Segoe UI, Arial, sans-serif" font-size="10" font-weight="800" letter-spacing="2">STATUS: DATA HUNTER</text>
  ${rows
    .map(([type, label, value], index) => {
      const y = 82 + index * 22;
      return `${icon(type, 32, y - 15)}
  <text x="58" y="${y}" fill="${palette.text}" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700">${escapeXml(label)}</text>
  <text x="282" y="${y}" fill="${palette.value}" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="800">${escapeXml(formatNumber(value))}</text>`;
    })
    .join("\n  ")}
  <circle cx="388" cy="112" r="43" fill="${palette.chartSoft}" fill-opacity=".7"/>
  <circle cx="388" cy="112" r="33" fill="${palette.text}"/>
  <path d="M388 69a43 43 0 0 1 43 43" stroke="${palette.border2}" stroke-width="6" stroke-linecap="round" filter="url(#softGlow)"/>
  <path d="M388 155a43 43 0 0 1-39-25" stroke="${palette.border}" stroke-width="5" stroke-linecap="round" filter="url(#softGlow)"/>
  ${githubMark(364, 88, 48, "#090615")}
`;

  return cardShell(470, 194, `${profileName} | Sistema GitHub`, body);
}

function languagesSvg(languages) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const visibleEntries = entries.length ? entries : [["Sem dados", 1]];
  const total = visibleEntries.reduce((sum, [, value]) => sum + value, 0) || 1;

  let x = 32;
  const bar = visibleEntries
    .map(([language, value]) => {
      const width = Math.max(4, (value / total) * 274);
      const segment = `<rect x="${x.toFixed(2)}" y="76" width="${width.toFixed(2)}" height="8" rx="4" fill="${languageColor(language)}"/>`;
      x += width;
      return segment;
    })
    .join("\n  ");

  const legend = visibleEntries
    .slice(0, 6)
    .map(([language, value], index) => {
      const percent = ((value / total) * 100).toFixed(2);
      const col = index % 2;
      const row = Math.floor(index / 2);
      const lx = 32 + col * 168;
      const ly = 116 + row * 28;

      return `<circle cx="${lx}" cy="${ly - 5}" r="6" fill="${languageColor(language)}"/>
  <text x="${lx + 14}" y="${ly}" fill="${palette.text}" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700">${escapeXml(language)} ${percent}%</text>`;
    })
    .join("\n  ");

  const body = `
  <text x="32" y="47" fill="${palette.title}" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="800">Habilidades Tecnicas</text>
  <text x="32" y="62" fill="${palette.border2}" font-family="Segoe UI, Arial, sans-serif" font-size="10" font-weight="800" letter-spacing="2">ARSENAL DO PERFIL</text>
  ${bar}
  ${legend}
`;

  return cardShell(360, 194, "Habilidades Tecnicas", body);
}

function monthLabels(startDate) {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + index);
    return date;
  });
}

function buildMonthlyBuckets(commits, startDate) {
  const labels = monthLabels(startDate);
  const keys = labels.map((date) => `${date.getFullYear()}-${date.getMonth()}`);
  const buckets = new Array(12).fill(0);

  for (const commit of commits) {
    const date = new Date(commit.commit?.author?.date || commit.commit?.committer?.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const index = keys.indexOf(key);

    if (index >= 0) buckets[index] += 1;
  }

  return { labels, buckets };
}

function lineChart(labels, buckets) {
  const chart = { x: 325, y: 60, width: 420, height: 118 };
  const max = Math.max(1, ...buckets);
  const points = buckets.map((value, index) => {
    const x = chart.x + (index * chart.width) / (buckets.length - 1 || 1);
    const y = chart.y + chart.height - (value / max) * chart.height;
    return { x, y, value };
  });

  const areaPath = [
    `M ${chart.x} ${chart.y + chart.height}`,
    ...points.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`),
    `L ${chart.x + chart.width} ${chart.y + chart.height}`,
    "Z",
  ].join(" ");

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");

  const xLabels = labels
    .map((date, index) => {
      if (index % 2 !== 0 && index !== labels.length - 1) return "";
      const x = chart.x + (index * chart.width) / (labels.length - 1 || 1);
      const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getFullYear()).slice(2)}`;
      return `<text x="${x.toFixed(2)}" y="${chart.y + chart.height + 17}" text-anchor="middle" fill="${palette.text}" font-family="Segoe UI, Arial, sans-serif" font-size="11">${label}</text>`;
    })
    .join("\n  ");

  const yTicks = [0, Math.ceil(max / 2), max]
    .map((value) => {
      const y = chart.y + chart.height - (value / max) * chart.height;
      return `<path d="M${chart.x + chart.width} ${y.toFixed(2)}h6" stroke="${palette.axis}" stroke-width="1"/>
  <text x="${chart.x + chart.width + 11}" y="${(y + 4).toFixed(2)}" fill="${palette.text}" font-family="Segoe UI, Arial, sans-serif" font-size="11">${value}</text>`;
    })
    .join("\n  ");

  return `
  <text x="${chart.x + chart.width - 4}" y="38" text-anchor="end" fill="${palette.text}" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="700">evolucao no ultimo ano</text>
  <path d="${areaPath}" fill="${palette.chart}" fill-opacity=".9"/>
  <path d="${linePath}" stroke="${palette.value}" stroke-width="2" fill="none" filter="url(#softGlow)"/>
  <path d="M${chart.x} ${chart.y + chart.height}h${chart.width}M${chart.x + chart.width} ${chart.y}v${chart.height}" stroke="${palette.axis}" stroke-width="1"/>
  ${xLabels}
  ${yTicks}
`;
}

function overviewSvg(ownerInfo, summary) {
  const currentYear = new Date().getFullYear();
  const location = ownerInfo.location || "GitHub";
  const profileName = ownerInfo.name || owner;
  const title = `${owner} (${profileName})`;

  const rows = [
    ["commit", `${summary.thisYearCommits} missoes em ${currentYear}`],
    ["repo", `${summary.publicRepoCount} projetos liberados`],
    ["commit", `Entrou no GitHub ${timeAgo(ownerInfo.created_at)}`],
    ["repo", location],
  ];

  const body = `
  <text x="32" y="42" fill="${palette.title}" font-family="Segoe UI, Arial, sans-serif" font-size="24">${escapeXml(title)}</text>
  <text x="32" y="58" fill="${palette.border2}" font-family="Segoe UI, Arial, sans-serif" font-size="10" font-weight="800" letter-spacing="2">REGISTRO DE EVOLUCAO</text>
  ${rows
    .map(([type, label], index) => {
      const y = 86 + index * 32;
      return `${icon(type, 34, y - 17)}
  <text x="62" y="${y}" fill="${palette.text}" font-family="Segoe UI, Arial, sans-serif" font-size="15">${escapeXml(label)}</text>`;
    })
    .join("\n  ")}
  ${lineChart(summary.monthLabels, summary.monthlyBuckets)}
`;

  return cardShell(805, 220, `${config.projectName} activity overview`, body, {
    border: config.backgroundColor,
    borderOpacity: "1",
    radius: 7,
  });
}

async function collectCommitSummary() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfWindow = new Date(now);
  startOfWindow.setMonth(now.getMonth() - 11);
  startOfWindow.setDate(1);
  startOfWindow.setHours(0, 0, 0, 0);

  const commits = await paginate(
    (page) => `/repos/${owner}/${repo}/commits?since=${encodeURIComponent(startOfWindow.toISOString())}&per_page=100&page=${page}`,
    10,
  );

  const { labels, buckets } = buildMonthlyBuckets(commits, startOfWindow);
  const thisYearCommits = commits.filter((commit) => new Date(commit.commit?.author?.date || commit.commit?.committer?.date) >= startOfYear).length;

  return {
    commits,
    lastYearCommits: commits.length,
    thisYearCommits,
    monthLabels: labels,
    monthlyBuckets: buckets,
  };
}

async function collectIssueSummary(repositories) {
  const summaries = await Promise.all(
    repositories.map(async (repository) => {
      try {
        const [pulls, issues] = await Promise.all([
          paginate((page) => `/repos/${owner}/${repository.name}/pulls?state=all&per_page=100&page=${page}`, 10),
          paginate((page) => `/repos/${owner}/${repository.name}/issues?state=all&per_page=100&page=${page}`, 10),
        ]);

        return {
          pullRequests: pulls.length,
          issues: issues.filter((issue) => !issue.pull_request).length,
        };
      } catch {
        return {
          pullRequests: 0,
          issues: repository.open_issues_count || 0,
        };
      }
    }),
  );

  return {
    pullRequests: summaries.reduce((sum, item) => sum + item.pullRequests, 0),
    issues: summaries.reduce((sum, item) => sum + item.issues, 0),
  };
}

async function collectFileLanguages(repositories) {
  const perRepo = await Promise.all(
    repositories.map(async (repository) => {
      try {
        const tree = await github(`/repos/${owner}/${repository.name}/git/trees/${encodeURIComponent(repository.default_branch)}?recursive=1`);
        return languageStatsFromTree(tree);
      } catch {
        return {};
      }
    }),
  );

  return perRepo.reduce((acc, stats) => {
    for (const [language, value] of Object.entries(stats)) {
      acc[language] = (acc[language] || 0) + value;
    }

    return acc;
  }, {});
}

async function collectRepositories() {
  const repositories = await paginate(
    (page) => `/users/${owner}/repos?type=owner&sort=updated&per_page=100&page=${page}`,
    10,
  );

  return repositories.filter((repository) => !repository.fork && !repository.archived);
}

async function collectProfileCommitSummary(repositories) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfWindow = new Date(now);
  startOfWindow.setMonth(now.getMonth() - 11);
  startOfWindow.setDate(1);
  startOfWindow.setHours(0, 0, 0, 0);

  const allCommits = [];
  const contributedRepositories = new Set();

  for (const repository of repositories) {
    const commits = await paginate(
      (page) => `/repos/${owner}/${repository.name}/commits?since=${encodeURIComponent(startOfWindow.toISOString())}&per_page=100&page=${page}`,
      10,
    );

    if (commits.length) contributedRepositories.add(repository.name);
    allCommits.push(...commits);
  }

  const { labels, buckets } = buildMonthlyBuckets(allCommits, startOfWindow);
  const thisYearCommits = allCommits.filter((commit) => new Date(commit.commit?.author?.date || commit.commit?.committer?.date) >= startOfYear).length;

  return {
    commits: allCommits,
    lastYearCommits: allCommits.length,
    thisYearCommits,
    monthLabels: labels,
    monthlyBuckets: buckets,
    contributedRepositories: contributedRepositories.size,
  };
}

async function main() {
  const repository = await github(`/repos/${owner}/${repo}`);
  const repositories = await collectRepositories();

  const [ownerInfo, githubLanguages, fileLanguages, commitSummary, issueSummary] = await Promise.all([
    github(`/users/${owner}`),
    github(`/repos/${owner}/${repo}/languages`),
    collectFileLanguages(repositories.length ? repositories : [repository]),
    collectProfileCommitSummary(repositories.length ? repositories : [repository]),
    collectIssueSummary(repositories.length ? repositories : [repository]),
  ]);

  const languages = Object.keys(fileLanguages).length ? fileLanguages : githubLanguages;

  const summary = {
    ...commitSummary,
    ...issueSummary,
    totalStars: (repositories.length ? repositories : [repository]).reduce((sum, item) => sum + (item.stargazers_count || 0), 0),
    publicRepoCount: repositories.length || 1,
  };

  await mkdir(config.outputDir, { recursive: true });

  await Promise.all([
    writeFile(`${config.outputDir}/project-stats.svg`, statsSvg(ownerInfo, summary), "utf8"),
    writeFile(`${config.outputDir}/project-languages.svg`, languagesSvg(languages), "utf8"),
    writeFile(`${config.outputDir}/project-overview.svg`, overviewSvg(ownerInfo, summary), "utf8"),
  ]);

  console.log(`Generated README graphs for ${config.projectRepo}`);
}

main().catch((error) => {
  if (process.env.CI === "true") {
    console.error(error);
    process.exit(1);
  }

  console.warn(`Using local preview fallback: ${error.message}`);
  generateLocalPreviewFallback().catch((fallbackError) => {
    console.error(fallbackError);
    process.exit(1);
  });
});

async function generateLocalPreviewFallback() {
  const now = new Date();
  const startOfWindow = new Date(now);
  startOfWindow.setMonth(now.getMonth() - 11);
  startOfWindow.setDate(1);
  startOfWindow.setHours(0, 0, 0, 0);

  const labels = monthLabels(startOfWindow);
  const summary = {
    lastYearCommits: 11,
    thisYearCommits: 11,
    pullRequests: 0,
    issues: 0,
    totalStars: 0,
    publicRepoCount: 3,
    monthLabels: labels,
    monthlyBuckets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 6],
  };

  const ownerInfo = {
    name: "Daniel Germano",
    created_at: "2026-04-01T00:00:00Z",
    location: "Brasil",
  };

  const languages = {
    Python: 20836,
    SQL: 10015,
  };

  await mkdir(config.outputDir, { recursive: true });

  await Promise.all([
    writeFile(`${config.outputDir}/project-stats.svg`, statsSvg(ownerInfo, summary), "utf8"),
    writeFile(`${config.outputDir}/project-languages.svg`, languagesSvg(languages), "utf8"),
    writeFile(`${config.outputDir}/project-overview.svg`, overviewSvg(ownerInfo, summary), "utf8"),
  ]);

  console.log(`Generated local preview graphs for ${config.projectRepo}`);
}
