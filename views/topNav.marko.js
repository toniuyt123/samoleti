// Compiled using marko@4.18.11 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/topNav.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<div class=\"container top-nav\"><div class=\"row w-100\"><div class=\"col-10\"><h2><a href=\"/\" class=\"no-decoration\">Planes</a></h2></div><div class=\"col-2 float-right\"><a href=\"/account\" id=\"my-profile\"><img id=\"icon\" src=\"/img/profile_icon.png\"><span>My profile</span></a></div></div></div>");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    id: "/samoleti$1.0.0/views/topNav.marko"
  };
