
let getById = (id, parent) => parent ? parent.getElementById(id) : getById(id, document);
let getByClass = (className, parent) => parent ? parent.getElementsByClassName(className) : getByClass(className, document);
let name = undefined;
let age = undefined;
let weight = undefined;
let height = undefined;
let gender = undefined;
let food_type = undefined;
let activity = undefined;
let goal_weight = undefined;
let goal_body = undefined;
let counter = 0;

const DOM =  {
	chatListArea: getById("chat-list-area"),
	messageArea: getById("message-area"),
	inputArea: getById("input-area"),
	chatList: getById("chat-list"),
	messages: getById("messages"),
	chatListItem: getByClass("chat-list-item"),
	messageAreaName: getById("name", this.messageArea),
	messageAreaPic: getById("pic", this.messageArea),
	messageAreaNavbar: getById("navbar", this.messageArea),
	messageAreaDetails: getById("details", this.messageAreaNavbar),
	messageAreaOverlay: getByClass("overlay", this.messageArea)[0],
	messageInput: getById("input"),
	profileSettings: getById("profile-settings"),
	profilePic: getById("profile-pic"),
	profilePicInput: getById("profile-pic-input"),
	inputName: getById("input-name"),
	username: getById("username"),
	displayPic: getById("display-pic"),
};

let mClassList = (element) => {
	return {
		add: (className) => {
			element.classList.add(className);
			return mClassList(element);
		},
		remove: (className) => {
			element.classList.remove(className);
			return mClassList(element);
		},
		contains: (className, callback) => {
			if (element.classList.contains(className))
				callback(mClassList(element));
		}
	};
};

// 'areaSwapped' is used to keep track of the swapping
// of the main area between chatListArea and messageArea
// in mobile-view
let areaSwapped = false;

// 'chat' is used to store the current chat
// which is being opened in the message area
let chat = null;

// this will contain all the chats that is to be viewed
// in the chatListArea
let chatList = [];

// this will be used to store the date of the last message
// in the message area
let lastDate = "";

// 'populateChatList' will generate the chat list
// based on the 'messages' in the datastore
let populateChatList = () => {
	chatList = [];

	// 'present' will keep track of the chats
	// that are already included in chatList
	// in short, 'present' is a Map DS
	let present = {};

	MessageUtils.getMessages()
	.sort((a, b) => mDate(a.time).subtract(b.time))
	.forEach((msg) => {
		let chat = {};
		
		chat.isGroup = msg.recvIsGroup;
		chat.msg = msg;

		if (msg.recvIsGroup) {
			chat.group = groupList.find((group) => (group.id === msg.recvId));
			chat.name = chat.group.name;
		} else {
			chat.contact = contactList.find((contact) => (msg.sender !== user.id) ? (contact.id === msg.sender) : (contact.id === msg.recvId));
			chat.name = chat.contact.name;
		}

		chat.unread = (msg.sender !== user.id && msg.status < 2) ? 1: 0;

		if (present[chat.name] !== undefined) {
			chatList[present[chat.name]].msg = msg;
			chatList[present[chat.name]].unread += chat.unread;
		} else {
			present[chat.name] = chatList.length;
			chatList.push(chat);
		}
	});
};

let viewChatList = () => {
	DOM.chatList.innerHTML = "";
	chatList
	.sort((a, b) => mDate(b.msg.time).subtract(a.msg.time))
	.forEach((elem, index) => {
		let statusClass = elem.msg.status < 2 ? "far" : "fas";
		let unreadClass = elem.unread ? "unread" : "";

		DOM.chatList.innerHTML += `
		<div class="chat-list-item d-flex flex-row w-100 p-2 border-bottom ${unreadClass}" onclick="generateMessageArea(this, ${index})">
			<img src="${elem.isGroup ? elem.group.pic : elem.contact.pic}" alt="Profile Photo" class="img-fluid rounded-circle mr-2" style="height:50px;">
			<div class="w-50">
				<div class="name">${elem.name}</div>
				<div class="small last-message">${elem.isGroup ? contactList.find(contact => contact.id === elem.msg.sender).number + ": " : ""}${elem.msg.sender === user.id ? "<i class=\"" + statusClass + " fa-check-circle mr-1\"></i>" : ""} ${elem.msg.body}</div>
			</div>
			<div class="flex-grow-1 text-right">
				<div class="small time">${mDate(elem.msg.time).chatListFormat()}</div>
				${elem.unread ? "<div class=\"badge badge-success badge-pill small\" id=\"unread-count\">" + elem.unread + "</div>" : ""}
			</div>
		</div>
		`;
	});
};

