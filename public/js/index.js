$(document).ready(function () {
  $('input[name="daterange-departure"], input[name="daterange-return"]').daterangepicker({
    opens: 'left',
    locale: {
      format: 'DD/MM/YYYY',
    },
  });
});
