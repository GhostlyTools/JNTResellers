const container = document.getElementById('product-container');
const orderDetails = document.getElementById('orderDetails');
const form = document.getElementById('orderForm');

const CASHAPP_LINK = "https://cash.app/$Lilkid121";

fetch('products.json')
  .then(res => res.json())
  .then(products => {
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

    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const selected = Array.from(checkboxes)
                              .filter(c => c.checked)
                              .map(c => c.value);
        orderDetails.value = selected.join('\n');
      });
    });
  });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const products = orderDetails.value.trim();

  if (!products) { alert("Please select at least one product."); return; }

  const mailtoBody = `Name: ${name}%0AEmail: ${email}%0AProducts:%0A${encodeURIComponent(products)}%0A%0APlease pay via Cash App at ${CASHAPP_LINK}`;
  const mailto = `mailto:jnrrellercheckout@gmail.com?subject=New Order from ${encodeURIComponent(name)}&body=${mailtoBody}`;

  window.location.href = mailto;
  window.open(CASHAPP_LINK, '_blank');
});