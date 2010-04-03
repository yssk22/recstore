function(head, req){
   // !code vendor/couchapp/path.js
   // !code vendor/crayon/lib/template.js
   // !code lib/helper.js
   // !code lib/lineup.js
   //
   // !code include/bindings.js

   // !json templates.site.html
   // !json templates.lineup.html
   // !json mapping

   // parameter parsing
   if( req.query.startkey == undefined ||
       req.query.endkey   == undefined ){
      return start(redirectToday());
   }


   provides("html", function(){
      send(render(templates.site.html.header, bindings));
         /*
      send(render(templates.lineup.html.header, bindings));
      var channels = [];
      var lineups = {};
      var currentRIndex = {};

      p("<table><thead><tr>");
      p("<th>&nbsp;</th>");
      for(var k in mapping){
         send(render(templates.lineup.html.th,{
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
                     send(render(templates.lineup.html.padding, {
                        rowspan : rowspan
                     }));
                  }else{
                     // insert program
                     rowspan = (program.end_date - program.start_date) / 60000;
                     send(render(templates.lineup.html.program, {
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
                  send(render(templates.lineup.html.padding, {
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
      send(render(templates.lineup.html.footer, bindings));
      send(render(templates.site.html.footer, bindings));
      return;
*/
   });
}