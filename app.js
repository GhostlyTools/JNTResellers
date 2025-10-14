// Simple product loader + filters + buy link support
const PRODUCTS_URL = 'products.json'; // put products.json at repo root
let products = [];
let filtered = [];
let page = 1;
const perPage = 12;
let cart = JSON.parse(localStorage.getItem('resellr_cart')||'[]');

// UI refs
const productGrid = document.getElementById('productGrid');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const priceMax = document.getElementById('priceMax');
const priceMaxVal = document.getElementById('priceMaxVal');
const conditionFilter = document.getElementById('conditionFilter');
const ratingFilter = document.getElementById('ratingFilter');
const sortSelect = document.getElementById('sortSelect');
const breadcrumbCat = document.getElementById('breadcrumbCat');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// init
window.addEventListener('load', init);
document.getElementById('searchBtn')?.addEventListener('click', ()=>{ applyFilters(); });
document.querySelectorAll('.cat-nav a').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const c = a.dataset.cat;
    categorySelect.value = c;
    breadcrumbCat.textContent = c || 'All';
    applyFilters();
  });
});

function init(){
  fetch(PRODUCTS_URL).then(r=>{
    if(!r.ok) throw new Error('no products.json');
    return r.json();
  }).then(data=>{
    products = data.map(p => ({...p, price: Number(p.price||0), rating: Number(p.rating|| (Math.random()*1.8+3.2).toFixed(1))}));
    populateCategories();
    priceMax.max = Math.ceil(Math.max(...products.map(p=>p.price), 2000));
    priceMax.value = priceMax.max;
    priceMaxVal.textContent = priceMax.value;
    applyFilters();
  }).catch(err=>{
    console.warn('Could not load products.json - using fallback', err);
    products = fallbackProducts();
    populateCategories();
    applyFilters();
  });

  // events
  searchInput.addEventListener('input', ()=>{ page = 1; applyFilters(); });
  categorySelect.addEventListener('change', ()=>{ page = 1; breadcrumbCat.textContent = categorySelect.value || 'All'; applyFilters(); });
  priceMax.addEventListener('input', ()=>{ priceMaxVal.textContent = priceMax.value; page = 1; applyFilters(); });
  conditionFilter.addEventListener('change', ()=>{ page = 1; applyFilters(); });
  ratingFilter.addEventListener('change', ()=>{ page = 1; applyFilters(); });
  sortSelect.addEventListener('change', ()=>{ page = 1; applyFilters(); });

  document.getElementById('prevPage').addEventListener('click', ()=>{ if(page>1){ page--; applyFilters(); }});
  document.getElementById('nextPage').addEventListener('click', ()=>{ page++; applyFilters(); });

  document.getElementById('cartCount').textContent = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('closeCart').addEventListener('click', ()=>{ cartModal.classList.add('hidden'); });
  document.getElementById('clearFilters').addEventListener('click', ()=>{
    categorySelect.value=''; searchInput.value=''; priceMax.value=priceMax.max; priceMaxVal.textContent = priceMax.value;
    conditionFilter.value=''; ratingFilter.value='0'; sortSelect.value='featured'; page=1; applyFilters();
  });
  checkoutBtn?.addEventListener('click', ()=>{ alert('Checkout flow — integrate payment / auto-purchase script here.'); });
}

function populateCategories(){
  const cats = Array.from(new Set(products.map(p=>p.category).filter(Boolean)));
  categorySelect.innerHTML = `<option value="">All</option>` + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}

// core filter + render
function applyFilters(){
  const q = searchInput.value.trim().toLowerCase();
  const cat = categorySelect.value;
  const maxP = Number(priceMax.value);
  const cond = conditionFilter.value;
  const minRating = Number(ratingFilter.value);

  filtered = products.filter(p=>{
    if(cat && p.category !== cat) return false;
    if(p.price > maxP) return false;
    if(cond && p.condition !== cond) return false;
    if(minRating && (Number(p.rating||0) < minRating)) return false;
    if(q){
      return (p.title||'').toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q);
    }
    return true;
  });

  // sort
  if(sortSelect.value === 'price-asc') filtered.sort((a,b)=>a.price-b.price);
  else if(sortSelect.value === 'price-desc') filtered.sort((a,b)=>b.price-a.price);
  else if(sortSelect.value === 'newest') filtered.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));

  renderPage();
}

