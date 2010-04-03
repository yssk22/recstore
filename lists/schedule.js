function(head, req){
   // !code vendor/couchapp/path.js
   // !code lib/helper.js
   // !code lib/schedule.js
   // !code include/bindings.js

   // parameter parsing
   if( toJSON(req.query) == "{}"){
      return start(redirectDefault());
   }

   var c = require('vendor/crayon/lib/crayon');
   var e = require('vendor/crayon/lib/escape');
   var t = require('vendor/crayon/lib/template');
   var f = require('vendor/crayon/lib/text');
   var h = require('lib/helper');
   var mapping  = this.mapping;
   var ddoc = this;
   var row = null;

   provides("html", function(){
      send(t.render(ddoc.templates.site.html.header, bindings));
      send(t.render(ddoc.templates.schedule.html.header, bindings));
      while(row = getRow()){
         var d = c.extend(row.value, bindings, {
            cycle: f.cycle('even', 'odd')
         });
         if( d.memo ){
            d.memo = e.h(d.memo).replace("\r\n", "<br/>");
         }
         d.start_date = parse_date(d.start_date);
         d.end_date = parse_date(d.end_date);

         send(t.render(ddoc.templates.schedule.html.row,d));
      }
      send(t.render(ddoc.templates.schedule.html.footer, bindings));
      send(t.render(ddoc.templates.site.html.footer, bindings));
      return "";
   });

   provides('text', function(){
      function f(n){
         return n < 10 ? "0" + n : n;
      }
      send("#<recstore>\n");
      while(row = getRow()){
         var iepg = row.value;
         var start = parse_date(iepg.start_date);
         var end   = parse_date(iepg.end_date);
         var secs  = end - start;
         start.setMinutes(start.getMinutes() - 1);
         var entry = [
            f(start.getMinutes()),
            f(start.getHours()),
            f(start.getDate()),
            f(start.getMonth() + 1),
            "*",
            "/usr/bin/curl -X GET ${COUCH_URL}" + assetPath() + "/scripts/recorder.py" +
               " | /usr/bin/python2.6 - -d ${COUCH_URL}" + assetPath() + "/_show/detail/" + row.id + "?format=json" +
               " 2>&1 > ${LOG_DIR}/recstore_recorder-" + iepg["program-title"] + ".log"
         ];
         send("# " + iepg["program-title"] + "\n");
         send(entry.join(" "));
         send("\n");
      }
      send("#</recstore>\n");

   });
}