let generateChatList = () => {
	populateChatList();
	viewChatList();
};

let addDateToMessageArea = (date) => {
	DOM.messages.innerHTML += `
	<div class="mx-auto my-2 bg-primary text-white small py-1 px-2 rounded">
		${date}
	</div>
	`;
};

let addMessageToMessageArea = (msg) => {
	let msgDate = mDate(msg.time).getDate();
	if (lastDate != msgDate) {
		addDateToMessageArea(msgDate);
		lastDate = msgDate;
	}

	let htmlForGroup = `
	<div class="small font-weight-bold text-primary">
		${contactList.find(contact => contact.id === msg.sender).number}
	</div>
	`;

	let sendStatus = `<i class="${msg.status < 2 ? "far" : "fas"} fa-check-circle"></i>`;
    
	DOM.messages.innerHTML += `
	<div class="align-self-${msg.sender === user.id ? "end self" : "start"} p-1 my-1 mx-3 rounded bg-white shadow-sm message-item">
		<div class="options">
			<a href="#"><i class="fas fa-angle-down text-muted px-2"></i></a>
		</div>
		${chat.isGroup ? htmlForGroup : ""}
		<div class="d-flex flex-row">
			<div class="body m-1 mr-2">${msg.body}</div>
			<div class="time ml-auto small text-right flex-shrink-0 align-self-end text-muted" style="width:75px;">
				${mDate(msg.time).getTime()}
				${(msg.sender === user.id) ? sendStatus : ""}
			</div>
		</div>
	</div>
	`;

	DOM.messages.scrollTo(0, DOM.messages.scrollHeight);
};

let addMessageToMessageArea2 = (msg) => {
	let msgDate = mDate(msg.time).getDate();
	if (lastDate != msgDate) {
		addDateToMessageArea(msgDate);
		lastDate = msgDate;
	}

	let htmlForGroup = ``;

	let sendStatus = `<i class="${msg.status < 2 ? "far" : "fas"} fa-check-circle"></i>`;
    
	DOM.messages.innerHTML += `
	<div class="align-self-start p-1 my-1 mx-3 rounded bg-white shadow-sm message-item">
		<div class="options">
			<a href="#"><i class="fas fa-angle-down text-muted px-2"></i></a>
		</div>
		
		<div class="d-flex flex-row">
			<div class="body m-1 mr-2">${msg.body}</div>
			<div class="time ml-auto small text-right flex-shrink-0 align-self-end text-muted" style="width:75px;">
				${mDate(msg.time).getTime()}
				${(msg.sender === user.id) ? sendStatus : ""}
			</div>
		</div>
	</div>
	`;

	DOM.messages.scrollTo(0, DOM.messages.scrollHeight);
};

let generateMessageArea = (elem, chatIndex) => {
	chat = chatList[chatIndex];

	mClassList(DOM.inputArea).contains("d-none", (elem) => elem.remove("d-none").add("d-flex"));
	mClassList(DOM.messageAreaOverlay).add("d-none");

	[...DOM.chatListItem].forEach((elem) => mClassList(elem).remove("active"));

	mClassList(elem).contains("unread", () => {
		 MessageUtils.changeStatusById({
			isGroup: chat.isGroup,
			id: chat.isGroup ? chat.group.id : chat.contact.id
		});
		mClassList(elem).remove("unread");
		mClassList(elem.querySelector("#unread-count")).add("d-none");
	});

	if (window.innerWidth <= 575) {
		mClassList(DOM.chatListArea).remove("d-flex").add("d-none");
		mClassList(DOM.messageArea).remove("d-none").add("d-flex");
		areaSwapped = true;
	} else {
		mClassList(elem).add("active");
	}

	DOM.messageAreaName.innerHTML = chat.name;
	DOM.messageAreaPic.src = chat.isGroup ? chat.group.pic : chat.contact.pic;
	
	// Message Area details ("last seen ..." for contacts / "..names.." for groups)
	if (chat.isGroup) {
		let groupMembers = groupList.find(group => group.id === chat.group.id).members;
		let memberNames = contactList
				.filter(contact => groupMembers.indexOf(contact.id) !== -1)
				.map(contact => contact.id === user.id ? "You" : contact.name)
				.join(", ");
		
		DOM.messageAreaDetails.innerHTML = `${memberNames}`;
	} else {
		DOM.messageAreaDetails.innerHTML = `last seen ${mDate(chat.contact.lastSeen).lastSeenFormat()}`;
	}

	let msgs = chat.isGroup ? MessageUtils.getByGroupId(chat.group.id) : MessageUtils.getByContactId(chat.contact.id);

	DOM.messages.innerHTML = "";

	lastDate = "";
	msgs
	.sort((a, b) => mDate(a.time).subtract(b.time))
	.forEach((msg) => addMessageToMessageArea(msg));
};

