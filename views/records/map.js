function(doc){
   // !code lib/json.js
   // !code lib/helper.js
   // !json mapping
   var mapping = getMappingObject(mapping);
   var iepg = normalizeIEPG(doc, mapping);
   if(iepg && iepg.record){
      emit([
         iepg.start_date.getFullYear(),
         iepg.start_date.getMonth() + 1,
         iepg.start_date.getDate(),
         iepg.start_date.getHours(),
         iepg.start_date.getMinutes(),
         iepg.channel
      ], iepg);
   }
}