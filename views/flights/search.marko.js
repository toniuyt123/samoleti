// Compiled using marko@4.18.11 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/flights/search.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    Base = require("../base.marko"),
    SearchBar = require("./searchBar.marko"),
    TopNav = require("../topNav.marko"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_dynamicTag = marko_helpers.d,
    marko_attr = marko_helpers.a,
    marko_forEach = marko_helpers.f,
    marko_escapeXml = marko_helpers.x;

function render(input, out, __component, component, state) {
  var data = input;

  marko_dynamicTag(out, Base, function() {
    return {
        heading: {
            renderBody: function(out) {
              out.w("<script src=\"/js/searchResults.js\"> </script><script src=\"https://js.stripe.com/v3/\"></script>");
            }
          },
        content: {
            renderBody: function(out) {
              marko_dynamicTag(out, TopNav, null, null, null, null, __component, "5");

              out.w("<div class=\"container\"><div class=\"row\"><div class=\"col\">");

              marko_dynamicTag(out, SearchBar, null, null, null, null, __component, "9");

              out.w("</div></div><div class=\"row\"><div class=\"col-lg-3 filters-container\"><form method=\"POST\" action=\"/search\"><h3>Filters</h3><div class=\"form-group\"><label for=\"sortBy\">Sort by</label><select class=\"form-control\" id=\"sortBy\" name=\"sortBy\"><option value=\"{&quot;field&quot;:&quot;totalPrice&quot;,&quot;desc&quot;:false}\">Price ascending</option><option value=\"{&quot;field&quot;:&quot;totalPrice&quot;,&quot;desc&quot;:true}\">Price descending</option><option value=\"{&quot;field&quot;:&quot;route&quot;,&quot;desc&quot;:false}\">Stopovers ascending</option><option value=\"{&quot;field&quot;:&quot;route&quot;,&quot;desc&quot;:true}\">Stopovers descending</option></select></div><hr><label>Price range</label><div class=\"input-group\"><div class=\"input-group-prepend\"><div class=\"input-group-text\">$</div></div><input type=\"number\" class=\"form-control\" name=\"minPrice\"" +
                marko_attr("value", "" + input.filters.minPrice) +
                "></div><div class=\"input-group\"><div class=\"input-group-prepend\"><div class=\"input-group-text\">$</div></div><input type=\"number\" class=\"form-control\" name=\"maxPrice\"" +
                marko_attr("value", "" + input.filters.maxPrice) +
                "></div><hr><label>Max stopovers</label><div class=\"input-group\"><input type=\"number\" class=\"form-control\" name=\"maxStopovers\"" +
                marko_attr("value", "" + input.filters.maxStopovers) +
                "></div><hr><button class=\"btn btn-primary w-100\" type=\"submit\">Filter</button></form></div><div class=\"col-lg-6 search-result-container\">");

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
                  "</p></div></div><div class=\"row\"><div class=\"col-8\"><p><span class=\"font-weight-bold\">" +
                  marko_escapeXml(flight.dTime.toTimeString().split(" ")[0].substring(0, 5)) +
                  "</span> - <span class=\"font-weight-bold\">" +
                  marko_escapeXml(flight.aTime.toTimeString().split(" ")[0].substring(0, 5)) +
                  "</span></p><p class=\"text-muted\">Depart: " +
                  marko_escapeXml(flight.dTime.toLocaleString()) +
                  "<br>Arrive: " +
                  marko_escapeXml(flight.aTime.toLocaleString()) +
                  "</p></div><div class=\"col-4 float-right\"><p class=\"dropdown-arrow float-right\">&#8910;</p><br><button" +
                  marko_attr("value", "" + flight.id) +
                  " class=\"btn btn-primary btn-sm purchase-tickets\">Purchase</button></div></div><div class=\"row detailed-info\" hidden>");

                var $for$1 = 0;

                marko_forEach(flight.route, function(stop) {
                  var $keyScope$1 = "[" + ((($for$1++) + $keyScope$0) + "]");

                  out.w("<div class=\"row\"><div class=\"col\"><p><b>" +
                    marko_escapeXml(stop.from) +
                    "</b> &#x21A6; <b>" +
                    marko_escapeXml(stop.to) +
                    "</b><img" +
                    marko_attr("src", "https://localhost:3000/airlinelogo/" + stop.airlineId) +
                    "></p><p>" +
                    marko_escapeXml(stop.dTime.toLocaleString()) +
                    " - " +
                    marko_escapeXml(stop.aTime.toLocaleString()) +
                    "</p></div></div>");
                });

                out.w("<div class=\"row\"><div class=\"col\"><img" +
                  marko_attr("src", ("/img/climateIcons/" + flight.dWeather.icon) + ".svg") +
                  " onerror=\"this.onerror=null; this.src='/img/climateIcons/clear-day.svg'\"><p>" +
                  marko_escapeXml(flight.from) +
                  ": " +
                  marko_escapeXml(flight.dWeather.summary) +
                  " " +
                  marko_escapeXml(flight.dWeather.temperature) +
                  "&#8457;</p></div><div class=\"col\"><img" +
                  marko_attr("src", ("/img/climateIcons/" + flight.aWeather.icon) + ".svg") +
                  " onerror=\"this.onerror=null; this.src='/img/climateIcons/clear-day.svg'\"><p>" +
                  marko_escapeXml(flight.to) +
                  ": " +
                  marko_escapeXml(flight.aWeather.summary) +
                  " " +
                  marko_escapeXml(flight.aWeather.temperature) +
                  "&#8457;</p></div></div></div></div>");
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
      "./searchBar.marko",
      "../topNav.marko"
    ]
  };
