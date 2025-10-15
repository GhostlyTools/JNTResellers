const container = document.getElementById('product-container');
const orderDetails = document.getElementById('orderDetails');
const form = document.getElementById('orderForm');

const CASHAPP_LINK = "https://cash.app/$Lilkid121";

// Embedded products array (no fetch needed)
const products = [
  {"category":"Watches","name":"G Shock WR20BAR","link":"https://m.dhgate.com/product/new-fashion-mens-watches-g-analog-digital/598642391.html","image":"https://upload.wikimedia.org/wikipedia/commons/3/39/G-Shock_Classic.jpg"},
  {"category":"Watches","name":"Richard Mille","link":"https://sale.dhgate.com/L3uPfI80","image":"https://upload.wikimedia.org/wikipedia/commons/5/57/Richard_Mille_RM011.jpg"},
  {"category":"Watches","name":"Iced Out Richard Mille","link":"https://sale.dhgate.com/JDMIty52","image":"https://upload.wikimedia.org/wikipedia/commons/1/1f/Richard_Mille_Iced.jpg"},
  {"category":"Watches","name":"Rolex Submariner Hulk","link":"https://m.dhgate.com/product/watch-men-s-watch-mechanical-ceramic-watch/972471996.html","image":"https://upload.wikimedia.org/wikipedia/commons/5/5e/Rolex_Submariner_116610LV.jpg"},
  {"category":"Watches","name":"Rolex Datejust 41","link":"https://sale.dhgate.com/9HPVMD11","image":"https://upload.wikimedia.org/wikipedia/commons/f/fd/Rolex_Datejust_41.jpg"},
  {"category":"Phones","name":"iPhone 16 Pro Max","link":"https://m.dhgate.com/product/s10-s9-tablet-pc-ultra-tablet-lightweight/1047860153.html","image":"https://upload.wikimedia.org/wikipedia/commons/3/3e/IPhone_14_Pro_Max.png"},
  {"category":"Phones","name":"Galaxy S25 Ultra","link":"https://m.dhgate.com/product/6-8-inchs-5g-s23-ultra-cell-phones-unlock/888186188.html","image":"https://upload.wikimedia.org/wikipedia/commons/e/e1/Samsung_Galaxy_S23_Ultra.jpg"},
  {"category":"Tablets","name":"Apple iPad Pro M4","link":"https://sale.dhgate.com/gqfDan35","image":"https://upload.wikimedia.org/wikipedia/commons/5/5e/IPad_Pro_M1.jpg"},
  {"category":"Tablets","name":"Samsung Galaxy Tab S10+ / S9","link":"https://www.dhgate.com/product/s10-s9-tablet-pc-ultra-tablet-lightweight/1047860153.html","image":"https://upload.wikimedia.org/wikipedia/commons/3/3c/Samsung_Galaxy_Tab_S7.jpg"},
  {"category":"Headphones","name":"Sony WH-1000XM5","link":"https://sale.dhgate.com/aINV5q35","image":"https://upload.wikimedia.org/wikipedia/commons/2/25/Sony_WH1000XM4.jpg"},
  {"category":"Headphones","name":"AirPods Pro Max","link":"https://sale.dhgate.com/KL78bT33","image":"https://upload.wikimedia.org/wikipedia/commons/2/2f/AirPods_Max_Silver.jpg"},
  {"category":"Headphones","name":"Beats Studio Pro","link":"https://m.dhgate.com/product/headphones-3-bluetooth-headphones-wireless/1047461005.html","image":"https://upload.wikimedia.org/wikipedia/commons/8/8d/Beats_Studio3.jpg"},
  {"category":"Shoes","name":"Nike Shoes","link":"https://sale.dhgate.com/FsdBna70","image":"https://upload.wikimedia.org/wikipedia/commons/8/82/Nike_Air_Max_90.jpg","quote":"Custom Quote"},
  {"category":"Cologne","name":"Cologne","link":"https://sale.dhgate.com/AaKE0x18","image":"https://upload.wikimedia.org/wikipedia/commons/f/fb/Perfume_Bottle.jpg"}
];

// Render products
const categories = [...new Set(products.map(p => p.category))];
categories.forEach(cat => {
  const section = document.createElement('section');
  section.className = 'product-section';
  section.innerHTML = `<h2>${cat}</h2><div class="product-grid"></div>`;
  container.appendChild(section);

  const grid = section.querySelector('.product-grid');
  products.filter(p => p.category === cat).forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      ${p.quote ? `<div class="price">${p.quote}</div>` : ''}
      <label><input type="checkbox" class="product-checkbox" value="${p.name}"> Add to Order</label>
    `;
    grid.appendChild(div);
  });
});

// Handle checkbox selections
const checkboxes = document.querySelectorAll('.product-checkbox');
checkboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    const selected = Array.from(checkboxes)
                          .filter(c => c.checked)
                          .map(c => c.value);
    orderDetails.value = selected.join('\n');
  });
});

// Order form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const productsText = orderDetails.value.trim();

  if (!productsText) { alert("Please select at least one product."); return; }

  const mailtoBody = `Name: ${name}%0AEmail: ${email}%0AProducts:%0A${encodeURIComponent(productsText)}%0A%0APlease pay via Cash App at ${CASHAPP_LINK}`;
  const mailto = `mailto:jnrrellercheckout@gmail.com?subject=New Order from ${encodeURIComponent(name)}&body=${mailtoBody}`;

  window.location.href = mailto;
  window.open(CASHAPP_LINK, '_blank');
});