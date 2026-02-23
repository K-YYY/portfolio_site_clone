    (() => {
      const toggle = document.querySelector('.menu-toggle');
      const drawer = document.querySelector('.drawer');
      const drawerBackdrop = document.querySelector('.drawer-backdrop');
      const closeBtn = document.querySelector('.drawer-close');
      const body = document.body;
      const links = drawer?.querySelectorAll('a') || [];

      const openDrawer = () => {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', false);
        drawerBackdrop.classList.add('open');
        drawerBackdrop.setAttribute('aria-hidden', false);
        body.classList.add('drawer-open');
      };
      const closeDrawer = () => {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', true);
        drawerBackdrop.classList.remove('open');
        drawerBackdrop.setAttribute('aria-hidden', true);
        body.classList.remove('drawer-open');
      };

      toggle?.addEventListener('click', () => {
        if (drawer.classList.contains('open')) closeDrawer();
        else openDrawer();
      });
      closeBtn?.addEventListener('click', closeDrawer);
      drawerBackdrop?.addEventListener('click', closeDrawer);
      links.forEach(l => l.addEventListener('click', closeDrawer));

      // KV: autoWidth + center の簡易スライダー（横移動・ループ）
      const kvList = document.querySelector('.kv-list');
      if (kvList) {
        const slides = Array.from(kvList.children);
        const dots = document.querySelector('.kv-dots');
        const imgs = kvList.querySelectorAll('img');
        const waitImages = Array.from(imgs).map((img) => {
          return img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
              });
        });

        Promise.all(waitImages).then(() => {
          let index = 0;
          let isAnimating = false;

          const setActive = (target) => {
            kvList.querySelectorAll('.kv-slide').forEach((el) => el.classList.remove('is-active'));
            target.classList.add('is-active');
            if (dots) {
              dots.querySelectorAll('button').forEach((btn, i) => {
                btn.classList.toggle('is-active', i === index);
              });
            }
          };

          const centerSlide = (idx, withTransition = true) => {
            const slide = kvList.children[idx];
            if (!slide) return;
            const track = kvList.parentElement;
            const trackWidth = track.getBoundingClientRect().width;
            const slideRect = slide.getBoundingClientRect();
            const listRect = kvList.getBoundingClientRect();
            const slideCenter = slideRect.left - listRect.left + slideRect.width / 2;
            const offset = slideCenter - trackWidth / 2;
            kvList.style.transition = withTransition ? 'transform 0.6s ease' : 'none';
            kvList.style.transform = `translateX(${-offset}px)`;
            setActive(slide);
          };

          // 初期位置
          centerSlide(index, false);

          // ドット生成
          if (dots) {
            dots.innerHTML = '';
            slides.forEach((_, i) => {
              const btn = document.createElement('button');
              btn.type = 'button';
              btn.setAttribute('aria-label', `KV ${i + 1}`);
              btn.addEventListener('click', () => {
                if (isAnimating) return;
                index = i;
                centerSlide(index, true);
              });
              dots.appendChild(btn);
            });
            setActive(slides[index]);
          }

          const next = () => {
            if (isAnimating) return;
            isAnimating = true;
            index = (index + 1) % slides.length;
            centerSlide(index, true);
            setTimeout(() => { isAnimating = false; }, 650);
          };

          setInterval(next, 4000);
          window.addEventListener('resize', () => centerSlide(index, false));
        });
      }

      // Modal (汎用)
      const bodyLock = () => document.body.classList.add('modal-open');
      const bodyUnlock = () => document.body.classList.remove('modal-open');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      const modalTriggers = document.querySelectorAll('[data-modal-target]');

      const openModal = (id) => {
        const modal = document.getElementById(`modal-${id}`);
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', false);
        modalBackdrop?.classList.add('open');
        bodyLock();
      };

      const closeModal = (modal) => {
        modal?.classList.remove('open');
        modal?.setAttribute('aria-hidden', true);
        modalBackdrop?.classList.remove('open');
        bodyUnlock();
      };

      modalTriggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
          const id = trigger.getAttribute('data-modal-target');
          openModal(id);
        });
      });

      document.querySelectorAll('.modal-close').forEach((btn) => {
        btn.addEventListener('click', () => {
          const modal = btn.closest('.modal');
          closeModal(modal);
        });
      });

      modalBackdrop?.addEventListener('click', () => {
        document.querySelectorAll('.modal.open').forEach((m) => {
          m.classList.remove('open');
          m.setAttribute('aria-hidden', true);
        });
        modalBackdrop.classList.remove('open');
        bodyUnlock();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const openModalEl = document.querySelector('.modal.open');
          if (openModalEl) closeModal(openModalEl);
        }
      });
    })();