let showChatList = () => {
	if (areaSwapped) {
		mClassList(DOM.chatListArea).remove("d-none").add("d-flex");
		mClassList(DOM.messageArea).remove("d-flex").add("d-none");
		areaSwapped = false;
	}
};

function add_message(message_source,body,time){
    var msgdata = {
		'message_source':message_source,
		'body':body,
		'time':time
	}
	$.ajax({
	    async: true,
		crossDomain: true,
		url: "/add_message/",
		method: "POST",
		headers: {
		    "Content-Type": "application/json",
		    "cache-control": "no-cache"
		},
		data: JSON.stringify(msgdata)
	}).done(function (response) {

	});
	return true
}

let sendMessage = () => {
	let value = DOM.messageInput.value;
	DOM.messageInput.value = "";
	if (value === "") return;

	let msg = {
		sender: user.id,
		body: value,
		time: mDate().toString(),
		status: 1,
		recvId: chat.isGroup ? chat.group.id : chat.contact.id,
		recvIsGroup: chat.isGroup
	};
    
	addMessageToMessageArea(msg);
	MessageUtils.addMessage(msg);
	generateChatList();
	if(msg['recvId'] == 1){
		if(counter == 0){
			name = msg['body'];
		    add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Hi,'+name+'!<br>Your Age?',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 1){
			age = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Your Weight? (in kg)',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 2){
			weight = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Your Height? (in cm)',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 3){
			height = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Your Gender? (Enter the Number)<br>1. Male<br>2. Female',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 4){
			gender = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Type of Food You Eat? (Enter the Number)<br>1. Vegetarian with Eggs<br>2. Vegetarian without Eggs<br>3. Non-Vegetarian',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 5){
			food_type = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Your Levels of Activity? (Enter the Number)<br>1. Light<br>2. Moderate<br>3. Vigorous',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 6){
			activity = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Your Desired Goal? (in Kg)',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 7){
			goal_weight = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Your Desired Body Type? (Enter the number)<br>1. Athletic<br>2. Fit<br>3. Average',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 8){
			goal_body = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			var msgs = {
				sender: user.id,
				body: 'Connect Your Fitbit Account? (Enter Email)',
				time: mDate().toString(),
				status: 1,
				recvId: chat.isGroup ? chat.group.id : chat.contact.id,
				recvIsGroup: chat.isGroup
			};
            addMessageToMessageArea2(msgs);
            add_message(true,msgs['body'],mDate().toString());
		}else if(counter == 9){
			email = msg['body'];
			add_message(false,msg['body'],mDate().toString());
			if(gender == 1){
				gender = 'Male';
			}else{
				gender = 'Female';
			}
			if(food_type == 1){
				food_type = 'VEGETARIAN WITH EGGS';
			}else if(food_type == 2){
				food_type = 'VEGETARIAN WITHOUT EGGS';
			}else{
				food_type = 'NON-VEGETARIAN';
			}

			if(activity == 1){
				activity = 'LIGHT';
			}else if(activity == 2){
				activity = 'MODERATE';
			}else{
				activity = 'VIGOROUS';
			}

			if(goal_body == 1){
				goal_body = 'ATHLETIC';
			}else if(goal_body == 2){
				goal_body = 'FIT';
			}else{
				goal_body = ' AVERAGE';
			}
	    	var userdata = {
	    		'number':'9557761700',
	    		'name':name,
	    		'age':age,
	    		'weight':weight,
	    		'height':height,
	    		'gender':gender,
	    		'food_type':food_type,
	    		'activity':activity,
	    		'goal_weight':goal_weight,
	    		'goal_body':goal_body
	    	}
	    	$.ajax({
			    async: true,
				crossDomain: true,
				url: "/register/",
				method: "POST",
				headers: {
				    "Content-Type": "application/json",
				    "cache-control": "no-cache"
				},
				data: JSON.stringify(userdata)
			}).done(function (response) {
				if(response == 'Success'){
					var msgs = {
						sender: user.id,
						body: 'Congratulations!<br>You have successfully been Registered!<br>Here is Your Personalized Diet:',
						time: mDate().toString(),
						status: 1,
						recvId: chat.isGroup ? chat.group.id : chat.contact.id,
						recvIsGroup: chat.isGroup
					};
		            addMessageToMessageArea2(msgs);
		            add_message(true,msgs['body'],mDate().toString());
		        }

			});
			window.open('https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22BKN9&redirect_uri=http%3A%2F%2Flocalhost%3A8000&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800');
			
		}else{

		}
		counter = counter + 1;
	}
};


