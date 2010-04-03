var userCtx = {name: null, roles: []};
function isAdmin(){
   return userCtx.roles.indexOf("_admin") != -1;
}

function log(msg){
   if(console && console.log){
      console.log(msg);
   }
}

function doLogin(){
   var name = $("#login input[name='name']").val();
   var password = $("#login input[name='password']").val();
   $.couch.login({
      name : name,
      password : password,
      success : function() {
         updateUserCtx();
         $("#login").dialog("close");
         $("#login p.error").hide();
         $("#login p.help").show();
      },
      error : function(code, error, reason) {
         updateUserCtx();
         $("#login p.help").hide();
         $("#login p.error").show();
      }
   });
};

function logout() {
   $.couch.logout({
      success : function(resp) {
         updateUserCtx();
      }
   });
};

function updateUserCtx() {
   $("#userCtx span").hide();
   $.couch.session({
      success : function(r) {
         userCtx = r.userCtx;
         if (userCtx.name) {
            $("#userCtx .name").text(userCtx.name).attr({href : "/_utils/document.html?"+encodeURIComponent(r.info.authentication_db)+"/org.couchdb.user%3A"+encodeURIComponent(userCtx.name)});
            if (userCtx.roles.indexOf("_admin") != -1) {
               $("#userCtx .loggedinadmin").show();
               $("#main").addClass("admin");
               $("#main").removeClass("guest");
            } else {
               $("#userCtx .loggedin").show();
               $("#main").removeClass("admin");
               $("#main").addClass("guest");
            }
         } else if (userCtx.roles.indexOf("_admin") != -1) {
            $("#userCtx .adminparty").show();
            $("#main").addClass("admin");
            $("#main").removeClass("guest");
         } else {
            $("#userCtx .loggedout").show();
            $("#main").removeClass("admin");
            $("#main").removeClass("admin");
            $("#main").addClass("guest");
         };
      }
   });
};

$.couch.app(function(app){
   updateUserCtx();
   $("#login").submit(function(e){
      doLogin();
      return false;
   });

   var login = $("#login").dialog({ autoOpen: false,
                                    modal: true,
                                    resizable: false,
                                    title: "Login",
                                    buttons: { "Submit": function(){
                                       $("#login").submit();
                                    }},
                                    width: 350
                                  });

   $("#userCtx .login").click(function(){
      login.dialog("open");
      return false;
   });

   $("#userCtx .logout").click(logout);
});
