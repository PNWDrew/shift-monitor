var m_height = 0;
var t_height = 0;

var m_nextturn = 0;
var t_nextturn = 0;

var g_setup = "";
var g_loader = 0;

var m_forging = false;
var t_forging = false;

var without_testnet = true; 

$(document).ready(function() {      
    initialize();
});    

function initialize() {
    $.getJSON("config.json", function(json){
        g_setup = json;

        $("#loadingData").text("Loading config..");
        var i=1;
        for (var ss in g_setup.servers) {
            var url = g_setup.servers[ss].http +'://'+ g_setup.servers[ss].ip +':'+ g_setup.servers[ss].port;
            if(!g_setup.servers[ss].testnet) {
                var table_row="<tr>"+
                                "<td id='server"+i+"'><a href='" + url + "'>"+ g_setup.servers[ss].name +"</a></td>"+
                                "<td id='server"+i+"_height'>undefined</td>"+
                                "<td id='server"+i+"_consensus'>undefined</td>"+
                                "<td id='server"+i+"_forging'>undefined</td>"+
                               "</tr>";
                $("#nodeTable").append(table_row); 
            }else {
                var table_row="<tr>"+
                                "<td id='server"+i+"'><a href='" + url + "'>"+ g_setup.servers[ss].name +"</a></td>"+
                                "<td id='server"+i+"_height'>undefined</td>"+
                                "<td id='server"+i+"_consensus'>undefined</td>"+
                                "<td id='server"+i+"_forging'>undefined</td>"+
                               "</tr>";
                $("#nodeTableT").append(table_row);
                without_testnet = false;
            }
            i++;
        }
        if(without_testnet){
            $("#Testnet").addClass("disabled");
            $("#Mainnet").addClass("alone");
        }
        $("#loadingData").text("Table loaded..");
        get_data_from_json()
        setInterval(get_data_from_json, 27000);
    });
}

