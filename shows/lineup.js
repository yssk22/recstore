function(doc, req){
   // !code vendor/couchapp/path.js
   // !code lib/helper.js
   // !code include/bindings.js
   var ddoc = this;
   var mapping  = this.mapping;
   var t = require('vendor/crayon/lib/template');
   var h = require('lib/helper');

   // rendering
   send(t.render(ddoc.templates.site.html.header, bindings));
   send(t.render(ddoc.templates.lineup.html.header, bindings));
   p("<table><thead><tr>");
   p("<th>&nbsp;</th>");
   for(var i in mapping){
      var channel = mapping[i];
      send(t.render(ddoc.templates.lineup.html.th,{
         "name" : channel[1],
         "channel" : channel[0]
      }));
   }
   p("</tr></thead><tbody id=\"lineup\"></tbody></table>");

   p("<div id=\"template\">");
   p("<textarea class='padding'>" + ddoc.templates.lineup.html.padding + "</textarea>");
   p("<textarea class='program'>" + ddoc.templates.lineup.html.program + "</textarea>");
   p("</div>");

   send(t.render(ddoc.templates.lineup.html.footer, bindings));
   send(t.render(ddoc.templates.site.html.footer, bindings));
   return "";
}
