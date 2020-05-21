import { GalleryTools } from './tools.js';
import { imgs } from './images.js'; //массив url картинок, представим, что получили его с сервера после запроса

let galleryTools = new GalleryTools(
  imgs,
  'img-wrapper',
  'modal-backdrop',
  'outer-container',
  'comment-section'
);

//добавляем обработчики событий клика по картинкам
function addClickListeners() {
  $('.container>img').each(function (index) {
    this.addEventListener('click', function (event) {
      galleryTools.openWindowWithImage(event.target);
    });
  });
}

//создает контейнеры с картинками, количество зависит от размера экрана
function initialize() {
  $('.outer-container').empty();
  if (window.matchMedia('(min-width: 768px)').matches) {
    galleryTools.createContainers(3);
    galleryTools.appendImagesToContainers(3);
    addClickListeners();
  } else if (window.matchMedia('(min-width: 550px)').matches) {
    galleryTools.createContainers(2);
    galleryTools.appendImagesToContainers(2);
    addClickListeners();
  } else {
    galleryTools.createContainers(1);
    galleryTools.appendImagesToContainers(1);
    addClickListeners();
  }
}

initialize();

//закрываем окно при клике за пределами окна просмотра
$('.modal-backdrop').click(function (event) {
  event.stopPropagation();
  if ($(event.target).hasClass('modal-backdrop')) {
    galleryTools.closeWindow();
  }
});

// закрываем окно при клике на крестик
$('.close').click(function (event) {
  event.stopPropagation();
  // closeWindow();
  galleryTools.closeWindow();
});

//нажали стрелку вправо
$('.right').click(function (event) {
  event.stopPropagation();
  galleryTools.setNextImg();
});

//нажали стрелку влево
$('.left').click(function (event) {
  event.stopPropagation();
  galleryTools.setPreviosImg();
});
// нажали на сердечко
$('.fa-heart').click(function (event) {
  event.stopPropagation();
  galleryTools.clickToLike();
});

// обработка нажатия клавиш влево и вправо на клавиатуре
$('body').keydown(function (event) {
  event.stopPropagation();
  if (event.which === 39) {
    galleryTools.setNextImg();
  }
  if (event.which === 37) {
    galleryTools.setPreviosImg();
  }
  if (event.which === 27) {
    galleryTools.closeWindow();
  }
});
//отрисовываем написанный комментарий
$('#submit').click(function () {
  let username = $('#myname').val();
  let comment = $('#mycomment').val();
  if (username !== '' && comment !== '') {
    galleryTools.addComment(username, comment);
  }
});

//перерисовка при изменении размеров чтобы можно было поиграть с параметрами
$(window).resize(function () {
  initialize();
});
