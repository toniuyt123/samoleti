// Compiled using marko@4.18.10 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/errorPages/404.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    Base = require("../base.marko"),
    TopNav = require("../topNav.marko"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_escapeXml = marko_helpers.x,
    marko_dynamicTag = marko_helpers.d;

function render(input, out, __component, component, state) {
  var data = input;

  marko_dynamicTag(out, Base, function() {
    return {
        heading: {
            renderBody: function(out) {
              out.w("<title>" +
                marko_escapeXml(data.title) +
                "</title>");
            }
          },
        content: {
            renderBody: function(out) {
              marko_dynamicTag(out, TopNav, null, null, null, null, __component, "4");

              out.w("<h1>404 :(</h1>");
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
    id: "/samoleti$1.0.0/views/errorPages/404.marko",
    tags: [
      "../base.marko",
      "../topNav.marko"
    ]
  };
