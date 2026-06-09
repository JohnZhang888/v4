import { genArticleContent } from './article-content.js';
import { genIndexContent } from './index.js';
import hljs from "https://cdn.osyb.cn/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js"

const page = document.querySelector("content");
let pageID = new URLSearchParams(window.location.search).get("page");
if (pageID === null) pageID = "index";
console.log(pageID);

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



