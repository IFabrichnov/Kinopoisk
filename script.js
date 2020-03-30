const searchForm = document.querySelector('#search-form');
const movie = document.querySelector('#movies');
//начало url для обложки
const urlPoster = 'https://image.tmdb.org/t/p/w500';


function apiSearch(e) {
  e.preventDefault();

  //определяем значение в input
  const searchText = document.querySelector('.form-control').value;
  //api
  const server = 'https://api.themoviedb.org/3/search/multi?api_key=54a1290145164c615ee7a1c5c2aa5ccd&language=ru&query=' + searchText;
  movie.innerHTML = 'Загрузка';

  fetch(server).then(function (value) {
    if (value.status !== 200) {
      return Promise.reject(value);
    }
    return value.json();
  }).then(function (output) {


    let inner = '';
    //получаем названия фильмов или сериалов и добавляем в верстку
    output.results.forEach(function (item) {
      let nameItem = item.name || item.title;
      inner += `
         <div class="col-12 col-md-4 col-xl-3 item">
         <img src="${urlPoster + item.poster_path}" alt="${nameItem}">
         <h5>${nameItem}</h5>
         </div> 
      `;
    });
    //в контейнер movie передаем данные о фильме
    movie.innerHTML =  inner;
  }).catch(function (reason) {
    movie.innerHTML = 'Упс, что-то пошло не так!';
    console.error('error: ' + reason.status);
  });
}

searchForm.addEventListener('submit', apiSearch);
