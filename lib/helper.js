/**
 * convert array mapping to object
 */
function getMappingObject(mapping){
   var obj = {};
   for(var i in mapping){
      obj[mapping[i][1]] = mapping[i][0];
   }
   return obj;
}

/**
 * send with newline.
 */
function p(str){
   send(str + "\n");
}

function parse_date(str){
   var s = str.replace(/-/g, "/").replace("T", " ")
      .replace("Z", " +0000");
   return new Date(s);
}

/**
 * Normlize iEPG data.
 *   - start_date and end_date with full datetime format.
 *   - performer member converted as an array.
 */
function normalizeIEPG(iepg, mapping){
   if(iepg._normalized){
      return iepg;
   }
   // channel
   if( mapping[iepg.station] ){
      iepg.channel = mapping[iepg.station];
   }else{
      log("not an iepg data: " + iepg._id);
      return null;
   }

   // start and end
   var start = new Date(iepg.year  + "/" +
                        iepg.month + "/" +
                        iepg.date  + " " +
                        iepg.start);
   var end   = new Date(iepg.year  + "/" +
                        iepg.month + "/" +
                        iepg.date  + " " +
                        iepg.end);

   if( start > end ){
      end.setDate(end.getDate() + 1);
   }
   iepg.start_date = start;
   iepg.end_date = end;

   if(iepg.performer){
      log(iepg.performer);
      var list = iepg.performer.split("　");
      for(var i in list){
         var str = list[i];
         if( str.match(/\[(.+)\](.+)/) ){
            list[i] = {
               type : RegExp.$1,
               name : RegExp.$2
            };
         }else{
            list[i] = {
               name : str
            };
         }
      }
      iepg.performer = list;
   }
   iepg._normalized = true;
   return iepg;
}