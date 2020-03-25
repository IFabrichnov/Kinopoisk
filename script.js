const searchForm = document.querySelector('#search-form');
const movie = document.querySelector('#movies');

function apiSearch(e) {
  e.preventDefault();

  //определяем значение в input
  const searchText = document.querySelector('.form-control').value;
  //api
  const server = 'https://api.themoviedb.org/3/search/multi?api_key=54a1290145164c615ee7a1c5c2aa5ccd&language=ru&query=' + searchText;
  requestApi('GET', server);
}

searchForm.addEventListener('submit', apiSearch);

//функция которая обращается к серверу
function requestApi(method, url) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  //отсылаем запрос
  request.send();
  //ожидаем от сервера ответ
  request.addEventListener('readystatechange', () => {
    if (request.readyState !== 4) return;

    if (request.status !== 200) {
      console.log('error: '+request.status);
      return;
    }
    //распарсим json в объект
    const output = JSON.parse(request.responseText);

    let inner = '';
    //получаем названия фильмов или сериалов и добавляем в верстку
    output.results.forEach(function (item) {
      let nameItem = item.name || item.title;
      inner += '<div class="col-3">' + nameItem + '</div>';
    });
    //в контейнер movie передаем данные о фильме
    movie.innerHTML =  inner;

  });
}