$(document).ready(function () {
  $('.flight-container').on('click', function () {
    let arrow = $(this).find('.dropdown-arrow')[0];

    for (let i = 0; i < this.childNodes.length; i++) {
      let node = this.childNodes[i];

      if (node.className.includes('detailed-info')) {
        if (node.hasAttribute('hidden')) {
          node.removeAttribute('hidden');
          arrow.innerHTML = '&#8911;';
        } else {
          node.setAttribute('hidden', true);
          arrow.innerHTML = '&#8910;';
        }
      }
    }
  });

  $('.purchase-tickets').on('click', function () {
    const ids = this.value.split('|');
    const flightProducts = [];

    for (let id of ids) {
      flightProducts.push({
        type: 'product',
        id: parseInt(id),
      });
    }

    window.open(
      `http://10.20.1.149:3000/addToBasket?items=${encodeURIComponent(JSON.stringify(flightProducts))}`);
  });
});
