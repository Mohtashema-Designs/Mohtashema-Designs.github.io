(function () {
  const grid = document.getElementById('grid');
  const cartBtn = document.getElementById('cartBtn');
  const cartCount = document.getElementById('cartCount');
  const detailDlg = document.getElementById('detailDlg');
  const cartDlg = document.getElementById('cartDlg');
  const dPhotos = document.getElementById('dPhotos');
  const dName = document.getElementById('dName');
  const dPrice = document.getElementById('dPrice');
  const dDesc = document.getElementById('dDesc');
  const dColors = document.getElementById('dColors');
  const dSizes = document.getElementById('dSizes');
  const dColorsWrap = document.getElementById('dColorsWrap');
  const dSizesWrap = document.getElementById('dSizesWrap');
  const dNote = document.getElementById('dNote');
  const addBtn = document.getElementById('addBtn');
  const cartList = document.getElementById('cartList');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFull = document.getElementById('cartFull');
  const orderText = document.getElementById('orderText');
  const copyBtn = document.getElementById('copyBtn');
  const copyMsg = document.getElementById('copyMsg');

  let cart = [];
  let current = null;
  let selColor = '';
  let selSize = '';

  const priceNum = parseInt(PLACEHOLDER_PRICE.replace(/[^\d]/g, ''), 10);

  function sizesSummary(p) {
    if (!p.sizes.length) return 'Made to your size';
    return p.sizes[0] + ' to ' + p.sizes[p.sizes.length - 1];
  }

  // Hero: standalone file, swap img/hero.webp to change it
  document.getElementById('heroBg').style.backgroundImage =
    "url('img/hero.webp')";

  // Grid cards use lightweight thumbnails; detail views use full images
  function thumb(src) { return src.replace('img/web/', 'img/thumb/'); }

  // Grid
  PRODUCTS.forEach((p, i) => {
    const card = document.createElement('button');
    card.className = 'card reveal';
    const alt = p.photos[1] ? '<img class="alt" src="' + thumb(p.photos[1]) + '" alt="" loading="lazy">' : '';
    card.innerHTML =
      '<span class="card-imgwrap"><span class="card-img"><img src="' + thumb(p.photos[0]) + '" alt="' + p.name + '" loading="lazy">' + alt + '</span></span>' +
      '<span class="card-name">' + p.name + '</span>' +
      '<span class="card-meta">' + sizesSummary(p) + (p.colors.length ? ' &middot; ' + p.colors.length + ' colors' : '') + '</span>' +
      '<span class="card-price">' + PLACEHOLDER_PRICE + '</span>';
    card.style.transitionDelay = (i % 4) * 60 + 'ms';
    card.addEventListener('click', () => openDetail(p));
    grid.appendChild(card);
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  function openDetail(p) {
    current = p;
    selColor = '';
    selSize = '';
    dName.textContent = p.name;
    dPrice.textContent = PLACEHOLDER_PRICE;
    dDesc.textContent = p.desc || '';
    dPhotos.innerHTML = '';
    p.photos.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = p.name;
      dPhotos.appendChild(img);
    });
    dColorsWrap.hidden = !p.colors.length;
    dColors.innerHTML = '';
    p.colors.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = c;
      b.addEventListener('click', () => {
        selColor = c;
        markSel(dColors, b);
        if (p.colorImage && p.colorImage[c]) showColorPhoto(p.colorImage[c]);
        else showColorPhoto(null);
      });
      dColors.appendChild(b);
    });
    dSizesWrap.hidden = !p.sizes.length;
    dSizes.innerHTML = '';
    p.sizes.forEach((s) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = s;
      b.addEventListener('click', () => { selSize = s; markSel(dSizes, b); });
      dSizes.appendChild(b);
    });
    dNote.textContent = (p.delivery ? p.delivery + '. ' : '') +
      'Custom sizing available on request. The final price is confirmed by Instagram DM.';
    detailDlg.showModal();
  }

  function markSel(wrap, btn) {
    wrap.querySelectorAll('.chip').forEach((c) => c.classList.remove('sel'));
    btn.classList.add('sel');
  }

  // Swap the detail gallery to a color-specific photo (or back to all)
  function showColorPhoto(src) {
    const imgs = dPhotos.querySelectorAll('img');
    if (!src) { imgs.forEach((im) => (im.style.display = '')); dPhotos.scrollTo({left:0}); return; }
    let found = false;
    imgs.forEach((im) => {
      const on = im.getAttribute('src') === src;
      im.style.display = on ? '' : 'none';
      if (on) found = true;
    });
    if (!found) {
      const im = document.createElement('img');
      im.src = src;
      im.alt = current ? current.name : '';
      dPhotos.appendChild(im);
      imgs.forEach((o) => (o.style.display = 'none'));
    }
    dPhotos.scrollTo({left:0});
  }

  addBtn.addEventListener('click', () => {
    if (!current) return;
    if (current.colors.length && !selColor) { pulse(dColorsWrap); return; }
    if (current.sizes.length && !selSize) { pulse(dSizesWrap); return; }
    cart.push({ p: current, color: selColor, size: selSize });
    detailDlg.close();
    openCart();
  });

  function pulse(el) {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'pop .3s ease';
  }

  function openCart() {
    renderCart();
    cartDlg.showModal();
  }

  function renderCart() {
    cartCount.textContent = cart.length;
    cartEmpty.hidden = cart.length > 0;
    cartFull.hidden = cart.length === 0;
    cartList.innerHTML = '';
    cart.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      const meta = [item.color, item.size ? 'Size ' + item.size : ''].filter(Boolean).join(' &middot; ');
      row.innerHTML =
        '<img src="' + thumb(item.p.photos[0]) + '" alt="">' +
        '<span><span class="ci-name">' + item.p.name + '</span><br><span class="ci-meta">' + meta + '</span></span>' +
        '<span><span class="ci-price">' + PLACEHOLDER_PRICE + '</span> <button class="ci-remove" aria-label="Remove">&times;</button></span>';
      row.querySelector('.ci-remove').addEventListener('click', () => { cart.splice(i, 1); renderCart(); });
      cartList.appendChild(row);
    });
    document.getElementById('cartTotal').textContent =
      'EGP ' + (priceNum * cart.length).toLocaleString('en-US');
    const lines = ['Hello Mohtashema Designs! I would like to order:', ''];
    cart.forEach((item, i) => {
      lines.push((i + 1) + '. ' + item.p.name +
        (item.color ? ' - ' + item.color : '') +
        (item.size ? ' - Size ' + item.size : ''));
    });
    lines.push('', 'Please confirm the final price and delivery. Thank you!');
    orderText.value = lines.join('\n');
    copyMsg.hidden = true;
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(orderText.value).then(() => { copyMsg.hidden = false; });
  });

  cartBtn.addEventListener('click', openCart);
  document.getElementById('detailClose').addEventListener('click', () => detailDlg.close());
  document.getElementById('cartClose').addEventListener('click', () => cartDlg.close());
  document.getElementById('keepShopping').addEventListener('click', () => cartDlg.close());
  [detailDlg, cartDlg].forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  });
})();
