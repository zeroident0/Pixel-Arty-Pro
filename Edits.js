var edit = document.querySelector(".pixel");
var editS;
var maxEdits = 920;

//Control Buttons
// var clearBtn = document.getElementById("clear");

// clearBtn.addEventListener("click", function(){
// 	for(var i = 0; i < editS.length; i++){
// 		editS[i].style.backgroundColor="black";
// 	}
// });

function fun(){
	clearInterval(loop);
	editS = document.querySelectorAll(".pixel");
}

function create() {
	if(1 < maxEdits){
	var cln = edit.cloneNode(true);
	document.body.appendChild(cln);
	maxEdits--;
	}else{
		fun();
	}
}

var loop = setInterval(create, 1);