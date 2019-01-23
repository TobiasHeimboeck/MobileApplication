Vue.component("sidebar", {
    template: `<div id="mySidenav" class="sidenav">
    <div class="sideHeader">
        <img class="logo" src="img/nysl_logo.png" alt="NYSL Logo">
        <a class="closebtn" onclick="closeNav()">&times;</a>
    </div>
    <div class="sideNavigation">
        <p class="navi"> <a href="#" onclick="main.openPage('default'), closeNav()"> <i class="fa fa-home">
                </i> Home</a> </p>
        <p class="navi"> <a href="#" onclick="main.openPage('schedule'), closeNav()"> <i class="fa fa-clock-o">
                </i> Schedule</a>
        </p>
        <p class="navi"> <a href="#" onclick="main.openPage('locations'), closeNav()"> <i class="fa fa-location-arrow"> </i> Locations</a> </p>
        <p class="navi"> <a href="#" onclick="main.openPage('chat'), closeNav()"> <i class="fa fa-comments"> </i> Chat</a> </p>
    </div>
    <div class="sideFooter">
        <img v-if="this.loggedIn == true" :src="main.profilePicture" alt="User placeholder">
        <img v-else="this.loggedIn === false" src="img/user.png" alt="User">
    </div>
</div>`
});

Vue.component("navbar", {
    props: ["title"],
    template: `
            <div class="topnav">
                <a class="icon" onclick="openNav()">
                    <i class="fa fa-bars"></i>
                </a>
                <p>{{ title }}</p>
            </div>
    `
});

Vue.component("navbar_chat", {
    props: ["title"],
    template: `
            <div class="topnav">
                <a class="icon" onclick="openNav()">
                    <i class="fa fa-bars"></i>
                </a>

                <a class="icon" style="float:right;" onclick="main.logout()">
                    <i class="fa fa-sign-out"></i>
                </a>
                <img id="pic" src="img/nysl_logo.png" alt="Profile Picture">
                <p>{{ title }}</p>
            </div>
    `
});

Vue.component("filter_icon", {
    props: ["title"],
    template: `
        <div class="topnav">
                <a class="icon" onclick="openNav()">
                    <i class="fa fa-bars"></i>
                </a>
                <a style="float:right;" class="filterIcon" onclick="main.openPage('filter')">
                    <i class="fa fa-filter"></i>
                </a>
                <p>{{ title }}</p>
            </div>
    `
});

