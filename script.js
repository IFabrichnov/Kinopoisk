const searchForm = document.querySelector('#search-form');
const movie = document.querySelector('#movies');
//начало url для обложки
const urlPoster = 'https://image.tmdb.org/t/p/w500';

function apiSearch(e) {
  e.preventDefault();
  //определяем значение в input
  const searchText = document.querySelector('.form-control').value;
  //Условие, запрещающее вводить пустые запросы в строке
  if (searchText.trim().length === 0) {
    movie.innerHTML = '<h2 class="col-12 text-center text-danger">Поле поиска не должно быть пустым</h2>';
    return;
  }
  //спиннер при загрузке страницы
  movie.innerHTML = '<div class="spinner"></div>';

  fetch('https://api.themoviedb.org/3/search/multi?api_key=54a1290145164c615ee7a1c5c2aa5ccd&language=ru&query=' + searchText).then(function (value) {
    if (value.status !== 200) {
      return Promise.reject(new Error(value.status));
    }
    return value.json();
  }).then(function (output) {
    let inner = '';
    //условие, которое будет говорить о том, что по запросу ничего не найдено
    if (output.results.length === 0) {
      inner = '<h2 class="col-12 text-center text-info">По вашему запросу ничего не найдено.</h2>';
    }
    //получаем названия фильмов или сериалов и добавляем в верстку
    output.results.forEach(function (item) {
      let nameItem = item.name || item.title;
      //создаем заглушку постер, на случай если у фильма нет обложки
      const poster = item.poster_path ? urlPoster + item.poster_path : './img/poster.jpg';
      //добавляем новый атрибут dataInfo и добавляем его в верстку если тип person
      let dataInfo = '';
      if (item.media_type !== 'person') dataInfo = `data-id="${item.id} "data-type="${item.media_type}"`;
      //верстка
      inner += `
         <div class="col-12 col-md-4 col-xl-3 item">
         <img src="${poster}" class="img_poster" alt="${nameItem}" ${dataInfo}>
         <h5>${nameItem}</h5>
         </div> 
      `;
    });
    //в контейнер movie передаем данные о фильме
    movie.innerHTML =  inner;

    addEventMedia();

  }).catch(function (reason) {
    movie.innerHTML = 'Упс, что-то пошло не так!';
    console.error('error: ' + reason.status);
  });
}

searchForm.addEventListener('submit', apiSearch);

//делаем постеры активными
function addEventMedia() {
  //определяем картики и навешиваем событие, чтоб при клике в дальнейшем открывалась инфа о фильме
  //делаем активный клик только по фильмам и сериалам
  const media = movie.querySelectorAll('img[data-id]');
  //перебираем псевдомассив постеров и навешиваем обработчик события по клику
  media.forEach(function (e) {
    e.style.cursor = 'pointer';
    e.addEventListener('click', showInfo);
  });
}

//создадим функцию, которая будет выводить информацию о фильме при клике на постер
function showInfo() {
  let url = '';
  if (this.dataset.type === 'movie') {
    url = 'https://api.themoviedb.org/3/movie/' + this.dataset.id + '?api_key=54a1290145164c615ee7a1c5c2aa5ccd&language=ru';
  } else if (this.dataset.type === 'tv') {
    url = 'https://api.themoviedb.org/3/tv/' + this.dataset.id + '?api_key=54a1290145164c615ee7a1c5c2aa5ccd&language=ru';
  } else {
    movie.innerHTML = '<h2 class="col-12 text-center text-danger">Произошла ошибка, повторите позже.</h2>';
  }

  const typeMedia = this.dataset.type;
  const idMedia = this.dataset.id;

  fetch(url).then(function (value) {
    if (value.status !== 200) {
      return Promise.reject(new Error(value.status));
    }
    return value.json();
  }).then(function (output) {
    console.log(output);
    //создаем заглушку постер, на случай если у фильма нет обложки
    const poster = output.poster_path ? urlPoster + output.poster_path : './img/poster.jpg';
    movie.innerHTML = `
    <h4 class="col-12 text-center text-info">${output.name || output.title}</h4>
    <div class="col-4">
        <img src="${poster}" class="poster_in_file" alt="${output.name || output.title}">
        ${(output.homepage) ? `<p class="text-center"> <a href="${output.homepage}"  target="_blank">Официальная страница</a> </p>` : ''} 
        ${(output.imdb_id) ? `<p class="text-center"> <a href="https://imdb.com/title/${output.imdb_id}" target="_blank">Страница на IMDB</a> </p>` : ''} 
    </div>
    <div class="col-8">
        <p>Рейтинг: ${output.vote_average} </p>
        <p>Статус: ${output.status} </p>
        <p>Премьера: ${output.first_air_date || output.release_date} </p>
        
        ${(output.last_episode_to_air) ? `<p>${output.number_of_seasons} сезон(ов) ${output.last_episode_to_air.episode_number} серий вышло</p>` : ''}
        
        <p>Описание: ${output.overview} </p>
        
        <br>
        
        <div class="youtube"></div>
    </div>
    `;
    //выводим трейлер
    getVideo(typeMedia,idMedia);
  }).catch(function (reason) {
    movie.innerHTML = 'Упс, что-то пошло не так!';
    console.error(reason || reason.status);
  });
}

//выдаем список топ фильмов недели при завершении загрузки страницы
document.addEventListener('DOMContentLoaded', function () {
  fetch('https://api.themoviedb.org/3/trending/all/week?api_key=54a1290145164c615ee7a1c5c2aa5ccd&language=ru')
    .then(function (value) {
    if (value.status !== 200) {
      return Promise.reject(new Error(value.status));
    }
    return value.json();
  }).then(function (output) {
    let inner = '<h4 class="col-12 text-center text-info">Топ фильмов недели:</h4>';
    if (output.results.length === 0) {
      inner = '<h2 class="col-12 text-center text-info">По вашему запросу ничего не найдено.</h2>';
    }
    output.results.forEach(function (item) {
      let nameItem = item.name || item.title;
      //будем проверять title для передачи его атрибут верстки
      let mediaType = item.title ? 'movie' : 'tv';
      const poster = item.poster_path ? urlPoster + item.poster_path : './img/poster.jpg';
      let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`;
      inner += `
         <div class="col-12 col-md-4 col-xl-3 item">
         <img src="${poster}" class="img_poster" alt="${nameItem}" ${dataInfo}>
         <h5>${nameItem}</h5>
         </div> 
      `;
    });
    movie.innerHTML =  inner;
    addEventMedia();
  }).catch(function (reason) {
    movie.innerHTML = 'Упс, что-то пошло не так!';
    console.error('error: ' + reason.status);
  });
});

//функция вывода видео
function getVideo(type, id) {
  let youtube = movie.querySelector('.youtube');

  fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=54a1290145164c615ee7a1c5c2aa5ccd&language=ru`)
    .then((value) => {
      if (value.status !== 200) {
        return Promise.reject(new Error(value.status));
      }
      return value.json();
    }).then((output)=> {
    let videoFrame = '<h5 class="text-info">Трейлеры:</h5>';
    //делаем проверку на наличие трейлера
    if(output.results.length === 0) {
      videoFrame = '<p>К сожалению трейлер отсутствует.</p>';
    }

    //перебираем трейлеры и выводим их
    output.results.forEach((item)=>{
      videoFrame += '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+ item.key +'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    });

    youtube.innerHTML = videoFrame;
  }).catch((reason) => {
    youtube.innerHTML = 'Видео отсутствует!';
    console.error('error: ' + reason.status);
  });
}