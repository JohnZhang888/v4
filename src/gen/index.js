export async function genIndexContent() {
  const dataResponse = await fetch(`../../page-data/menifest.json`);
  const data = await dataResponse.json();
  console.log(data);

  let list = "";
  for (let id in data) {
    console.log(id);
    console.log(data[id]);
    list += `<li><a href="/?page=${id}">${data[id].title}</a></li>`
  }

  return list;
}