function get_data_from_json(){

    $.getJSON("data.json", function(json) {

        var j_data = json;

        get_server_data(); 

        var i=1;
        for (var ss in j_data.servers) {
            if(j_data.servers[ss].testnet) {
                if(t_height < j_data.servers[ss].height) {
                    t_height = j_data.servers[ss].height;
                }
            } else {
                if(m_height < j_data.servers[ss].height){
                    m_height = j_data.servers[ss].height;
                }                
            }
        }
        i++;      

        if(typeof j_data.testnet != "undefined") {

            t_nextturn = j_data.testnet.nextturn;
            t_forged_block = j_data.testnet.forged_block;

            last_block(t_height,t_forged_block,'t');
            get_nextturn_time(t_nextturn,'t');
            get_delegate_data('testnet');
        }
        if(typeof j_data.mainnet != "undefined") {    

            m_nextturn = j_data.mainnet.nextturn;
            m_forged_block = j_data.mainnet.forged_block;

            last_block(m_height,m_forged_block,'m');
            get_nextturn_time(m_nextturn,'m');
            get_delegate_data('mainnet');            
        }   

        are_you_forging();

        m_forging = false;
        t_forging = false;

        if(g_loader == 0) display_data();

        function get_delegate_data(net){

                $("#" + net + "_rank").text(j_data[net].rank);
                $("#" + net + "_username").text(j_data[net].username);
                $("#" + net + "_approval").text(j_data[net].approval);
                $("#" + net + "_productivity").text(j_data[net].productivity);
                $("#" + net + "_producedBlocks").text(j_data[net].producedblocks);
                $("#" + net + "_missedBlocks").text(j_data[net].missedblocks);
        }

        function last_block(height,my_forged_block,net){ 
                if(my_forged_block !== null) {
                    time = ((height - my_forged_block) * 27);
                    minutes = Math.floor(time / 60);
                    seconds = Math.round(time - (minutes * 60));
                    hours = Math.floor(minutes / 60);

                    var my_lastBlock_time="";

                    if(time < 0){
                        my_lastBlock_time = "0 sec";
                    } else{ my_lastBlock_time = minutes + " min " + seconds + " sec"; }                
                          
                    if(minutes >= 60){
                        min = Math.floor(minutes - (hours * 60));
                        if(minutes >= 120){
                            if(minutes == 120){
                                my_lastBlock_time = hours + "hours";
                            } else{ my_lastBlock_time = hours + " hours " + min + " min"; }    
                        }
                            if(minutes == 60){
                                my_lastBlock_time = hours + " hour";
                            } else{ my_lastBlock_time = hours + " hour " + min + " min"; }
                    } 

                    if(minutes == 0){ 
                        my_lastBlock_time =  seconds + " sec"; 
                    } 
                    if(minutes < 45 ){
                        $("." + net + "_lastBlock").removeClass("usual").removeClass("red").addClass("forgingTime");
                    }
                    if(minutes > 45 ){
                        $("." + net + "_lastBlock").removeClass("forgingTime").addClass("usual");
                    }   
                    if(minutes > 90 ){
                        $("." + net + "_lastBlock").removeClass("forgingTime").removeClass("usual").addClass("red");
                    }

                    $("#" + net + "_lastBlock").text(my_lastBlock_time);       
                }  
        }

        function get_nextturn_time(f_turn,net){       
                if(f_turn !== null) {
                    timeg = f_turn * 27;
                    time = (timeg/60);
                    minutes = Math.floor(timeg / 60);
                    seconds = Math.round((time - minutes) * 60);
                    var v_nextturn="";

                    if(minutes == 0){ 
                        v_nextturn = timeg +" sec"; 
                        if(timeg < 30 ){
                            $("." + net + "_nextturn_bar").removeClass("usual").removeClass("red").addClass("forgingTime");
                        }
                    } else{ 
                        v_nextturn = minutes + " min "+ seconds + " sec";
                        $("." + net + "_nextturn_bar").removeClass("forgingTime").removeClass("red").addClass("usual");
                    }
                    $("#" + net + "_nextturn").text(v_nextturn);                              
                }
        }

        function get_server_data(){    

                var i=1;
                for (var ss in j_data.servers) {
                    if(j_data.servers[ss].syncing){
                        $("#server"+i+"_height").html(j_data.servers[ss].height + " <span><img src='resources/syncing.gif' width='16px' height='16px'></span>");
                    }else{$("#server"+i+"_height").html(j_data.servers[ss].height);}
                    $("#server"+i+"_consensus").text(j_data.servers[ss].consensus+"% ");

                    if(j_data.servers[ss].forging == "Server Error" || j_data.servers[ss].forging == null){
                        $("#server"+i+"_forging").text("Server Error");
                    } else{ $("#server"+i+"_forging").text(""); }              

                    if(j_data.servers[ss].forging == true){
                        $("#server"+i+"_forging").html("<img src='resources/logo.png' width='16px' height='16px'>");
                        if(j_data.servers[ss].testnet){
                             t_forging=true; 
                        } else { m_forging=true; }
                    } 
                    i++;
                }              
        }

        function are_you_forging(){

                if(!m_forging){
                    $("#m_dataMessages").text("Mainet are not forging!"); 
                    $(".m_nextturn_bar").removeClass("usual").addClass("red");
                    notifyMe("Mainet are not forging!");         
                    navigator.vibrate([500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500]);
                } else {
                    $("#m_dataMessages").text("");
                }
                
                if(!without_testnet){

                    if(!t_forging){
                        $("#t_dataMessages").text("Testnet are not forging!");
                        $(".t_nextturn_bar").removeClass("usual").addClass("red");
                        notifyMe("Testnet are not forging!");        
                        navigator.vibrate([500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500]);
                    } else {
                        $("#t_dataMessages").text("");
                    }
                }
        }

    });
}

function display_data(){
    $("#container").delay(700).fadeIn(500);
    $("#loading").delay(200).fadeOut(500);
    g_loader = 1;
    notifyMe("Monitor ready!");
}

// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

function notifyMe(s_message) {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification(s_message, {
        icon: 'resources/logo.png',
        body: 'Click here to go to the monitor',
        });

    setTimeout(notification.close.bind(notification), 15000);
    notification.onclick = function () {
        window.focus();
        this.clone();
    }; 
  }
}