let showProfileSettings = () => {
	DOM.profileSettings.style.left = 0;
	DOM.profilePic.src = user.pic;
	DOM.inputName.value = user.name;
};

let hideProfileSettings = () => {
	DOM.profileSettings.style.left = "-110%";
	DOM.username.innerHTML = user.name;
};

window.addEventListener("resize", e => {
	if (window.innerWidth > 575) showChatList();
});

let init = () => {
	DOM.username.innerHTML = user.name;
	DOM.displayPic.src = user.pic;
	DOM.profilePic.stc = user.pic;
	DOM.profilePic.addEventListener("click", () => DOM.profilePicInput.click());
	DOM.profilePicInput.addEventListener("change", () => console.log(DOM.profilePicInput.files[0]));
	DOM.inputName.addEventListener("blur", (e) => user.name = e.target.value);
	generateChatList();

	console.log("Click the Image at top-left to open settings.");
};

init();

$('#input').keypress(function (e) {
 var key = e.which;
 if(key == 13)  // the enter key code
  {
    $(this).parent().find('i').click();
    return false;  
  }
});  


var params = new window.URLSearchParams(window.location.search);

if(params.get('code')){
	var numberdata = {
        'number': '9557761700'
    }
    $.ajax({
            async: true,
            crossDomain: true,
            url: "/notify/",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
            data: JSON.stringify(numberdata)
        }).done(function (response) {
        	console.log(response);
        	var mlist = String(response['breakfast']).split(',');
        	var mbody = '<ol>';
            for(var i in mlist){
            	mbody = mbody + '<li>'+mlist[i]+'</li>';
            }
            mbody = mbody + '</ol>'
        	let not = {
				sender: 1,
				body: '<b>Breakfast:</b><br>'+mbody,
				time: mDate().toString(),
				status: 2,
				recvId: 0,
				recvIsGroup: false
			};
        	addMessageToMessageArea2(not);

        	var mlist = String(response['pre-lunch']).split(',');
        	var mbody = '<ol>';
            for(var i in mlist){
            	mbody = mbody + '<li>'+mlist[i]+'</li>';
            }
            mbody = mbody + '</ol>'
        	not = {
				sender: 1,
				body: '<b>Pre-Lunch (Snacks):</b><br>'+mbody,
				time: mDate().toString(),
				status: 2,
				recvId: 0,
				recvIsGroup: false
			};
        	addMessageToMessageArea2(not);

        	var mlist = String(response['lunch']).split(',');
        	var mbody = '<ol>';
            for(var i in mlist){
            	mbody = mbody + '<li>'+mlist[i]+'</li>';
            }
            mbody = mbody + '</ol>'
        	not = {
				sender: 1,
				body: '<b>Lunch:</b><br>'+mbody,
				time: mDate().toString(),
				status: 2,
				recvId: 0,
				recvIsGroup: false
			};
        	addMessageToMessageArea2(not);

        	var mlist = String(response['post-lunch']).split(',');
        	var mbody = '<ol>';
            for(var i in mlist){
            	mbody = mbody + '<li>'+mlist[i]+'</li>';
            }
            mbody = mbody + '</ol>'
        	not = {
				sender: 1,
				body: '<b>Post-Lunch (Snacks):</b><br>'+ mbody,
				time: mDate().toString(),
				status: 2,
				recvId: 0,
				recvIsGroup: false
			};
        	addMessageToMessageArea2(not);

        	var mlist = String(response['dinner']).split(',');
        	var mbody = '<ol>';
            for(var i in mlist){
            	mbody = mbody + '<li>'+mlist[i]+'</li>';
            }
            mbody = mbody + '</ol>'
        	not = {
				sender: 1,
				body: '<b>Dinner:</b><br>'+mbody,
				time: mDate().toString(),
				status: 2,
				recvId: 0,
				recvIsGroup: false
			};
        	addMessageToMessageArea2(not);
            
        });
}
