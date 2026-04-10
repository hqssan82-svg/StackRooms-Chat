import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore,updateDoc,deleteDoc,collection,addDoc,getDocs,getDoc,doc,setDoc,query,orderBy,onSnapshot } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { 
  getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyASkKoC-cnVTOSQas2uPGRG6j4MPn99m-0",

    authDomain: "stackrooms-chat.firebaseapp.com",

    projectId: "stackrooms-chat",

    storageBucket: "stackrooms-chat.firebasestorage.app",

    messagingSenderId: "967908740221",

    appId: "1:967908740221:web:3bde382a561cb8a315f514",

    measurementId: "G-2DRX7TQ49Z"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

const db = getFirestore(app)
const q = query(collection(db, "Gaming"),orderBy("Timestamp","asc"))
const emailCollection = await collection(db,"Users")


let emailSnapshots = []
let snapshots = []
let currentUsername = []

onSnapshot(emailCollection, (snapshot) => {
    emailSnapshots = snapshot.docs;

});
onSnapshot(q,async () => {
    snapshots = await getDocs(q)
})
snapshots.forEach((doc) => {
    console.log(doc.data().Content)
})

const path = window.location.pathname

async function currentUsernameCheck () {
    while (emailSnapshots.length === 0) {
        await new Promise(res => setTimeout(res, 50)); // check every 50ms
    }
    let found = false
    const currentEmail = auth.currentUser.email
    console.log(currentEmail)
    for (const doc of emailSnapshots) {
        if (doc.data().email == currentEmail) {
            found = true
            return doc.data().Username
        }
    }
    if (found == false) {
        console.log("it no usered")
        return "no user"
    }
}

async function body () {
    async function askingForUsername () {
        currentUsername = await currentUsernameCheck()

        if (currentUsername == "no user" && !path.includes("setUsername.html")) {
            window.location.href ="setUsername.html"
        }
        else if (currentUsername == undefined && !path.includes("setUsername.html")) {
            window.location.href = "setUsername.html"
        }
        else {
            console.log(currentUsername)
        }
    }
    async function loginCheck () {
        onAuthStateChanged(auth,async(user) => {
            if (user) {
                console.log("user is logged in")
                await askingForUsername();
            }
            else if (!path.includes("signUp.html") && !path.includes("login.html")) {
                console.log("user is not logged in")
                window.location.href = "signUp.html"
            }
            else {
                console.log("something is wrong")
            }
        })
    }
    async function signup() {

        let email
        let password

        const signupCardDiv = document.getElementById("signup-card-div")
        const emailPasswordInput = document.getElementById("email-password-input")
        const confirmSignupButton = document.getElementById("signup-confirm-button")
        const switchToLoginButton = document.getElementById("switch-to-login-button")

        switchToLoginButton.onclick = () => {
            window.location.href = "login.html"
        }

        emailPasswordInput.addEventListener("keydown",(e)=> {
            if (e.code ==="Enter") {
                confirmSignupButton.click()
            }
        })

        confirmSignupButton.onclick = () => {
            emailPasswordInput.classList.add("rotate")
            setTimeout(() => {emailPasswordInput.classList.remove("rotate")},500)
            email = emailPasswordInput.value
            addDoc(emailCollection, {
                        email : email
                    })
            
            emailPasswordInput.value= ""
            emailPasswordInput.placeholder = "Type In Your Password"
            
            console.log(`email is ${email}`)

            confirmSignupButton.onclick = () => {
                password = emailPasswordInput.value
                if (password.length <= 6) {
                    window.location.href = "signUp.html"
                }
                emailPasswordInput.value = ""

                console.log(`Password is ${password}`)

                createUserWithEmailAndPassword(auth,email,password)
                .then(async(userCredential) => {
                    emailPasswordInput.value = "Logging In .."
                    setTimeout(() => {emailPasswordInput.value = "Logging In..."},500)
                    console.log(userCredential.user.email)


                    window.location.href = "gaming.html"
                
                })
                .catch((error) => {
                    console.error(error.message)
                })
            }

        }
    }
    async function login () {
        
        let email
        let password

        const emailPasswordInputLogin = document.getElementById("email-password-input-login")
        const confirmLoginButton = document.getElementById("confirm-login-button")
        const signUpButton = document.getElementById("sign-up-button")

        signUpButton.onclick = () => {
            window.location.href = "signUp.html"
        }

        emailPasswordInputLogin.addEventListener("keydown",(e) => {
            if (e.code==="Enter") {
                confirmLoginButton.click()
            }
        })

        confirmLoginButton.onclick = () => {
            email = emailPasswordInputLogin.value
            emailPasswordInputLogin.value = ""
            emailPasswordInputLogin.placeholder = "Type In Your Password"

            emailPasswordInputLogin.classList.add("rotate")
            setTimeout(() => {emailPasswordInputLogin.classList.remove("rotate")},500)
            
            confirmLoginButton.onclick = () => {
                password = emailPasswordInputLogin.value
                emailPasswordInputLogin.value = ""
                async function loggingIn () {
                    try {
                    const userCredentials = await signInWithEmailAndPassword(auth,email,password)
                    const user = userCredentials.user

                    console.log("logged in")
                    window.location.href = "gaming.html"
                    emailPasswordInputLogin.value = "Logging In"
                }

                catch (error) {
                    if (error.code === "auth/invalid-credential") {
                        emailPasswordInputLogin.value = "User Not Found"
                    }
                    else if (error.code === "auth/wrong-password") {
                        emailPasswordInputLogin.value = "Wrong Password"
                    }
                    else {
                        emailPasswordInputLogin.value = "Something Went Wrong"
                        console.log(error.message)

                        setTimeout(() => {window.location.href = "login.html"},2000)
                    }
                    
                }
                }
                loggingIn()
                
            }
        }
    }
    async function displayingTexts () {
        const contentContainer = document.getElementById("text-container")
        
        onSnapshot(q, async(snapshot) => {
            contentContainer.innerHTML = ""
        for (const doc of snapshot.docs) {
            const mainTextDiv = document.createElement("div")
            const coloredDiv = document.createElement("div")
            const upperDiv = document.createElement("div")
            const nameProfileDiv = document.createElement("div")
            const profileDiv = document.createElement("div")
            const nameLabel = document.createElement("h1")
            const contentLabel = document.createElement("h2")
            const timeLabel = document.createElement("h3")
            const timeDeleteDiv = document.createElement("div")

            const text = doc.data().Content.replace(/\/\//g, '\n')
            const username = doc.data().Username
            const timestamp = doc.data().Timestamp
            const profilePicture = doc.data().Profile
            console.log(profilePicture)

            nameLabel.textContent = username
            const date = timestamp.toDate()
            timeLabel.textContent = date.toLocaleString()
            contentLabel.textContent = text

            if (!profilePicture || profilePicture != "Default") {
                profileDiv.style.backgroundImage = `url('${profilePicture}')`
            }
            else {
                profileDiv.style.backgroundImage = `url('user.png')`
            }
            

            mainTextDiv.id = "main-text-div"
            coloredDiv.id = "colored-div"
            upperDiv.id = "upper-div"
            nameProfileDiv.id = "name-profile-div"
            profileDiv.id = "profile-div"
            nameLabel.id = "name-label"
            contentLabel.id = "content-label"
            timeLabel.id = "time-label"
            timeDeleteDiv.id = "time-delete-div"

            nameProfileDiv.appendChild(profileDiv)
            nameProfileDiv.appendChild(nameLabel)
            upperDiv.appendChild(nameProfileDiv)
            
            upperDiv.appendChild(timeDeleteDiv)
            coloredDiv.appendChild(upperDiv)
            coloredDiv.appendChild(contentLabel)
            mainTextDiv.appendChild(coloredDiv)
            contentContainer.appendChild(mainTextDiv)

            const usernameRN =await currentUsernameCheck()

            if (username === usernameRN) {
                upperDiv.classList.add("my-text")
                const deleteButton = document.createElement("button")
                deleteButton.id = "delete-button"
                deleteButton.textContent = "Delete"
                const deleteId = doc.id
                
                deleteButton.onclick = () => {
                    deleteText(deleteId)
                }
                timeDeleteDiv.appendChild(deleteButton)
            }
            timeDeleteDiv.appendChild(timeLabel)
        }
        let firstLoad = true
        if (firstLoad) {
            contentContainer.scrollTo({
            top: contentContainer.scrollHeight, behavior: "smooth"
        })
        firstLoad = false
        }
        })
        
        function deleteText (textUid) {
            snapshots.forEach(async(docs) => {
                if (docs.id == textUid) {
                    const docRef = doc(db,"Gaming",docs.id)
                    setTimeout(()=> {})
                    await deleteDoc(docRef)
                }
            }) 
        }
        
    }
    async function typingTexts () {
        const typearea = document.getElementById("type-content")
        typearea.addEventListener("keydown",(e) => {
            if (e.code ==="Enter") {
                addingTexts()
                typearea.value = ""

                const newContentContainer = document.getElementById("text-container")
                setTimeout(() => {
                    newContentContainer.scrollTo({
                        top: newContentContainer.scrollHeight,behavior:"smooth"
                    })
                },500)
                
            }
        })
        async function addingTexts() {
            const currentEmail = auth.currentUser.email
            emailSnapshots.forEach((doc) => {
                if (currentEmail == doc.data().email) {
                    const text = typearea.value
                    const time = new Date()
                    let currentProfilePicture = doc.data().Profile
                    if (currentProfilePicture === undefined || !currentProfilePicture) {
                        currentProfilePicture = "Default"
                    }


                    addDoc(collection(db,"Gaming"), {
                        Username: currentUsername,
                        Content : text,
                        Timestamp : time,
                        Profile : currentProfilePicture
                    }
                )
                }
            })

            
            
        }
    }
    async function settingUsername () {
        const usernameInput = document.getElementById("username-input")
        const confirmUsernameButton = document.getElementById("confirm-username-button")

        confirmUsernameButton.onclick = async() => {
            const newUsername = usernameInput.value
            const currentEmail = auth.currentUser.email
            let recognized = false
            let originalUsername;
            let userDocId = null;
            for (const doc of emailSnapshots) {
                if (doc.data().email == currentEmail) {
                    originalUsername = doc.data().Username
                    userDocId = doc.id
                    console.log("recognized")
                    recognized=true}
                if (doc.data().Username === newUsername && doc.data().email != currentEmail) {
                            alert("Username Already Taken")
                            setTimeout(()=> {window.location.href = "setUsername.html"})
                        }
            }
            if (recognized == false) {
                usernameInput.value = "There Was A Mistake"
            }
            else {
                usernameInput.value = "Doing Stuff..."
                if (userDocId) {
                const userDocRef = doc(db, "Users", userDocId);
                await updateDoc(userDocRef, { Username: newUsername });
                currentUsername = newUsername;

                const snapshots = await getDocs(collection(db, "Gaming"));
                for (const documents of snapshots.docs) {
                    const data = documents.data()
                    const newDocRef = doc(db,"Gaming",documents.id)

                    console.log("unsup")
                    if (data.Username === originalUsername || data.Username == null) {
                        await updateDoc(userDocRef, {
                            Username: newUsername
                        })
                        await updateDoc(newDocRef, {
                        Username : newUsername
                        })
                        }
                    }
                    }
                    window.location.href = "gaming.html"
            }
        }
    }
    async function fetchingBottomBar () {
        const response = await fetch("bottombar.html");
        const htmlText = await response.text();
        document.getElementById("bottombar-container").innerHTML = htmlText;

        /*Corner Buttons*/

        const threeDotsButton = document.getElementById("three-dots-button")
        let threeDotsButtonRotate = false

        const changeUsernameButton = document.createElement("button")
        const changeProfileButton = document.createElement("button")
        const seeUsersButton = document.createElement("button")
        const giveFeedbackButton = document.createElement("button")
        const logOutButton = document.createElement("button")

        changeUsernameButton.textContent = "Change Username"
        changeProfileButton.textContent = "Change Profile"
        seeUsersButton.textContent = "Users"
        giveFeedbackButton.textContent="Give FeedBack"
        logOutButton.textContent = "Log Out"

        changeUsernameButton.id = "change-username-button"
        changeProfileButton.id = "change-profile-button"
        seeUsersButton.id = "users-button"
        giveFeedbackButton.id = "give-feedback-button"
        logOutButton.id = "log-out-button"

        changeUsernameButton.classList.add("control-buttons")
        changeProfileButton.classList.add("control-buttons")
        seeUsersButton.classList.add("control-buttons")
        giveFeedbackButton.classList.add("control-buttons")
        logOutButton.classList.add("control-buttons")

        const controlsDiv = document.createElement("div")
        controlsDiv.id = "controls-div" 
        document.body.appendChild(controlsDiv)


        controlsDiv.appendChild(changeUsernameButton)
        controlsDiv.appendChild(changeProfileButton)
        controlsDiv.appendChild(seeUsersButton)
        controlsDiv.appendChild(giveFeedbackButton)
        controlsDiv.appendChild(logOutButton)

        /*Corner Buttons Functionality*/

        changeUsernameButton.onclick = () => {
            window.location.href = "setUsername.html"
        }
        changeProfileButton.onclick = () => {
            window.location.href = "changeProfile.html"
        }
        seeUsersButton.onclick = () => {
            threeDotsButton.click()
            
            const seeUsersDiv = document.createElement("div")
            seeUsersDiv.id = "see-users-div"

            const closeDiv = document.createElement("div")
            const closeButton = document.createElement("button")
            const seeAllUsersButton = document.createElement("button")

            closeDiv.id = "local-close-div"
            closeButton.id = "local-close-button"
            seeAllUsersButton.id = "local-see-all-users-button"

            seeAllUsersButton.textContent = "See All Users"
            seeAllUsersButton.onclick = () => {
                window.location.href = "seeAllUsers.html"
            }

            closeDiv.appendChild(closeButton)
            closeDiv.appendChild(seeAllUsersButton)
            seeUsersDiv.appendChild(closeDiv)

            emailSnapshots.forEach((userDoc)=> {
                const userDiv = document.createElement("div") 
                
                const userProfilePicture = document.createElement("div")
                const userName = document.createElement("h1")

                let localPFP
                localPFP = userDoc.data().Profile
                let localUsername = userDoc.data().Username

                if (!localPFP || localPFP == "Default") {
                    console.log("there was a default")
                    localPFP = "user.png"
                }

                userDiv.id = "local-user-div"
                userProfilePicture.id = "local-user-PFP"
                userName.id = "local-username"
                

                userProfilePicture.style.backgroundImage = `url('${localPFP}')`
                console.log(localPFP)
                userName.textContent = localUsername

                
                

                userDiv.appendChild(userProfilePicture)
                userDiv.appendChild(userName)
                seeUsersDiv.appendChild(userDiv)
            })
            document.body.appendChild(seeUsersDiv)

            closeButton.onclick = () => {
                document.body.removeChild(seeUsersDiv)
            }

        }
        logOutButton.onclick = () => {
            signOut(auth)
        }

        threeDotsButton.onclick = () => {
            if (!threeDotsButtonRotate) {
                threeDotsButton.style.transform = "rotate(-90deg)"
                threeDotsButton.style.borderRadius = "20px"
                threeDotsButtonRotate = true
                threeDotsButton.style.backgroundColor = "#1b1b23"
                
                controlsDiv.style.transform = "scaleY(1)"
                  
                
            }
            else {
                controlsDiv.style.transform = "scaleY(0)"
                threeDotsButton.style.transform = "rotate(0deg)"
                threeDotsButton.style.backgroundColor = "transparent"
                threeDotsButton.style.borderRadius = "20px"
                threeDotsButtonRotate = false

                
            }
            
        }

        await new Promise(res => setTimeout(res, 10));
        let profileImage;

        const newCollection = collection(db,"Users")
        const snapshot = await getDocs(newCollection);
        currentUsername = await currentUsernameCheck()

        const bottomNameLabel = document.getElementById("bottom-name-label")
        bottomNameLabel.textContent = currentUsername

        const bottomProfileImage = document.getElementById("profile-image")
        snapshot.forEach((doc) => {
            if (doc.data().Username == currentUsername) {
                profileImage = doc.data().Profile
            }
        })
        if (profileImage == "Default") {
            bottomProfileImage.style.backgroundImage = "url('user.png')"
        }
        else if (!profileImage) {
            bottomProfileImage.style.backgroundImage = "url('user.png')"
        }
        else {
            bottomProfileImage.style.backgroundImage = `url('${profileImage}')`;
        }
    }
    async function fetchingTopbar () {
        const response = await fetch("topbar.html")
        const htmlText = await response.text()
        document.getElementById("topbar-container").innerHTML = htmlText

        const serversProfileCollection = await getDocs(collection(db, "Servers Profile Pictures"));

        const generalTopbarButton = document.getElementById("general-topbar-button")
        const gamingTopbarButton = document.getElementById("gaming-topbar-button")

        const nameHeading = document.getElementById("name-heading")
        
        if (path.includes("gaming.html")) {
            nameHeading.textContent = "Stackrooms Chat -Gaming"
            gamingTopbarButton.classList.add("activePFP")
        }
        else if (path.includes("general.html")) {
            nameHeading.textContent = "Stackrooms Chat -General"
            generalTopbarButton.classList.add("activePFP")
        }
            let gamingProfile
            
            serversProfileCollection.forEach((doc) => {
                if (doc.data().name === "gaming") {
                    gamingProfile = doc.data().profileUrl
                    gamingTopbarButton.style.backgroundImage = `url('${gamingProfile}')`
                }
                if (doc.data().name === "general") {
                    gamingProfile = doc.data().profileUrl
                    generalTopbarButton.style.backgroundImage = `url('${gamingProfile}')`
                }
            })
            setTimeout(()=> {
                nameHeading.style.transform = "ScaleY(1)"

                gamingTopbarButton.style.transform = "ScaleY(1)"
                generalTopbarButton.style.transform = "ScaleY(1)"
            },500)
            
            console.log(gamingProfile)
            
        
    }
    
    /*@ Functionality */
    /*Side Control*/

    async function settingProfile () {
        const profilePictureDiv = document.getElementById("main-profile-preview")
        const profileInput = document.getElementById("profile-control-input")
        const confirmProfileButton = document.getElementById("confirm-profile-button")
        const backButton = document.getElementById("profile-back-button")

        /**Back Button Functionality */
        backButton.onclick = () => {
            window.location.href = "gaming.html"
        }
        
        /**Getting Current Profile Picture */

        let profileEmail
        onAuthStateChanged(auth,async(user) => {
            if (user) {
                
                profileEmail = user.email

                let currentProfile

                const profileSnapshots = await getDocs(collection(db, "Users"));

                profileSnapshots.forEach((profileDoc) => {
                    if (profileDoc.data().email === profileEmail) {
                        currentProfile = profileDoc.data().Profile
                    }
                })

                /**Showing profile Picture in the doc */

                if (currentProfile == "Default" || !currentProfile) {
                    profilePictureDiv.style.backgroundImage = "url('user.png')"
                    console.log("no current Profile")
                }
                else {
                    profilePictureDiv.style.backgroundImage = `url('${currentProfile}')`
                    
                }
                    }
            })
        
        /**Making It Functional */
        onAuthStateChanged(auth,async(user)=> {
            if (user) {
                console.log("found user")
                profileEmail = user.email
            confirmProfileButton.onclick = async() => {
            const newProfileURL = profileInput.value
            profileInput.value = ""

            let profileChangeId

            const profileSnapshots = await getDocs(collection(db, "Users"));
            profileSnapshots.forEach((newProfileDoc)=> {
                if (newProfileDoc.data().email === profileEmail) {
                    profileChangeId = newProfileDoc.id
                }
            })
            if (!profileChangeId) {
                console.log("no profilechangeid")
            }
            
            let profileUpdateRef = doc(db,"Users",profileChangeId)
            await updateDoc(profileUpdateRef, {
                Profile : newProfileURL
            })

            const currentProfileUsername = await currentUsernameCheck()

            const SnapshotsProfile = await getDocs(collection(db, "Gaming"));
            for (const docs of SnapshotsProfile.docs) {
                if (docs.data().Username === currentProfileUsername) {
                    const docRef = doc(db, "Gaming", docs.id);
                    await updateDoc(docRef, {
                        Profile: newProfileURL
                    })
                }
            }
            profileInput.value = "Changing Profile..."
            setTimeout(()=> {
                window.location.href = "gaming.html"
            },5000)
            }
            
        }
        })
        
        
    }
    async function seeAllUsers() {
        const usersSnapshot = await getDocs(emailCollection)
        const usersDisplayDiv = document.getElementById("users-display-div")
        const goBackButton = document.getElementById("go-back-button")

        goBackButton.onclick = () => {
            window.location.href = "gaming.html"
        }
        usersSnapshot.forEach((snapshot)=> {
            const userData = snapshot.data()
            let profileBackgroundImage = userData.Profile
            
            if (profileBackgroundImage == "Default" || !profileBackgroundImage) {
                profileBackgroundImage = "user.png"
            }
            
            const mainUserDiv =document.createElement("div")
            const profileDiv = document.createElement("div")
            const nameLabel = document.createElement("h1")

            mainUserDiv.classList.add("main-user-div")
            profileDiv.classList.add("main-profile-div")
            nameLabel.classList.add("main-name-label")

            profileDiv.style.backgroundImage = `url('${profileBackgroundImage}')`
            nameLabel.textContent = userData.Username

            mainUserDiv.appendChild(profileDiv)
            mainUserDiv.appendChild(nameLabel)
            usersDisplayDiv.appendChild(mainUserDiv)
        }  
        

    )
        
        
    }

    await loginCheck()

    if (path.includes("signUp.html")) {
        await signup()
    }
    if (path.includes("login.html")) {
        await login()
    }
    if (path.includes("gaming.html")) {
        await displayingTexts()
        await typingTexts()
        await fetchingBottomBar()
        await fetchingTopbar()
    }
    if (path.includes("setUsername.html")) {
        await settingUsername()
    }
    if (path.includes("changeProfile.html")) {
        settingProfile()
    }
    if (path.includes("seeAllUsers.html")) {
        seeAllUsers()
    }
}

await body()