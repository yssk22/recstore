function(doc, req){
   // !code lib/json.js
   // !code lib/helper.js
   // !json mapping
   // !json rec

   if(doc){
      var mapping = getMappingObject(mapping);
      var iepg = normalizeIEPG(doc, mapping);
      provides("json", function(){
         if(iepg){
            iepg._revisions = undefined;
            iepg.command = rec.command;
            iepg.outdir  = rec.outdir;
            return toJSON(iepg);
         }else{
            return {
               code: 404,
               body: "null"
            };
         }
      });
   }else{
      return {
         code: 404,
         body: "Not Found."
      };
   }
}