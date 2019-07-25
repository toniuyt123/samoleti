$(document).ready(function () {
  $('.flight-container').on('click', function () {
    for (let i = 0; i < this.childNodes.length; i++) {
      let node = this.childNodes[i];

      if (node.className.includes('detailed-info')) {
        if (node.hasAttribute('hidden')) {
          node.removeAttribute('hidden');
        } else {
          node.setAttribute('hidden', true);
        }
      }
    }
  });
});
