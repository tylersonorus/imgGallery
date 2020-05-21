export class GalleryTools {
  constructor(
    imgs,
    modalWindowClassName,
    modalBackDropCkassName,
    outerContainerClassName,
    commentSectionClassName
  ) {
    this.imgs = imgs; // массив данных с изображениями
    this.modalWindowClassName = modalWindowClassName;
    this.modalBackDropCkassName = modalBackDropCkassName;
    this.outerContainerClassName = outerContainerClassName;
    this.commentSectionClassName = commentSectionClassName;
    this.curImageIndex = 0;   //указывает на текущую картинку в окне просмотра
  }

  //поочередно прикрепляет картинки к контейнерам
  appendImagesToContainers(numOfContainers) {
    this.imgs.forEach((element, index) => {
      $(`div#${index % numOfContainers}`).append(
        $('<img>').attr('src', element.url).attr('id', index)
      );
    });
  }
  //создает flex контейнеры
  createContainers(number) {
    for (let i = number - 1; i >= 0; i--) {
      $(`.${this.outerContainerClassName}`).prepend(
        $('<div>').attr('id', i).addClass('container')
      );
    }
  }

  //функция открывает окно с картинкой
  openWindowWithImage(element) {
    $(`.${this.modalBackDropCkassName}`).css('visibility', 'visible');
    $('body').css('overflow', 'hidden');
    let id = parseInt($(element).attr('id'));
    this.curImageIndex = id;
    $(`.${this.modalWindowClassName} img`).remove();
    $(`.${this.modalWindowClassName}`).prepend(
      $('<img>').attr('src', this.imgs[id].url)
    );
    this.handleLike(this.imgs[this.curImageIndex].isLiked);
    this.renderComments();
  }

  //закрывает окно
  closeWindow() {
    $(`.${this.modalBackDropCkassName}`).css('visibility', 'hidden');
    $('body').css('overflow', 'auto');
  }
//смена состояния при нажатии на "сердечко"
  clickToLike() {
    let isLiked = this.imgs[this.curImageIndex].isLiked;
    if (isLiked) {
      this.imgs[this.curImageIndex].numOfLikes--;
    } else {
      this.imgs[this.curImageIndex].numOfLikes++;
    }
    this.handleLike(!isLiked);
    this.imgs[this.curImageIndex].isLiked = !isLiked;
  }

  //переход на след. картинку
  setNextImg() {
    if (this.curImageIndex === this.imgs.length - 1) return;
    this.curImageIndex++;
    $(`.${this.modalWindowClassName} img`).remove();
    $(`.${this.modalWindowClassName}`).prepend(
      $('<img>').attr('src', this.imgs[this.curImageIndex].url)
    );
    this.handleLike(this.imgs[this.curImageIndex].isLiked);
    this.renderComments();
  }
  //переход на пред. картинку
  setPreviosImg() {
    if (this.curImageIndex === 0) return;
    this.curImageIndex--;
    $(`.${this.modalWindowClassName} img`).remove();
    $(`.${this.modalWindowClassName}`).prepend(
      $('<img>').attr('src', this.imgs[this.curImageIndex].url)
    );
    this.handleLike(this.imgs[this.curImageIndex].isLiked);
    this.renderComments();
  }
//отрисовываем комментарии других пользователей
  renderComments() {
    $('.comment').remove();

    this.imgs[this.curImageIndex].comments.forEach((_, index) => {
      let username = this.imgs[this.curImageIndex].comments[index].username;
      let avatarUrl = this.imgs[this.curImageIndex].comments[index].avatar;
      let text = this.imgs[this.curImageIndex].comments[index].comment;
      $(`.${this.commentSectionClassName}`).prepend(
        this.createComment(username, text, avatarUrl)
      );
    });
  }
  //добавляем коммент к секции
  addComment(username, text) {
    let avatarUrl =
      'https://storage.googleapis.com/indie-hackers.appspot.com/avatars/pkSCIOf9XJWObSArUtD9QrovFJW2';
    $(`.${this.commentSectionClassName}`).prepend(
      this.createComment(username, text, avatarUrl)
    );
    this.imgs[this.curImageIndex].comments.push({
      username,
      comment: text,
      avatar: avatarUrl,
    });
  }
//создаем комментарий
  createComment(usr, commentText, avatarUrl) {
    let comment = $('<div>').addClass('comment');
    let body = $('<div>').addClass('body-comment');
    let avatar = $('<img>').addClass('avatar').attr('src', avatarUrl);
    let username = $('<div>').addClass('user').text(usr);
    let text = $('<div>').addClass('comment-text').text(commentText);

    body.append(username, text);
    comment.append(avatar, body);
    return comment;
  }
//визуальная обработка смены состояния "сердечка" и коли-ва лайков
  handleLike(isLiked) {
    $('.likes span').empty();
    $('.likes span').text(this.imgs[this.curImageIndex].numOfLikes);
    if (isLiked) {
      $(`.fa-heart`).addClass('liked');
      $('.fa-heart').off('mouseenter mouseleave');
    } else {
      $(`.fa-heart`).removeClass('liked');
      $('.fa-heart').removeClass('hover');
      $('.fa-heart').hover(
        function () {
          $('.fa-heart').addClass('hover');
        },
        function () {
          $('.fa-heart').removeClass('hover');
        }
      );
    }
  }
}