function renderPage(){
  const start = (page-1)*perPage;
  const slice = filtered.slice(start, start+perPage);
  productGrid.innerHTML = '';
  resultsCount.textContent = `${filtered.length} results`;
  document.getElementById('pageInfo').textContent = `Page ${page}`;

  if(slice.length===0){
    productGrid.innerHTML = `<div class="card">No results found.</div>`;
    return;
  }

  slice.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.title)}">` : `<div style="padding:6px;color:#6b7280">${escapeHtml(p.title)}</div>`}</div>
      <div>
        <h4 class="title">${escapeHtml(p.title)}</h4>
        <div class="meta">${escapeHtml(p.sku || '')} • ${escapeHtml(p.condition||'')}</div>
        <div class="rating">${'★'.repeat(Math.round(p.rating||4))} <span style="color:var(--muted);font-weight:600;margin-left:6px">${(p.rating||4).toFixed(1)}</span></div>
        <div class="price">$${Number(p.price).toFixed(2)}</div>
      </div>
      <div class="actions">
        <button class="btn" data-id="${p.id}" data-action="details">View</button>
        <button class="btn-primary" data-id="${p.id}" data-action="buy">Buy</button>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // attach events
  productGrid.querySelectorAll('button[data-action="buy"]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const p = products.find(x=>x.id===id);
      if(!p) return;
      // if product has externalLink, open it (simulated auto-purchase). If you have automation, call it here.
      if(p.externalLink){
        // open in new tab and also add to cart
        window.open(p.externalLink, '_blank');
      }
      addToCart(p, 1);
    });
  });

  productGrid.querySelectorAll('button[data-action="details"]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const p = products.find(x=>x.id===id);
      if(!p) return;
      alert(`${p.title}\n\n${p.desc || ''}\n\nPrice: $${p.price}`);
    });
  });
}

// cart
function addToCart(product, qty=1){
  const idx = cart.findIndex(c=>c.id===product.id);
  if(idx>-1) cart[idx].qty += qty;
  else cart.push({id:product.id, title:product.title, price:product.price, qty});
  localStorage.setItem('resellr_cart', JSON.stringify(cart));
  document.getElementById('cartCount').textContent = cart.reduce((s,i)=>s+i.qty,0);
  showCart();
}

function showCart(){
  cartModal.classList.remove('hidden');
  const itemsHtml = cart.map(it=>{
    const subtotal = (it.qty * it.price).toFixed(2);
    return `<div class="card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div><strong>${escapeHtml(it.title)}</strong><div style="color:var(--muted);font-size:13px">$${it.price} × ${it.qty}</div></div>
      <div style="text-align:right">$${subtotal}</div>
    </div>`;
  }).join('');
  cartItemsEl.innerHTML = itemsHtml || '<div>No items</div>';
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0).toFixed(2);
  cartTotalEl.textContent = total;
}

// small helpers
function escapeHtml(s=''){ return s.replace && s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

function fallbackProducts(){
  return [
    {"id":"p1","title":"AirStride Runner — White/Black","category":"Shoes","price":89.99,"image":"https://via.placeholder.com/400x300?text=Shoes","sku":"ASR-WHT-9","condition":"New","createdAt":1712000000},
    {"id":"p2","title":"Axiom Chrono — Stainless","category":"Watches","price":199,"image":"https://via.placeholder.com/400x300?text=Watch","sku":"AX-CHR-SS","condition":"New","createdAt":1712300000},
    {"id":"p3","title":"Orion X Pro 6.7\"","category":"Phones","price":749,"image":"https://via.placeholder.com/400x300?text=Phone","sku":"OXPRO-256","condition":"Refurbished","createdAt":1712500000}
  ];
}