(function () {
  const grid = document.getElementById('grid');
  const cartBtn = document.getElementById('cartBtn');
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

  function sizesSummary(p) {
    if (!p.sizes.length) return 'Made to your size';
    return p.sizes[0] + ' to ' + p.sizes[p.sizes.length - 1];
  }

  PRODUCTS.forEach(p => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.innerHTML =
      '<span class="imgwrap"><img loading="lazy" src="' + p.photos[0] + '" alt=""></span>' +
      '<span class="name"></span>' +
      '<span class="meta"></span>' +
      '<span class="price"></span>';
    card.querySelector('img').alt = p.name;
    card.querySelector('.name').textContent = p.name;
    card.querySelector('.meta').textContent = sizesSummary(p) + (p.colors.length ? ' · ' + p.colors.length + ' colors' : '');
    card.querySelector('.price').textContent = PLACEHOLDER_PRICE;
    card.addEventListener('click', () => openProduct(p));
    grid.appendChild(card);
  });

  function chip(label, selected, onPick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (selected ? ' is-on' : '');
    b.textContent = label;
    b.addEventListener('click', onPick);
    return b;
  }

  function openProduct(p) {
    current = p;
    selColor = p.colors[0] || '';
    selSize = p.sizes[0] || '';
    dPhotos.innerHTML = '';
    p.photos.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = p.name + ', view ' + (i + 1);
      dPhotos.appendChild(img);
    });
    dName.textContent = p.name;
    dPrice.textContent = PLACEHOLDER_PRICE;
    dDesc.textContent = p.desc || '';
    dDesc.hidden = !p.desc;
    dColors.innerHTML = '';
    dColorsWrap.hidden = !p.colors.length;
    p.colors.forEach(c => dColors.appendChild(chip(c, c === selColor, () => {
      selColor = c;
      [...dColors.children].forEach(el => el.classList.toggle('is-on', el.textContent === c));
    })));
    dSizes.innerHTML = '';
    dSizesWrap.hidden = !p.sizes.length;
    p.sizes.forEach(s => dSizes.appendChild(chip(s, s === selSize, () => {
      selSize = s;
      [...dSizes.children].forEach(el => el.classList.toggle('is-on', el.textContent === s));
    })));
    dNote.textContent = (p.delivery ? p.delivery + '. ' : '') + 'Custom sizing available on request. The final price is confirmed by Instagram DM.';
    detailDlg.showModal();
  }

  function renderCart() {
    cartBtn.textContent = cart.length ? 'Cart (' + cart.length + ')' : 'Cart is empty';
    cartEmpty.hidden = cart.length > 0;
    cartFull.hidden = cart.length === 0;
    cartList.innerHTML = '';
    cart.forEach(it => {
      const li = document.createElement('li');
      li.className = 'cartitem';
      li.innerHTML = '<img alt=""><span class="txt"><span class="nm"></span><span class="mt"></span></span>';
      li.querySelector('img').src = it.product.photos[0];
      li.querySelector('img').alt = it.product.name;
      li.querySelector('.nm').textContent = it.product.name;
      li.querySelector('.mt').textContent = [it.color && 'Color: ' + it.color, it.size && 'Size: ' + it.size].filter(Boolean).join(' · ');
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'remove';
      rm.textContent = 'Remove';
      rm.addEventListener('click', () => { cart = cart.filter(x => x.key !== it.key); renderCart(); });
      li.appendChild(rm);
      cartList.appendChild(li);
    });
    const lines = cart.map((it, i) => {
      const parts = [(i + 1) + ') ' + it.product.name];
      if (it.color) parts.push('Color: ' + it.color);
      if (it.size) parts.push('Size: ' + it.size);
      return parts.join(', ');
    });
    orderText.textContent = ['New order from the Mohtashema Designs website:', ...lines, 'Please confirm prices and availability.'].join('\n');
  }

  addBtn.addEventListener('click', () => {
    if (!current) return;
    cart.push({ key: current.id + '-' + selColor + '-' + selSize + '-' + cart.length, product: current, color: selColor, size: selSize });
    detailDlg.close();
    renderCart();
    cartDlg.showModal();
  });

  cartBtn.addEventListener('click', () => { renderCart(); cartDlg.showModal(); });
  document.getElementById('detailClose').addEventListener('click', () => detailDlg.close());
  document.getElementById('cartClose').addEventListener('click', () => cartDlg.close());
  detailDlg.addEventListener('click', e => { if (e.target === detailDlg) detailDlg.close(); });
  cartDlg.addEventListener('click', e => { if (e.target === cartDlg) cartDlg.close(); });

  copyBtn.addEventListener('click', async () => {
    const text = orderText.textContent;
    try {
      await navigator.clipboard.writeText(text);
      copyMsg.textContent = 'Copied. Paste it in the Instagram DM.';
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove();
      copyMsg.textContent = ok ? 'Copied. Paste it in the Instagram DM.' : 'Copy was blocked. Select the order text and copy it manually.';
    }
  });

  renderCart();
})();