const main = new Vue({
    el: "#main",
    data: {
        allGames: [],
        games: [],
        locations: [],
        activeView: undefined,
        filterState: undefined,
        loggedIn: false,
        userName: undefined,
        email: undefined,
        profilePicture: undefined,
        messages: [],
    },
    created() {
        this.fetchAPI("https://api.myjson.com/bins/jkxl4");
        this.hideAllPages();
        this.loadTeamButtons();
    },
    methods: {
        fetchAPI(url) {
            fetch(url, {
                method: "GET",
            }).then(function (response) {
                return response.json();
            }).then(function (json) {
                data = json;
                main.filterState = "All";
                main.allGames = data.games;
                main.games = main.loadGames();
                main.locations = data.locations;
            }).catch(function (error) {
                console.log(error);
            });
        },
        loadGames() {
            let state = this.filterState;
            let games = [];

            if (state === "All")
                games = this.allGames;
            else
                games = this.filterGames(state);

            return games;
        },
        hideAllPages() {
            let pageIDs = ["schedule", "filter", "locations", "login", "chat"];

            for (let i = 0; i < pageIDs.length; i++)
                this.loadPage(pageIDs[i], false);

            this.openPage("default");
        },
        loadTeamButtons() {
            let teams = ["U1", "U2", "U3", "U4", "U5", "U6"];

            for (let i = 0; i < teams.length; i++)
                this.createTeamButton(teams[i]);

            this.createTeamButton("All");

            const allButton = document.getElementById("All");
            allButton.style.backgroundColor = "#689633";
            allButton.style.borderRadius = "100px";
        },
        createTeamButton(team) {
            let cardElement = document.getElementById("teamCards");
            let display = document.createElement("div");
            let displayName = document.createElement("h5");

            display.setAttribute("id", team);

            display.className = "frontPage";
            displayName.className = "displayName";
            displayName.innerHTML = team;
            display.append(displayName);
            cardElement.append(display);
        },
        openPage(pageID) {

            this.games = this.loadGames();

            switch (pageID) {
                case "default":
                    if (this.activeView !== undefined)
                        this.loadPage(this.activeView, false);
                    this.loadPage("default", true);
                    this.activeView = "default";
                    break;
                case "schedule":
                    if (this.activeView !== undefined)
                        this.loadPage(this.activeView, false);

                    this.loadPage("schedule", true);
                    this.activeView = "schedule";
                    break;
                case "filter":
                    if (this.activeView !== undefined)
                        this.loadPage(this.activeView, false);
                    this.loadPage("filter", true);
                    this.activeView = "filter";
                    break;
                case "locations":
                    if (this.activeView !== undefined)
                        this.loadPage(this.activeView, false);
                    this.loadPage("locations", true);
                    this.activeView = "locations";
                    break;
                case "login":
                    if (this.activeView !== undefined)
                        this.loadPage(this.activeView, false);
                    this.loadPage("login", true);
                    this.activeView = "login";
                    break;
                case "chat":
                    if (this.activeView !== undefined) 
                        this.loadPage(this.activeView, false);
                    
                    if(this.loggedIn) {
                        this.loadPage("chat", true);
                        this.activeView = "chat";
                    } else {
                        this.loadPage("login", true);
                        this.activeView = "login";
                    }
                    break;
            }
        },
        loadPage(pageID, value) {
            if (value)
                document.getElementById(pageID).style.display = "block";
            else
                document.getElementById(pageID).style.display = "none";
        },
        filterGames(filterBy) {
            let responseArray = [];

            for (let i = 0; i < this.allGames.length; i++) {
                const currentGame = this.allGames[i];
                if (this.arrayContains(filterBy, currentGame.teamsArray))
                    responseArray.push(currentGame);
            }

            return responseArray;
        },
        arrayContains(object, array) {
            return (array.indexOf(object) > -1);
        },
        login() {
            const provider = new firebase.auth.GoogleAuthProvider();            
            firebase.auth().signInWithPopup(provider).then(function() {
                main.loggedIn = true;
                main.loadPosts();
            });
        },
        logout() {
            firebase.auth().signOut();
            main.loggedIn = false;
            main.openPage("chat");
        },
        loadPosts() {
            main.userName = firebase.auth().currentUser.displayName.split(' ')[0];
            main.email = firebase.auth().currentUser.email;
            main.profilePicture = firebase.auth().currentUser.photoURL;
            
            document.getElementById("pic").src = main.profilePicture;
            
            main.openPage("chat");
            main.getPosts();
        },
        postMessage() {
            
            let text = document.getElementById("chat_input").value;
            let box = document.createElement("div");
            
            const post = {
                sender: main.userName,
                senderProfilePicture: main.profilePicture,
                message: text,
                postedTime: main.getTime()
            }
            
            if(text !== "") {
                let newPostKey = firebase.database().ref().child("main").push().key;
                let updates = {};
                updates[newPostKey] = post;
                
                return firebase.database().ref("main").update(updates);
            } else {
                console.log("text is empty");
            }
        },
        getTime() {
            let date = new Date();
            
            let hours = date.getHours(), minutes = date.getMinutes();
            
            if(date.getHours() < 10 && date.getMinutes() < 10) {
                hours = '0' + date.getHours();
                minutes = '0' + date.getMinutes();
            } else if(date.getMinutes() < 10) {
                minutes = '0' + date.getMinutes();
            } else if (date.getHours() < 10) {
                hours = '0' + date.getHours();
            }
            
            return `${hours}:${minutes}`;
        },
        getPosts() {
            
            firebase.database().ref("main").on("value", function (data) {
                
                let posts = document.getElementById("show_chat");
                let messages = data.val();
                
                posts.innerHTML = "";
                
                for(key in messages) {
                    
                    let box = document.createElement("div");
                    
                    if(messages[key].sender === main.userName)
                        box.className = "container-left";
                    else
                        box.className = "container-right";
                    
                    let img = document.createElement("img");
                    img.src = messages[key].senderProfilePicture;
                    img.style.width="100%";

                    let chatMessage = document.createElement("p");
                    chatMessage.innerHTML = messages[key].message;

                    let time = document.createElement("span");
                    
                    if(messages[key].sender === main.userName)
                        time.className = "time-right";
                    else
                        time.className = "time-left";
                                        
                    time.innerHTML = messages[key].postedTime;

                    box.appendChild(img);
                    box.appendChild(chatMessage);
                    box.appendChild(time);
                    
                    document.getElementById("show_chat").appendChild(box);
                    
                    setTimeout(function() {
                        $("#show_chat").animate({ scrollTop: $("#show_chat").prop("scrollHeight") }, 500);
                    });
                }
            });
        }
    }
});

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.body.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.body.style.backgroundColor = "rgb(75, 207, 75)";
}

const ids = ["U1", "U2", "U3", "U4", "U5", "U6", "All"];

for (let i = 0; i < ids.length; i++) {
    document.getElementById(ids[i]).addEventListener("click", function () {
        main.filterState = ids[i];
        main.openPage("schedule");
    });
}