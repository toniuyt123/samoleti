// Compiled using marko@4.18.10 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/users/register.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<link href=\"//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css\" rel=\"stylesheet\" id=\"bootstrap-css\"><script src=\"//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js\"></script><script src=\"//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js\"></script><link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.0.8/css/all.css\"><div class=\"container\"><div class=\"card bg-light\"><article class=\"card-body mx-auto\" style=\"max-width: 400px;\"><h4 class=\"card-title mt-3 text-center\">Create Account</h4><p class=\"text-center\">Get started with your free account</p><form action=\"/register\" method=\"POST\"><div class=\"form-group input-group\"><div class=\"input-group-prepend\"><span class=\"input-group-text\"> <i class=\"fa fa-user\"></i> </span></div><input class=\"form-control\" placeholder=\"Username\" type=\"text\" name=\"username\"></div> <div class=\"form-group input-group\"><div class=\"input-group-prepend\"><span class=\"input-group-text\"> <i class=\"fa fa-envelope\"></i> </span></div><input class=\"form-control\" placeholder=\"Email address\" type=\"email\" name=\"email\"></div> <div class=\"form-group input-group\"><div class=\"input-group-prepend\"><span class=\"input-group-text\"> <i class=\"fa fa-phone\"></i> </span></div><input class=\"form-control\" placeholder=\"Phone number\" type=\"text\" name=\"phone\"></div> <div class=\"form-group input-group\"><div class=\"input-group-prepend\"><span class=\"input-group-text\"> <i class=\"fa fa-lock\"></i> </span></div><input class=\"form-control\" placeholder=\"Create password\" type=\"password\" name=\"password\"></div> <div class=\"form-group input-group\"><div class=\"input-group-prepend\"><span class=\"input-group-text\"> <i class=\"fa fa-lock\"></i> </span></div><input class=\"form-control\" placeholder=\"Repeat password\" type=\"password\" name=\"confirmPassword\"></div> <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-primary btn-block\"> Create Account </button></div> <p class=\"text-center\">Have an account? <a href=\"\">Log In</a> </p> </form></article></div> </div> ");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    id: "/samoleti$1.0.0/views/users/register.marko"
  };
