// Compiled using marko@4.18.10 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/users/login.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    Base = require("../base.marko"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_escapeXml = marko_helpers.x,
    marko_dynamicTag = marko_helpers.d;

function render(input, out, __component, component, state) {
  var data = input;

  marko_dynamicTag(out, Base, function() {
    return {
        heading: {
            renderBody: function(out) {
              out.w("<link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.0.8/css/all.css\">");
            }
          },
        content: {
            renderBody: function(out) {
              out.w("<div class=\"container\"><div class=\"card bg-light\"><article class=\"card-body mx-auto\" style=\"max-width: 400px;\"><h4 class=\"card-title mt-3 text-center\">Log in</h4>");

              if (data.error) {
                out.w("<p class=\"text-danger\">" +
                  marko_escapeXml(data.error) +
                  "</p>");
              }

              out.w("<form action=\"/login\" method=\"POST\"><div class=\"form-group\"><div class=\"form-group\"><div class=\"input-group-prepend\"><span class=\"input-group-text\"><i class=\"fa fa-envelope\"></i></span></div><input class=\"form-control\" placeholder=\"Email address\" type=\"email\" name=\"email\"></div><div class=\"form-group input-group\"><div class=\"input-group-prepend\"><span class=\"input-group-text\"><i class=\"fa fa-lock\"></i></span></div><input class=\"form-control\" placeholder=\"Password\" type=\"password\" name=\"password\"></div><div class=\"form-group\"><button type=\"submit\" class=\"btn btn-primary btn-block\">Log in</button></div><p class=\"text-center\">Don't have an account? <a href=\"/register\">Register</a></p></div></form></article></div></div>");
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
    id: "/samoleti$1.0.0/views/users/login.marko",
    tags: [
      "../base.marko"
    ]
  };
