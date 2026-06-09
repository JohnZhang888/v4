import { marked } from "https://cdn.osyb.cn/npm/marked/lib/marked.esm.js"

// 生成文章页面内容：渲染 Markdown、构建文章列表和目录。
export async function genArticleContent(pageID) {
  // 加载页面元数据并获取当前页面的信息。
  const dataResponse = await fetch(`page-data/basic-data.json`);
  const data = await dataResponse.json();
  const pageData = data[pageID];

  // 加载当前文章的 Markdown 源内容。
  const contentResponse = await fetch(`page-data/${pageID}.md`);
  const passageMarkdown = (await contentResponse.text()).replace(/\\/g, "\\\\");

  const markdownParsed = marked.parse(passageMarkdown);

  const sortedEntries = sortPageEntries(data);
  const leftBarList = buildLeftBar(sortedEntries, pageID);
  const rightBarList = buildRightBar(passageMarkdown);

  // 输出最终页面布局，包括左侧文章列表、右侧目录和正文内容。
  return `
  <div class="responsive-row">
          <div class="box-left">
            <div class="sidebar-title">文章列表</div>
            ${leftBarList}
          </div>
          <div class="box-right">
            <div class="sidebar-title">目录</div>
            ${rightBarList}
          </div>
          <div class="box-center">
            <h1 style="margin-top: -8px;">${pageData.title}</h1>
            <div style="margin: 12px 0 8px 0">
              <p class="faded-text" style="margin: 0 0 0 0;"><i class="bi bi-pencil-fill"></i>&ensp;${pageData.author}&emsp;&emsp;<i class="bi bi-calendar-fill"></i>&ensp;${pageData.date}</p>
              <p class="faded-text" style="margin: 4px 0 8px 0;">${pageData.description}</p>
              <p><button class="button-tertiary" onclick="copyMarkdown(this)"><i class="bi bi-clipboard-fill"></i>&ensp;复制 Markdown</button></p>
              <div class="markdownContent">
                ${markdownParsed}
              </div>
              <p class="faded-text">本文按照 <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans" class="link-primary">CC BY-SA 4.0</a> 协议发布。</p>
            </div>
          </div>
        </div>
  `;
}

function sortPageEntries(pageData) {
  return Object.entries(pageData).sort(([idA, itemA], [idB, itemB]) => {
    const pinA = Number(itemA.pinValue ?? 0);
    const pinB = Number(itemB.pinValue ?? 0);
    if (pinA !== pinB) {
      return pinB - pinA;
    }

    const dateA = itemA.date ?? "";
    const dateB = itemB.date ?? "";
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }

    const titleA = itemA.title ?? "";
    const titleB = itemB.title ?? "";
    return titleA.localeCompare(titleB);
  });
}

function buildLeftBar(sortedEntries, currentPageID) {
  let html = ``;
  for (const [id, item] of sortedEntries) {
    const className = id == currentPageID ? "sidebar-item-selected" : "sidebar-item";
    html += `<a href="./?page=${id}"><div class="${className}">${item.title}</div></a>`;
  }
  return html;
}

function buildRightBar(markdownText) {
  const subtitles = Array.from(
    markdownText.matchAll(/^##\s+(.*)$/gm),
    (match) => match[1].trim()
  );

  let html = ``;
  for (const subtitle of subtitles) {
    html += `<a href="#${subtitle}"><div class="sidebar-item">${subtitle}</div></a>`;
  }
  return html;
}

export { buildLeftBar, buildRightBar, sortPageEntries };