// Compiled using marko@4.18.10 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/index.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    Base = require("./base.marko"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_dynamicTag = marko_helpers.d;

function render(input, out, __component, component, state) {
  var data = input;

  marko_dynamicTag(out, Base, function() {
    return {
        heading: {
            renderBody: function(out) {
              out.w("<link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.0.8/css/all.css\"><script src=\"/js/index.js\"> </script><script type=\"text/javascript\" src=\"https://cdn.jsdelivr.net/jquery/latest/jquery.min.js\"></script><script type=\"text/javascript\" src=\"https://cdn.jsdelivr.net/momentjs/latest/moment.min.js\"></script><script type=\"text/javascript\" src=\"https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js\"></script><link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css\">");
            }
          },
        content: {
            renderBody: function(out) {
              out.w("<div id=\"index-container\"><div id=\"fade-in\" class=\"notLoaded\"><h1>Planes.com</h1><h2>Find all the flights on the cheapest prices</h2></div><form method=\"POST\" action=\"/explore\" id=\"explore-form\"><div class=\"row\"><div class=\"col\"><b>From:</b></div><div class=\"col\"><b>To:</b></div><div class=\"col\"><b>Departure date:</b></div><div class=\"col\"><b>Return date:</b></div><div class=\"col\"></div></div><div class=\"row\"><div class=\"col\"><input type=\"text\" class=\"form-control\" placeholder=\"From\"></div><div class=\"col\"><input type=\"text\" class=\"form-control\" placeholder=\"To\"></div><div class=\"col\"><input type=\"text\" class=\"form-control\" name=\"daterange-departure\"></div><div class=\"col\"><input type=\"text\" class=\"form-control\" name=\"daterange-return\"></div><div class=\"col\"><button type=\"submit\" class=\"btn btn-primary btn-block\"> Search </button></div></div></form></div>");
            }
          }
      };
  }, null, null, null, __component, "0");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    id: "/samoleti$1.0.0/views/index.marko",
    tags: [
      "./base.marko"
    ]
  };
