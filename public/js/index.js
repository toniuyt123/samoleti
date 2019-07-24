$(document).ready(function () {
  document.getElementById('fade-in').classList.remove('notLoaded');

  $('input[name="departureRange"], input[name="returnRange"]').daterangepicker({
    opens: 'left',
    locale: {
      format: 'DD/MM/YYYY',
    },
  });
});
