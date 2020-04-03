'use strict';

var socket = io.connect(location.origin);
socket.on('connect', function(data) {
  socket.emit('join', 'Handshake with server...');
});
// handle callouts
socket.on('callout', function(data) {
  // prepare callout
  var callout = '<div class="callout callout-' + data.callout + '">' +
		'<p>' + data.message + '</p>' +
	  '</div>';
  (function (el) {
    setTimeout(function () {
        el.children().remove('div');
    }, 5000);
  }($('.callout-box').append(callout)));
});
