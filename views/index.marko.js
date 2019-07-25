// Compiled using marko@4.18.10 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/index.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    Base = require("./base.marko"),
    SearchBar = require("./flights/searchBar.marko"),
    TopNav = require("./topNav.marko"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_dynamicTag = marko_helpers.d;

function render(input, out, __component, component, state) {
  var data = input;

  marko_dynamicTag(out, Base, function() {
    return {
        heading: {
            renderBody: function(out) {
              out.w("<link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.0.8/css/all.css\"><script src=\"/js/animations.js\"> </script>");
            }
          },
        content: {
            renderBody: function(out) {
              marko_dynamicTag(out, TopNav, null, null, null, null, __component, "5");

              out.w("<div id=\"index-container\"><div id=\"fade-in\" class=\"notLoaded\"><h1>Planes.com</h1><h2>All the flights on the cheapest prices!</h2></div>");

              marko_dynamicTag(out, SearchBar, null, null, null, null, __component, "10");

              out.w("</div>");
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
      "./base.marko",
      "./flights/searchBar.marko",
      "./topNav.marko"
    ]
  };
