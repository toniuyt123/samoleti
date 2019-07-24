$(document).ready(function () {
  $('input[name="departureRange"], input[name="returnRange"]').daterangepicker({
    opens: 'left',
    locale: {
      format: 'DD/MM/YYYY',
    },
  });
});
