
var serialPort = new SerialPort;
var isPaused = false;
var isAlwaysDown = false;

function reloadPort(){
  getDevicesList(
     function(response){
       //Empty the list
       $('#port-combo').empty();
       //If result is ok reload the list
       if(response.result === "ok"){
         for(var i = 0; i < response.ports.length; i++){
           $('#port-combo').append('<option value="' + response.ports[i].path +  '">' +
                                      response.ports[i].displayName + '(' + response.ports[i].path + ')' +
                                    '</option>');
         }
         setEnabled($('#open-btn'), response.ports.length > 0 && !serialPort.isOpen());
       }
       else{
         showAlert('#error-alert', response.error);
       }
     }
   );
}

function openPort(){
  var bitrate = checkCookie("can.port.bitrate") ? getCookie("can.port.bitrate") : "9600";
  var databits = checkCookie("can.port.databits") ? getCookie("can.port.databits") : "eight";
  var stopbit = checkCookie("can.port.stopbit") ? getCookie("can.port.stopbit") : "one";
  var paritybit = checkCookie("can.port.paritybit") ? getCookie("can.port.paritybit") : "no";

  serialPort.openPort(
    {
      portName: $('#port-combo').val(),
      bitrate: parseInt(bitrate),
      dataBits: databits,
      stopBits: stopbit,
      parityBit: paritybit
    },
    function(response){
      if(response.result === "ok"){
        setEnabled("#open-btn", false);
        setEnabled("#pause-btn", true);
        setEnabled("#close-btn", true);
        serialPort.setOnDataReceivedCallback(onNewSerialData);
      }
      else{
        showAlert("#error-alert", response.error);
      }
    }
  );
}

function closePort(){
  serialPort.closePort(
    function(response){
      if(response.result === "ok"){
        setEnabled("#open-btn", true);
        setEnabled("#pause-btn", false);
        setEnabled("#close-btn", false);
      }
      else{
        showAlert("#error-alert", response.error);
      }
    }
  );
}

function pause(){
  isPaused = !isPaused;
}

function toggleAlwaysDown(){
  isAlwaysDown = !isAlwaysDown;
  $("#down-btn").toggleClass("active");
}

function onNewSerialData(data){
  if(!isPaused){
    var dv = new DataView(data);
  }
}

function showSettingsModal(){
  var bitrate = checkCookie("can.port.bitrate") ? getCookie("can.port.bitrate") : "9600";
  var databits = checkCookie("can.port.databits") ? getCookie("can.port.databits") : "eight";
  var stopbit = checkCookie("can.port.stopbit") ? getCookie("can.port.stopbit") : "one";
  var paritybit = checkCookie("can.port.paritybit") ? getCookie("can.port.paritybit") : "no";

  $("#serial-port-bitrate").val(bitrate);
  $("#serial-port-databits").val(databits);
  $("#serial-port-stopbit").val(stopbit);
  $("#serial-port-paritybit").val(paritybit);

  $('#settings-modal').modal();
}

function saveSettings(){
  setCookie("can.port.bitrate", $("#serial-port-bitrate").val());
  setCookie("can.port.databits", $("#serial-port-databits").val());
  setCookie("can.port.stopbit", $("#serial-port-stopbit").val());
  setCookie("can.port.paritybit", $("#serial-port-paritybit").val());
}

var currentFilterType = "none";
var minFilter;
var maxFilter;
var listFilter = [];

var chronoPacketsList = [];
var uniquePacketsList = [];

function addPacket(packet){
  if(checkFilter(packet.id)){
    uniquePacketsList[packet.id] = packet;
    chronoPacketsList.push(packet);
    if(chronoPacketsList.length > 1000){
      chronoPacketsList.splice(0, 100);
    }
  }
}

function clearTables(){
  chronoPacketsList.splice(0, chronoPacketsList.length);
  uniquePacketsList.splice(0, uniquePacketsList.length);
  $("#rx-table").empty();
}

function showFilterModal(){
  $("#filter-" + currentFilterType).attr("checked", true);
  onFilterSelected(currentFilterType);

  $("#filter-modal").modal();
}

function addToSelectedChannels(){
  var idToAdd = $("#channel-list").val();
  if(listFilter.indexOf(idToAdd) == -1){
    listFilter.push(idToAdd);
    $("#selected-channel-list").append('<option value="' + idToAdd + '">' + $("#channel-list option:selected").text() + '</option>');
  }
}

function removeFromSelectedChannels(){
  var index;
  $('#selected-channel-list :selected').each(
    function(i, selected){
      index = listFilter.indexOf($(selected).val());
      listFilter.splice(index, 1);
      $(selected).remove();
    }
  );
}

function onFilterSelected(filter){
  currentFilterType = filter;
  if(currentFilterType === "none"){
    setEnabled("#min-channel-list", false);
    setEnabled("#max-channel-list", false);
    setEnabled("#channel-list", false);
    setEnabled("#add-channel", false);
    setEnabled("#remove-channel", false);
    setEnabled("#selected-channel-list", false);
  }
  else if(currentFilterType === "range"){
    setEnabled("#min-channel-list", true);
    setEnabled("#max-channel-list", true);
    setEnabled("#channel-list", false);
    setEnabled("#add-channel", false);
    setEnabled("#remove-channel", false);
    setEnabled("#selected-channel-list", false);

    minFilter = $("min-channel-list").val();
    maxFilter = $("max-channel-list").val();
  }
  else if(currentFilterType === "list"){
    setEnabled("#min-channel-list", false);
    setEnabled("#max-channel-list", false);
    setEnabled("#channel-list", true);
    setEnabled("#add-channel", true);
    setEnabled("#remove-channel", true);
    setEnabled("#selected-channel-list", true);
  }
}

function checkFilter(id){
  if(currentFilterType === "none"){
    return true;
  }
  else if(currentFilterType === "range"){
    if(id >= minFilter && id <= maxFilter){
      return true;
    }
  }
  else if(currentFilterType === "list"){
    if(listFilter.indexOf(id) != -1){
      return true;
    }
  }
  return false;
}

function applyFilter(){
  $("#rx-table").empty();

}
