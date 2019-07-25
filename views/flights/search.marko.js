// Compiled using marko@4.18.10 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/flights/search.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    Base = require("../base.marko"),
    SearchBar = require("./searchBar.marko"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_dynamicTag = marko_helpers.d,
    marko_forEach = marko_helpers.f,
    marko_escapeXml = marko_helpers.x;

function render(input, out, __component, component, state) {
  var data = input;

  marko_dynamicTag(out, Base, function() {
    return {
        content: {
            renderBody: function(out) {
              out.w("<div class=\"container\"><div class=\"row\"><div class=\"col\">");

              marko_dynamicTag(out, SearchBar, null, null, null, null, __component, "5");

              out.w("</div></div><div class=\"row\"><div class=\"col-lg-3 filters-container\"><p>filters</p></div><div class=\"col-lg-6 search-result-container\">");

              if (input.result.length == 0) {
                out.w("<p class=\"text-muted font-weight-bold text-center\">No flights found &#x2639;</p>");
              }

              var $for$0 = 0;

              marko_forEach(input.result, function(flight) {
                var $keyScope$0 = "[" + (($for$0++) + "]");

                out.w("<div class=\"flight-container\"><div class=\"row\"><div class=\"col\"><p><span class=\"text-primary font-weight-bold\">" +
                  marko_escapeXml(flight.from) +
                  "</span> &#x21A6; <span class=\"text-primary font-weight-bold\">" +
                  marko_escapeXml(flight.to) +
                  "</span></p></div><div class=\"col\"><p class=\"price font-weight-bold\">$" +
                  marko_escapeXml(flight.totalPrice) +
                  "</p></div></div><div class=\"row\"><div class=\"col-lg-10\"><p><span class=\"font-weight-bold\">" +
                  marko_escapeXml((flight.d_time.getHours() + ":") + flight.d_time.getMinutes()) +
                  "</span> - <span class=\"font-weight-bold\">" +
                  marko_escapeXml((flight.a_time.getHours() + ":") + flight.a_time.getMinutes()) +
                  "</span></p><p class=\"text-muted\">" +
                  marko_escapeXml(flight.d_time) +
                  "</p></div></div></div>");
              });

              out.w("</div><div class=\"col-lg-3\"><p>ad space</p></div></div></div>");
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
    id: "/samoleti$1.0.0/views/flights/search.marko",
    tags: [
      "../base.marko",
      "./searchBar.marko"
    ]
  };
