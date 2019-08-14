// Compiled using marko@4.18.11 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/flights/searchBar.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<script src=\"/js/datepicker.js\"> </script><script type=\"text/javascript\" src=\"https://cdn.jsdelivr.net/momentjs/latest/moment.min.js\"></script><script type=\"text/javascript\" src=\"https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js\"></script><link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css\"><form method=\"POST\" action=\"/search\" id=\"search-form\"><div class=\"row\"><div class=\"col\"><b>From:</b></div><div class=\"col\"><b>To:</b></div><div class=\"col\"><b>Departure date:</b></div><div class=\"col\"><b>Return date:</b></div><div class=\"col\"></div></div><div class=\"row\"><div class=\"col\"><input type=\"text\" class=\"form-control\" name=\"from\" placeholder=\"From\"></div><div class=\"col\"><input type=\"text\" class=\"form-control\" name=\"to\" placeholder=\"To\"></div><div class=\"col\"><input type=\"text\" class=\"form-control\" name=\"departureRange\"></div><div class=\"col\"><input type=\"text\" class=\"form-control\" name=\"returnRange\"></div><div class=\"col\"><button type=\"submit\" class=\"btn btn-primary btn-block\"> Search </button></div></div></form>");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    id: "/samoleti$1.0.0/views/flights/searchBar.marko"
  };
