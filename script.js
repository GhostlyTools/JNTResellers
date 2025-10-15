fetch('products.json')
  .then(res => res.json())
  .then(products => {
    const container = document.getElementById('product-container');
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
  });