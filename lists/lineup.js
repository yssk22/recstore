function(head, req){
   // !code vendor/couchapp/path.js
   // !code lib/helper.js
   // !code include/bindings.js

   var t = require('vendor/crayon/lib/template');
   var h = require('lib/helper');
   var mapping  = this.mapping;
   var ddoc = this;
   var row = null;

   provides("html", function(){
      send(t.render(ddoc.templates.site.html.header, bindings));
      send(t.render(ddoc.templates.lineup.html.header, bindings));
      var channels = [];
      var lineups = {};
      var currentRIndex = {};

      p("<table><thead><tr>");
      p("<th>&nbsp;</th>");
      for(var k in mapping){
         send(t.render(ddoc.templates.lineup.html.th,{
            "name" : k,
            "channel" : mapping[k]
         }));
         lineups[mapping[k]]       = [];
         currentRIndex[mapping[k]] = 0;
      }
      p("</tr></thead><tbody>");


      // table data building
      var row;
      var start = new Date(3000, 1, 1);
      var end   = new Date(1970, 1, 1);
      while(row = getRow()){
         var iepg = row.value;
         log(iepg.start_date);
         log(iepg.end_date);
         iepg.start_date = parse_date(iepg.start_date);
         iepg.end_date = parse_date(iepg.end_date);
         lineups[iepg.channel].push(iepg);
         if( iepg.start_date < start ){
            start = iepg.start_date;
         }
         if( iepg.end_date > end ){
            end = iepg.end_date;
         }
      }

      // rendering rows wich each minute
      var totalRows = (end - start) / 60000;
      var rIndex = 0;
      var rStartTime = start;
      var rowspan;

      while(rIndex < totalRows){
         p("<tr>");
         // row header
         if( rIndex == 0 ){
            rowspan = 60 - rStartTime.getMinutes();
            p("<td class=\"hrow\" rowspan=\"" + rowspan + "\">" + rStartTime.getHours() + "</td>");
         }else if( rStartTime.getMinutes() == 0 ){
            if( rStartTime.getDate() == end.getDate() &&
                rStartTime.getHours() == end.getHours() ){
               // remains
               rowspan = end.getMinutes() - rStartTime.getMinutes();
            }else{
               rowspan = 60;
            }
            p("<td class=\"hrow\" rowspan=\"" + rowspan + "\">" + rStartTime.getHours() + "</td>");
         }


         // writing each channel rows
         for(k in mapping){
            var ch = mapping[k];
            var list = lineups[ch];
            var program = list[0];
            var chIndex = currentRIndex[ch];
            if( chIndex == rIndex ){
               // rendering td tag with rowspan.
               if( program ){
                  if( rStartTime < program.start_date ){
                     // padding
                     rowspan = (program.start_date - rStartTime) / 60000;
                     send(t.render(ddoc.templates.lineup.html.padding, {
                        rowspan : rowspan
                     }));
                  }else{
                     // insert program
                     rowspan = (program.end_date - program.start_date) / 60000;
                     send(t.render(ddoc.templates.lineup.html.program, {
                        id: program._id,
                        title: program["program-title"],
                        link: program.url,
                        rowspan : rowspan,
                        start: program.start,
                        end: program.end
                     }));
                     // pop program from lineup stack
                     lineups[ch].shift();
                  }
               }else{
                  // padding last
                  rowspan = (end - rStartTime) / 60000;
                  send(t.render(ddoc.templates.lineup.html.padding, {
                     rowspan : rowspan
                  }));
               }
               currentRIndex[ch] = chIndex + rowspan;
            }
         }
         p("</tr>");
         rIndex = rIndex + 1;
         rStartTime.setMinutes(rStartTime.getMinutes() + 1);
      }


      p("</tbody></table>");
      send(t.render(ddoc.templates.lineup.html.footer, bindings));
      send(t.render(ddoc.templates.site.html.footer, bindings));
   });
}