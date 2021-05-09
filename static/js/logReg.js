// switch page global settings
const logRes_btn = document.getElementById('logAndRes');
const login_page = document.getElementById('loginPage');
const register_page = document.getElementById('registerPage');
const blur_effect = document.getElementById('blur');
const close_logRes_btns = Array.from(document.getElementsByClassName('closePopup'));
const toRegisterPage = document.getElementById('toRegisterPage');
const toLoginPage = document.getElementById('toLoginPage');
const toMemberPage = document.querySelector('.toMember')

// fetch user global settings
const login_btn = document.getElementById('js_btn_login');
const login_result = document.querySelector('.login_result');
const register_btn = document.getElementById('js_btn_register');
const reg_result = document.querySelector('.reg_result');
const logout_btn = document.getElementById('js_btn_logout');
const member_page = document.querySelector('.member_page');

let login_email = '';
let login_password = '';
let register_name = '';
let register_email = '';
let register_password = '';

let headers = {'Content-Type':'application/json'};
userHeaders = new Headers(headers);

let Req = new Request('/api/user',{
    method:'get',
    headers:userHeaders
});

// ---- events ---- //
// E - login listen
login_btn.addEventListener('click',function(e){
    e.preventDefault();
    login_result.style.display = 'none';
    login();
})

register_btn.addEventListener('click',function(e){
    e.preventDefault();
    reg_result.style.display = 'none';
    register();
})

logout_btn.addEventListener('click',function(){
    logout();
})

// ----- Models ----- //

// M - check user login status
function check_user_status(){
    let user = getCookie();
    
    if (user !== undefined){
        toMember();
        getMemberPage();
        // getUserProfile();
    } else if (user === undefined){
        toMemberPage.style.display='none';
        logAndRes.style.display='block';
        get_logAndRes_page();
    }
}


// M - login fetch
async function login(){
    login_email = document.getElementById('login-email').value;
    login_password = document.getElementById('login-password').value;
    let login_body = JSON.stringify({
        "email":login_email,
        "password":login_password
    });

    let loginReq = new Request(Req, { method: 'PATCH', body:login_body})

    await fetch(loginReq).then((response) => {return response.json()}).then((data)=>{
        if (data.error === true) {
            errorLogin()
        } else if(data.ok === true) {
            location.reload();

        }
    }).catch((error)=>{console.log(error)})


} 

// M - save login cookie
function saveUser(){

}


// M - get user profile
async function getUserProfile(){
    let userReq = new Request(Req,{ method:"GET"})
    // 不用await 後端會爆掉 要再釐清原因
     await fetch(userReq).then((response) => {return response.json()}).then((data)=>{
        console.log(data)
    }).catch((error)=>{console.log(error)})
}


// M - user register
async function register(){
    
    register_name = document.getElementById('js_reg_name').value;
    register_email = document.getElementById('js_reg_email').value;
    register_password = document.getElementById('js_reg_password').value;

    let reg_body = JSON.stringify({
        "name": register_name,
        "email": register_email,
        "password": register_password
    })

    let registerReq = new Request(Req,{ method:"POST", body:reg_body });

    fetch(registerReq).then((response) =>{return response.json()}).then((data)=>{
        if (data.ok === true) {
            successRegister();
        } else {
            errorRegister(data.message);
        }
    }).catch((error)=>{console.log(error)});
}

// M - get cookie
function getCookie(){
    const value = `${document.cookie}`;
    const user = value.split('user=')[1];
    return user;
}

// M - user logout
async function logout(){
    let logoutReq = new Request(Req,{method:"DELETE"});
    
    fetch(logoutReq).then((response) => {return response.json()}).then((data)=>{
        location.reload();
    }).catch((error) => {console.log(error)})
}

// ----- Views
// V - get popup
function get_logAndRes_page(){
    logRes_btn.addEventListener("click",function(){
        login_page.style.display = "flex";
        blur_effect.style.display = "block";
        switch_popup();
        click_blur_close();
    })
}

// V - switch popup page
function switch_popup(){
    toRegisterPage.addEventListener("click",function(){
        login_page.style.display = "none";
        register_page.style.display = "flex";
    });

    toLoginPage.addEventListener("click",function(){
        register_page.style.display = "none";
        login_page.style.display = "flex";
    })
}

// V - close popup
close_logRes_btns.forEach(function(btn){
    btn.addEventListener("click",function(){
        login_page.style.display = "none";
        blur_effect.style.display = "none";
        register_page.style.display = "none";
    })
})

// V - close blur
function click_blur_close(){
    blur_effect.addEventListener("click",function(){
        login_page.style.display = "none";
        register_page.style.display = "none";
        blur_effect.style.display = "none";
    })
}

// V - error login 
function errorLogin(){
    login_result.style.display='block';
    login_result.style.color='red';
}

// V - success register
function successRegister(){
    reg_result.textContent="註冊成功，請至登入頁面登入"
    reg_result.style.display='block';
    reg_result.style.color='';
}

// V - error register
function errorRegister(message){
    reg_result.textContent = message;
    reg_result.style.display='block';
    reg_result.style.color='red';
}

// V -  member nav
function toMember(){
    logAndRes.style.display='none';
    toMemberPage.style.display='block';
}

// V - to member pages
function getMemberPage(){
    member_page.addEventListener('click',function(){
        location.href='member';
    })
    
}

// ----- Controllers
check_user_status();

