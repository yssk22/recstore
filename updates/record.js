function(doc, req){
   // !json mapping
   // !code lib/helper.js
   if( req.userCtx.roles.indexOf("_admin") == -1 ){
      throw(["error", "forbidden", "not a server admin."]);
   }

   if(doc){
      var mapping = getMappingObject(mapping);
      if( mapping[doc.station] ){
         // valid iepg data
         if( req.query.cancel == "true" ){
            doc.record = false;
            return [doc, "canceled"];
         }else{
            doc.record = true;
            return [doc, "recorded"];
         }
      }else{
         throw(["error", "forbidden", "invalid doc"]);
      }
   }else{
      throw(["error", "not_found", "cannot process recording."]);
   }
}