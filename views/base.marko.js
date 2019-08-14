// Compiled using marko@4.18.11 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/samoleti$1.0.0/views/base.marko",
    components_helpers = require("marko/src/runtime/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_dynamicTag = marko_helpers.d,
    marko_loadTag = marko_helpers.t,
    component_globals_tag = marko_loadTag(require("marko/src/core-tags/components/component-globals-tag")),
    init_components_tag = marko_loadTag(require("marko/src/core-tags/components/init-components-tag")),
    await_reorderer_tag = marko_loadTag(require("marko/src/core-tags/core/await/reorderer-renderer"));

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<html><head><link href=\"//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css\" rel=\"stylesheet\" id=\"bootstrap-css\"><script src=\"//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js\"></script><script type=\"text/javascript\" src=\"https://cdn.jsdelivr.net/jquery/latest/jquery.min.js\"></script><link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.8.2/css/all.css\"><link href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css\" rel=\"stylesheet\"><link href=\"https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.8.7/css/mdb.min.css\" rel=\"stylesheet\"><link href=\"/styles/styles.css\" rel=\"stylesheet\"><script src=\"https://code.jquery.com/jquery-3.4.1.js\" integrity=\"sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU=\" crossorigin=\"anonymous\"></script>");

  marko_dynamicTag(out, input.heading, null, null, null, null, __component, "10");

  out.w("</head><body>");

  component_globals_tag({}, out);

  out.w("<main id=\"site-content\">");

  marko_dynamicTag(out, input.content, null, null, null, null, __component, "13");

  out.w("</main><footer class=\"page-footer font-small mdb-color pt-4\"><div class=\"container text-center text-md-left\"><div class=\"row text-center text-md-left mt-3 pb-3\"><div class=\"col-md-3 col-lg-3 col-xl-3 mx-auto mt-3\"><h6 class=\"text-uppercase mb-4 font-weight-bold\">Company name</h6><p>Here you can use rows and columns to organize your footer content. Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p></div><hr class=\"w-100 clearfix d-md-none\"><div class=\"col-md-3 col-lg-2 col-xl-2 mx-auto mt-3\"><h6 class=\"text-uppercase mb-4 font-weight-bold\">Useful links</h6><p><a href=\"#!\">Your Account</a></p><p><a href=\"#!\">Become an Affiliate</a></p><p><a href=\"#!\">Shipping Rates</a></p><p><a href=\"#!\">Help</a></p></div><hr class=\"w-100 clearfix d-md-none\"><div class=\"col-md-4 col-lg-3 col-xl-3 mx-auto mt-3\"><h6 class=\"text-uppercase mb-4 font-weight-bold\">Contact</h6><p><i class=\"fas fa-home mr-3\"></i> New York, NY 10012, US</p><p><i class=\"fas fa-envelope mr-3\"></i> info@gmail.com</p><p><i class=\"fas fa-phone mr-3\"></i> + 01 234 567 88</p><p><i class=\"fas fa-print mr-3\"></i> + 01 234 567 89</p></div></div><hr><div class=\"row d-flex align-items-center\"><div class=\"col-md-7 col-lg-8\"><p class=\"text-center text-md-left\">© 2018 Copyright: <a href=\"https://mdbootstrap.com/education/bootstrap/\"><strong> MDBootstrap.com</strong></a></p></div><div class=\"col-md-5 col-lg-4 ml-lg-0\"><div class=\"text-center text-md-right\"><ul class=\"list-unstyled list-inline\"><li class=\"list-inline-item\"><a class=\"btn-floating btn-sm rgba-white-slight mx-1\"><i class=\"fab fa-facebook-f\"></i></a></li><li class=\"list-inline-item\"><a class=\"btn-floating btn-sm rgba-white-slight mx-1\"><i class=\"fab fa-twitter\"></i></a></li><li class=\"list-inline-item\"><a class=\"btn-floating btn-sm rgba-white-slight mx-1\"><i class=\"fab fa-google-plus-g\"></i></a></li><li class=\"list-inline-item\"><a class=\"btn-floating btn-sm rgba-white-slight mx-1\"><i class=\"fab fa-linkedin-in\"></i></a></li></ul></div></div></div></div></footer>");

  init_components_tag({}, out);

  await_reorderer_tag({}, out, __component, "63");

  out.w("</body></html>");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    id: "/samoleti$1.0.0/views/base.marko",
    tags: [
      "marko/src/core-tags/components/component-globals-tag",
      "marko/src/core-tags/components/init-components-tag",
      "marko/src/core-tags/core/await/reorderer-renderer"
    ]
  };
