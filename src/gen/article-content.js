import { marked } from "https://cdn.osyb.cn/npm/marked/lib/marked.esm.js"


export async function genArticleContent(pageID) {
  const dataResponse = await fetch(`../../page-data/menifest.json`);
  const data = await dataResponse.json();
  const pageData = data[pageID];

  const contentResponse = await fetch(`../../page-data/${pageID}.md`);
  const passageMarkdown = await contentResponse.text();

  const markdownParsed = marked.parse(passageMarkdown);

  return `
  <h1>${pageData.title}</h1>
  <p>作者：${pageData.author}</p>
  <p>日期：${pageData.date}</p>
  ${markdownParsed}
  `;
}