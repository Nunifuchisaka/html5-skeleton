// ページ内リンク(ハッシュ)クリック時にアニメーション付きでスムーススクロールする
export default class {

  #option;
  #selector;
  #interrupted = false;
  #SPEED_DEFAULT = 800; // 最初の速度
  #SPEED_REPEAT = 800; // 繰り返し時の速度
  #POSITION_EPSILON = 1; // 目的地のズレをこの範囲(px)以内なら「到達済み」とみなす

  constructor(opts) {
    this.#option = Object.assign({
      target: '[data-smooth-scroll]',
      gnav: null,
    }, opts);

    this.#selector = `a${this.#option.target}, ${this.#option.target} a[href*="#"]`;

    document.addEventListener('click', this.#click);
    // ユーザーが自分でスクロールし始めたら、以降の自動補正は行わない
    document.addEventListener('wheel', this.#onUserScroll, { passive: true });
    document.addEventListener('touchstart', this.#onUserScroll, { passive: true });
  }

  #onUserScroll = () => {
    this.#interrupted = true;
  };

  #easeSwing(progress) {
    return 0.5 - Math.cos(progress * Math.PI) / 2;
  }

  #targetPosition(target) {
    return target.getBoundingClientRect().top + window.scrollY;
  }

  #scrollAnimate = (target, scrollSpeed) => {
    const startY = window.scrollY;
    const startTime = performance.now();

    const step = (now) => {
      if ( this.#interrupted ) {
        return;
      }

      const progress = Math.min((now - startTime) / scrollSpeed, 1);
      // 画像読み込み等でレイアウトが変化しても対応できるよう、毎フレーム現在の目的地を取り直す
      const positionEnd = this.#targetPosition(target);
      window.scrollTo(0, startY + (positionEnd - startY) * this.#easeSwing(progress));

      if ( progress < 1 ) {
        requestAnimationFrame(step);
        return;
      }

      // アニメーション完了直後に目的地がさらにズレていないか、1フレーム待って確認する
      requestAnimationFrame(() => {
        if ( this.#interrupted ) {
          return;
        }
        if ( Math.abs(window.scrollY - this.#targetPosition(target)) > this.#POSITION_EPSILON ) {
          this.#scrollAnimate(target, this.#SPEED_REPEAT);
        }
      });
    };
    requestAnimationFrame(step);
  };

  #click = (e) => {
    const anchor = e.target.closest(this.#selector);
    if ( !anchor ) {
      return;
    }
    const href = anchor.getAttribute('href'),
          hash = this.#extractHash(href);
    if ( !hash || hash.length <= 1 ) {
      return;
    }
    const target = document.querySelector(hash);
    if ( target ) {
      e.preventDefault();
      if ( this.#option.gnav ) {
        this.#option.gnav.close();
      }
      this.#interrupted = false;
      this.#scrollAnimate(target, this.#SPEED_DEFAULT);
    }
  };

  #extractHash(href) {
    const hash = href.match(/#(.*)/);
    return hash ? hash[0] : null;
  }

}
