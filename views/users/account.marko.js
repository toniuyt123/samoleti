// Compiled using marko@4.18.10 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/users/account.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    Base = require("../base.marko"),
    TopNav = require("../topNav.marko"),
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_dynamicTag = marko_helpers.d,
    marko_escapeXml = marko_helpers.x,
    marko_forEach = marko_helpers.f,
    marko_attr = marko_helpers.a;

function render(input, out, __component, component, state) {
  var data = input;

  marko_dynamicTag(out, Base, function() {
    return {
        content: {
            renderBody: function(out) {
              marko_dynamicTag(out, TopNav, null, null, null, null, __component, "2");

              out.w("<h1>Username: " +
                marko_escapeXml(data.user.username) +
                "</h1><a class=\"btn btn-secondary\" href=\"/logout\">Log Out</a><div class=\"container\">");

              if (data.err) {
                out.w("<p class=\"text-danger\">" +
                  marko_escapeXml(data.err) +
                  "</p>");
              }

              out.w("<div class=\"row\">");

              var $for$0 = 0;

              marko_forEach(input.plans, function(plan) {
                out.w(" ");

                var $keyScope$0 = "[" + (($for$0++) + "]");

                out.w("<form action=\"/subscribe\" class=\"col plan-container\" method=\"POST\"><input type=\"hidden\"" +
                  marko_attr("value", "" + plan.id) +
                  " name=\"planId\"><button class=\"no-style-button\" type=\"submit\"><h2 class=\"text-center\">" +
                  marko_escapeXml(plan.name) +
                  "</h2><div class=\"row\"><div class=\"col\"><p class=\"price\">$" +
                  marko_escapeXml(plan.price_monthly) +
                  " a Month</p></div><div class=\"col\"><p class=\"price\">$" +
                  marko_escapeXml(plan.price_yearly) +
                  " a Year</p></div></div></button> </form>");
              });

              out.w("</div></div>");
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
    id: "/samoleti$1.0.0/views/users/account.marko",
    tags: [
      "../base.marko",
      "../topNav.marko"
    ]
  };
