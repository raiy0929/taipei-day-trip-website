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
let register_birth = '';

let headers = {'Content-Type':'application/json'};
userHeaders = new Headers(headers);

let Req = new Request('/api/user',{
    method:'get',
    headers:userHeaders
});

// ---- events ---- //
login_btn.addEventListener('click',function(e){
    e.preventDefault();
    login_result.style.display = 'none';
    login_email = document.getElementById('login-email').value;
    login_password = document.getElementById('login-password').value;
    if (login_email == '' || login_password == '') {
        login_result.style.display='block';
        login_result.style.color='red';
        login_result.textContent = '帳號、密碼不可為空';
    } else {
        login(login_email,login_password);
    }
})

register_btn.addEventListener('click',function(e){
    e.preventDefault();
    reg_result.style.display = 'none';
    register_name = document.getElementById('js_reg_name').value;
    register_email = document.getElementById('js_reg_email').value;
    register_password = document.getElementById('js_reg_password').value;
    register_birth = document.getElementById('js_reg_birth').value;
    if(register_name =='' || register_email == '' || register_password == '' || register_birth == '') {
        reg_result.style.display='block';
        reg_result.style.color='red';
        reg_result.textContent = '各欄位不可為空';
    }else{
        register(register_name, register_email, register_password, register_birth);
    }
})

logout_btn.addEventListener('click',function(){
    logout();
})

// ----- Models ----- //

// M - check user login status

// M - check user status
async function check_user_status(){
    let userReq = new Request(Req,{ method:"GET"});
    fetch(userReq).then((response) => {return response.json()}).then((data)=>{
        if (data.data===null){
        toMemberPage.style.display='none';
        logAndRes.style.display='block';
        get_logAndRes_page();
        } else {
            toMember();
            getMemberPage();
        }
    }).catch((error)=>{console.log(error)})
}


// M - login fetch
async function login(email,password){
    // login_email = document.getElementById('login-email').value;
    // login_password = document.getElementById('login-password').value;
    let login_body = JSON.stringify({
        "email":email,
        "password":password
    });

    let loginReq = new Request(Req, { method: 'PATCH', body:login_body})

    await fetch(loginReq).then((response) => {return response.json()}).then((data)=>{
        if (data.error === true) {
            errorLogin(data.message)
        } else if(data.ok === true) {
            successLogin(data.message)
            setTimeout(() => {
                location.reload();
            },2000)
        }
    }).catch((error)=>{console.log(error)})
} 

// M - user register
async function register(name, email, password, birth){

    let reg_body = JSON.stringify({
        "name": name,
        "email": email,
        "password": password,
        "birth": birth
    })

    let registerReq = new Request(Req,{ method:"POST", body:reg_body });

    fetch(registerReq).then((response) =>{return response.json()}).then((data)=>{
        if (data.ok === true) {
            successRegister(data.message);
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
        location.href="/";
    }).catch((error) => {console.log(error)})
}


// ----- Views ----- //
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
        reg_result.style.display='none';
        login_page.style.display = "none";
        register_page.style.display = "flex";
    });

    toLoginPage.addEventListener("click",function(){
        login_result.style.display='none';
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

// V -success login_result
function successLogin(message){
    login_result.style.display='block';
    login_result.style.color='green';
    login_result.textContent = message;
}

// V - error login 
function errorLogin(message){
    login_result.style.display='block';
    login_result.style.color='red';
    login_result.textContent = message;
}

// V - success register
function successRegister(message){
    reg_result.textContent=message;
    reg_result.style.display='block';
    reg_result.style.color='green';
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
        location.href='http://127.0.0.1:3000/member';
    })
}

// ----- Controllers
check_user_status();

