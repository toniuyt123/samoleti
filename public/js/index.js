$(document).ready(function () {
  document.getElementById('fade-in').classList.remove('notLoaded');

  $('input[name="daterange-departure"], input[name="daterange-return"]').daterangepicker({
    opens: 'left',
    locale: {
      format: 'DD/MM/YYYY',
    },
  });
});
