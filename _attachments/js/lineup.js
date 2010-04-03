var lineup = {
   mapping : {},
   t_padding : $("#template textarea.padding").val(),
   t_program : $("#template textarea.program").val(),
   app : null
};

$.couch.app(function(app){
   lineup.app = app;
   // initialize
   $("th.mapping").each(function(){
      var channel = $(".channel", this).text();
      var name = $(".name", this).text();
      lineup.mapping[name] = channel;
   });

   $("#date").datepicker({
      dateFormat: 'yy/mm/dd'
   });
   $("#date").change(function(e){
      window.location.hash = $("#date").val();
      loadLineup(app);
   });

   $("div.lineup form a").click(function(){
      var d = new Date($(this).attr("href").substr(1));
      $("#date").val($.datepicker.formatDate("yy/mm/dd", d));
      loadLineup(app);
   });

   var d = new Date(window.location.hash.substr(1));
   if(isNaN(d.getFullYear())){
      window.location.hash = '';
      d = new Date();
   }
   $("#date").val($.datepicker.formatDate("yy/mm/dd", d));
   loadLineup(app);

});

function setLinks(){
   var d = new Date($("#date").val());
   d.setDate(d.getDate() + 1);
   $("div.lineup form a.next").attr("href",
                                    "#" + $.datepicker.formatDate("yy/mm/dd", d));
   d.setDate(d.getDate() - 2);
   $("div.lineup form a.prev").attr("href",
                                    "#" + $.datepicker.formatDate("yy/mm/dd", d));
}

function record(id){
   var path = ["",lineup.app.db.name, lineup.app.design.doc_id,
               "_update/record", id].join("/");
   $.ajax({
      url: path,
      type: "POST",
      success: function(d, t){
         $("#iepg_" + id).addClass("record");
      }
   });
}

function cancel_record(id){
   var path = ["",lineup.app.db.name, lineup.app.design.doc_id,
               "_update/record", id].join("/");
   $.ajax({
      url: path + "?cancel=true",
      type: "POST",
      success: function(d, t){
         $("#iepg_" + id).removeClass("record");
      }
   });
}

function parse_date(str){
   var s = str.replace(/-/g, "/").
      replace("T", " ").replace("Z", " +0000");
   return new Date(s);
}


function loadLineup(app){
   var d = new Date($("#date").val());
   var skey = [d.getFullYear(), d.getMonth() + 1, d.getDate(),
               4,0];
   d.setDate(d.getDate() + 1);
   var ekey = [d.getFullYear(), d.getMonth() + 1, d.getDate(),
               3,59];
   app.view("iepg_by_date", {
      startkey: skey,
      endkey: ekey,
      success : function(resp){
         if( resp.rows.length == 0){
            alert("No channels found");
         }
         setLinks();
         renderLineup(resp.rows);
      }
   });
}

function renderLineup(rows){
   var mapping = lineup.mapping;
   var t_program = lineup.t_program;
   var t_padding = lineup.t_padding;
   var channels = [];
   var lineups = {};
   var currentRIndex = {};
   var start = new Date(3000, 1, 1);
   var end   = new Date(1970, 1, 1);

   for(var k in mapping){
      lineups[mapping[k]]       = [];
      currentRIndex[mapping[k]] = 0;
   }

   // building table data
   for(var i in rows){
      var row = rows[i];
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


   // rendering table rows
   var html = "";
   function p(s){
      html += s;
   }
   function t(template, view){
      html += $.mustache(template, view);
   }

   var totalRows = (end - start) / 60000;
   var rIndex = 0;
   var rStartTime = start;
   var rowspan;

   while(rIndex < totalRows){
      p("<tr>");
      // row header
      if( rIndex == 0 ){
         rowspan = 60 - rStartTime.getMinutes();
         p("<td class=\"ui-state-default hrow\" rowspan=\"" + rowspan + "\">" + rStartTime.getHours() + "</td>");
      }else if( rStartTime.getMinutes() == 0 ){
         if( rStartTime.getDate() == end.getDate() &&
             rStartTime.getHours() == end.getHours() ){
            // remains
            rowspan = end.getMinutes() - rStartTime.getMinutes();
         }else{
            rowspan = 60;
         }
         p("<td class=\"ui-state-default hrow\" rowspan=\"" + rowspan + "\">" + rStartTime.getHours() + "</td>");
      }

      // channels to write
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
                  t(t_padding, {rowspan : rowspan});
               }else{
                  // insert program
                  rowspan = (program.end_date - program.start_date) / 60000;
                  t(t_program, {
                     id: program._id,
                     title: program["program-title"],
                     link: program.url,
                     rowspan : rowspan,
                     start: program.start,
                     end: program.end,
                     status: program.record ? "record" : ""
                  });
                  // pop program from lineup stack
                  lineups[ch].shift();
               }
            }else{
               // padding last
               rowspan = (end - rStartTime) / 60000;
               t(t_padding, {rowspan : rowspan});
            }
            currentRIndex[ch] = chIndex + rowspan;
         }
      }
      p("</tr>");
      rIndex = rIndex + 1;
      rStartTime.setMinutes(rStartTime.getMinutes() + 1);
   }
   $("tbody#lineup").html(html);
}
