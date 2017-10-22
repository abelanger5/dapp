var socket = require('socket.io-client').connect('http://35.196.132.21:3000', { reconnect: true });
//var socket = require('socket.io-client').connect('http://localhost:3000', { reconnect: true });
var ipc = require('electron').ipcRenderer; 
var url; 
var num_players; 
var connected = [false, false, false, false]; 
var connected_clients = new Array(4); 

$(document).ready(function() {

	$('.start').click(function () {
		url = generate_url(); 
		$('.start-container').hide(); 
		$('.game-container').show(); 
		$('.url-generator').text("www.filler.com/" + url);  
		ipc.send('url', url); 
		socket.emit('create-url', {'url': url}); 

		//get the disable event from server to connect player
		socket.on(url + '-disable', function(msg) {
			connected[msg.pid - 1] = true; 
			var color; 

			if (msg.pid == 1) {
				color = "rgb(224,102,102)";
			} else if (msg.pid == 2) {
				color = "rgb(182,215,168)";
			} else if (msg.pid == 3) {
				color = "rgb(199,184,237)"; 
			} else if (msg.pid == 4) {
				color = "rgb(249,203,156)"; 
			}

			$('.player-' + msg.pid).css('background-color', color); 
		}); 

		socket.on(url + '-client-connect', function(msg) {
			connected_clients[parseInt(msg.pid) - 1] = msg.client_id; 
			console.log('added: ' + msg.client_id); 
		}); 

		socket.on(url + '-connect-query', function(msg) {
			console.log(url + '-connect-query'); 
			socket.emit('answer-query', {url_send: url, clients: connected}); 
		}); 

		//get the client disconnect event and check it against the array of clients
		socket.on('client-disconnect', function(msg) {
			console.log('asked to remove: ' + msg.client_id); 
			for (var i = 0; i < 4; i++) {
				if (connected_clients[i] == msg.client_id) {
					$('.player-' + (i + 1)).css('background-color', 'rgb(180, 180, 180)'); 
					connected[i] = false; 
					socket.emit('client-disable', {url_send: url, pid: (i + 1)}); 
				}
			}
		}); 
	}); 
}); 

function generate_url () {
	return "" + (Math.floor(Math.random()*90000) + 10000);
}