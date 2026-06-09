import { genArticleContent, buildLeftBar, buildRightBar, sortPageEntries } from './article-content.js';
import { genIndexContent } from './index.js';
import hljs from "https://cdn.osyb.cn/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js"

const page = document.querySelector("content");
let pageID = new URLSearchParams(window.location.search).get("page");
if (pageID === null) pageID = "index";document.body.classList.add(`page-${pageID}`);console.log(pageID);

let content = "";
if (pageID === "index") {
  content = await genIndexContent();
} else {
  content = await genArticleContent(pageID);
}
page.innerHTML = `
  <div class="container"> 
    ${content}
  </div>
`;

const themeOptions = [
  { value: 'auto', label: '跟随浏览器', icon: 'bi-laptop' },
  { value: 'light', label: '浅色', icon: 'bi-sun-fill' },
  { value: 'dark', label: '深色', icon: 'bi-moon-fill' }
];

const drawer = document.querySelector('.mobile-drawer');
const drawerScrim = document.querySelector('.mobile-drawer-scrim');
const drawerTabs = Array.from(document.querySelectorAll('.drawer-tab'));
const drawerPanels = {
  list: document.querySelector('.drawer-panel-list'),
  toc: document.querySelector('.drawer-panel-toc')
};
const menuButton = document.querySelector('.topbar-menu-button');
const drawerClose = document.querySelector('.drawer-close-button');
const themeButton = document.querySelector('.topbar-theme-button');
const themeIcon = themeButton.querySelector('.topbar-theme-icon');
const themeLabel = themeButton.querySelector('.topbar-theme-label');
const themeMenu = document.querySelector('.topbar-dropdown-menu');
const themeItems = Array.from(themeMenu.querySelectorAll('[data-theme]'));

function readCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
  return match ? match[2] : '';
}

function writeCookie(name, value) {
  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax`;
}

function getPreferredMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyMode(mode) {
  const target = mode === 'dark' ? 'dark' : 'light';
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(target);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(target);
}

function renderThemeMenu(mode) {
  themeItems.forEach(item => {
    item.hidden = item.dataset.theme === mode;
  });
}

function updateThemeButton(mode) {
  const option = themeOptions.find(opt => opt.value === mode) || themeOptions[0];
  themeIcon.className = `topbar-theme-icon bi ${option.icon}`;
  themeLabel.textContent = option.label;
  renderThemeMenu(mode);
}

function setThemeMode(mode) {
  writeCookie('themeMode', mode);
  if (mode === 'auto') {
    applyMode(getPreferredMode());
  } else {
    applyMode(mode);
  }
  updateThemeButton(mode);
}

function initTheme() {
  const stored = readCookie('themeMode') || 'auto';
  const active = stored === 'auto' ? getPreferredMode() : stored;
  applyMode(active);
  updateThemeButton(stored);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (readCookie('themeMode') === 'auto') {
      applyMode(getPreferredMode());
    }
  });
}

async function buildDrawerContent() {
  const dataResponse = await fetch(`page-data/basic-data.json`);
  const data = await dataResponse.json();
  const sortedEntries = sortPageEntries(data);
  drawerPanels.list.innerHTML = `<div class="sidebar-title">文章列表</div>${buildLeftBar(sortedEntries, pageID !== 'index' ? pageID : '')}`;

  if (pageID !== 'index') {
    const contentResponse = await fetch(`page-data/${pageID}.md`);
    const passageMarkdown = await contentResponse.text();
    const rightBar = buildRightBar(passageMarkdown);
    drawerPanels.toc.innerHTML = `<div class="sidebar-title">目录</div>${rightBar || '<div class="sidebar-item">暂无目录</div>'}`;
  } else {
    drawerPanels.toc.innerHTML = `<div class="sidebar-title">目录</div><div class="sidebar-item">暂无目录</div>`;
  }
}

function openDrawer() {
  drawer?.classList.add('open');
  drawer?.removeAttribute('hidden');
  drawerScrim?.removeAttribute('hidden');
}

function closeDrawer() {
  drawer?.classList.remove('open');
  drawerScrim?.setAttribute('hidden', '');
}

function switchDrawerTab(tabKey) {
  drawerTabs.forEach(tab => tab.classList.toggle('drawer-tab-active', tab.dataset.drawerTab === tabKey));
  Object.entries(drawerPanels).forEach(([key, panel]) => {
    panel.hidden = key !== tabKey;
  });
}

function toggleThemeMenu() {
  themeMenu.hidden = !themeMenu.hidden;
}

function closeThemeMenu() {
  themeMenu.hidden = true;
}

menuButton?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
drawerScrim?.addEventListener('click', closeDrawer);
drawerTabs.forEach(tab => tab.addEventListener('click', () => switchDrawerTab(tab.dataset.drawerTab)));
drawer?.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link) {
    closeDrawer();
  }
});

themeButton?.addEventListener('click', event => {
  event.stopPropagation();
  toggleThemeMenu();
});

themeItems.forEach(item => item.addEventListener('click', () => {
  const mode = item.dataset.theme;
  setThemeMode(mode);
  closeThemeMenu();
}));

document.addEventListener('click', event => {
  if (!event.target.closest('.topbar-dropdown')) {
    closeThemeMenu();
  }
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeDrawer();
    closeThemeMenu();
  }
});

await buildDrawerContent();
switchDrawerTab('list');
initTheme();

if (pageID !== "index") {
  const subtitles = document.querySelectorAll(".markdownContent h2");
  for (const subtitle of subtitles) {
    subtitle.setAttribute("id", subtitle.innerHTML)
  }

  const links = document.querySelectorAll(".markdownContent a");
  for (const link of links) {
    link.classList.add("link-primary");
  }

  hljs.highlightAll();

  const renderKaTeX = () => {
    if (typeof renderMathInElement !== "function") return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  };

  if (typeof renderMathInElement === "function") {
    renderKaTeX();
  } else {
    window.addEventListener("load", renderKaTeX);
  }

  const dataResponse = await fetch(`page-data/basic-data.json`);
  const data = await dataResponse.json();

  document.querySelector("title").innerHTML = `${data[pageID].title} - JZ8 Blogs`;
} else {
  document.querySelector("title").innerHTML = "JZ8 Blogs"
}



