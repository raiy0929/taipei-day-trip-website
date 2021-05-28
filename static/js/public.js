let headers = {'Content-Type':'application/json'};
userHeaders = new Headers(headers);

let register_name = '';
let register_email = '';
let register_password = '';
let register_birth = '';


// ---- views global variables ----
const logRes_btn = document.getElementById('logAndRes');
const login_page = document.getElementById('loginPage');
const register_page = document.getElementById('registerPage');
const blur_effect = document.getElementById('blur');
const close_logRes_btns = Array.from(document.getElementsByClassName('closePopup'));
const toRegisterPage = document.getElementById('toRegisterPage');
const toLoginPage = document.getElementById('toLoginPage');
const toMemberPage = document.querySelector('.toMember');
const bookingPage = document.getElementById('js_to_booking');
const member_page = document.querySelector('.member_page');

const login_btn = document.getElementById('js_btn_login');
const login_result = document.querySelector('.login_result');
const register_btn = document.getElementById('js_btn_register');
const reg_result = document.querySelector('.reg_result');
const logout_btn = document.getElementById('js_btn_logout');

const host = window.location.hostname;
const port = location.port;



let models = {

    Req:new Request('/api/user',{
        method:'get',
        headers:userHeaders
    }),

    loginStatus:false,
    loginResult:null,
    logoutResult:null,
    registerResult:null,
    

    check_user_status: async function(){
        let userReq = new Request(models.Req,{ method:"GET"});
        return fetch(userReq).then((response) => {return response.json()}).then((result)=>{
        if (result.data===null){
            this.loginStatus = false;
        } else {
            this.loginStatus = true;
        }
        }).catch((error)=>{console.log(error)})
    },

    loginFetch: async function(loginData){
        let login_body = JSON.stringify(loginData);
        let loginReq = new Request(models.Req, { method: 'PATCH', body:login_body})

        return await fetch(loginReq).then((response) => {return response.json()}).then((result)=>{
            loginResult = result;
        })
    },

    logoutFetch: async function(){
        let logoutReq = new Request(models.Req,{method:"DELETE"});
        return fetch(logoutReq).then((response) => {return response.json()}).then((result)=>{
            logoutResult = result;
        }).catch((error) => {console.log(error)})
    },

    registerFetch: async function(registerData){
        let reg_body = JSON.stringify(registerData);
        let regReq = new Request(models.Req,{method:"POST", body:reg_body});

        return await fetch(regReq).then((response) => {return response.json()}).then((result) =>{
            registerResult = result;
        })
    },
};

let views = {
    showLogAndResBtn:function(){
        toMemberPage.style.display='none';
        logRes_btn.style.display='block';
    },

    showLogPage:function(){
        login_page.style.display = "flex";
        views.openBlur();
        controller.closePopupBtn();
    },

    switchToLogin:function(){
        login_result.style.display='none';
        register_page.style.display = "none";
        login_page.style.display = "flex";
    },

    switchToRegister:function(){
        reg_result.style.display='none';
        login_page.style.display = "none";
        register_page.style.display = "flex";
    },

    showMemberBtn:function(){
        logRes_btn.style.display='none';
        toMemberPage.style.display='block';
    },

    toMemberPage:function(){
        member_page.addEventListener('click',function(){
            location.href='http://'+host+':'+port+'/member';
        })
    },

    loginResultMessage:{
        success:function(message){
            login_result.style.display='block';
            login_result.style.color='green';
            login_result.textContent = message;
        },
        error:function(message){
            login_result.style.display='block';
            login_result.style.color='red';
            login_result.textContent = message;
        }
    },

    registerResultMessage:{
        success:function(message){
            views.cleanRegisterForm();
            reg_result.textContent=message;
            reg_result.style.display='block';
            reg_result.style.color='green';
        },
        error:function(message){
            reg_result.textContent=message;
            reg_result.style.display='block';
            reg_result.style.color='red';

        }
    },

    cleanRegisterForm:function(){
        document.getElementById('js_reg_email').value = '';
        document.getElementById('js_reg_name').value = '';
        document.getElementById('js_reg_password').value = '';
    },

    formEmptyWarning:{
        emptyLog:function(){
            login_result.style.display='block';
            login_result.style.color='red';
            login_result.textContent = '帳號、密碼不可為空';
        },
        emptyReg:function(){
            reg_result.style.display='block';
            reg_result.style.color='red';
            reg_result.textContent = '各欄位不可為空';
        }
    },

    closeBlur: function(){
        login_page.style.display = "none";
        register_page.style.display = "none";
        blur_effect.style.display = "none";
    },

    openBlur: function(){
        blur_effect.style.display = "block";
    },

    closePopup: function(){
        login_page.style.display = "none";
        blur_effect.style.display = "none";
        register_page.style.display = "none";
    }

};

let controller = {

    init: function (){
        models.check_user_status().then(()=>{
            controller.toBookingPage();
            if(models.loginStatus === false){
                views.showLogAndResBtn();
                logRes_btn.addEventListener("click",function(){
                    views.showLogPage();
                    controller.toLogAndReg();
                });
                blur_effect.addEventListener("click",function(){
                    views.closeBlur();
                });

            }else if(models.loginStatus === true){
                views.showMemberBtn();
                views.toMemberPage();
                controller.logout();
                
            }
        })
    },

    toLogAndReg:function(){
        controller.closePopupBtn();
        controller.login();
        controller.register();
        controller.switch_popup();
    },

    switch_popup:function(){
        toRegisterPage.addEventListener("click",function(){
            views.switchToRegister();
        });
    
        toLoginPage.addEventListener("click",function(){
            views.switchToLogin();
        })
    },

    closePopupBtn:function(){
        close_logRes_btns.forEach(function(btn){
            btn.addEventListener("click",function(){
               views.closePopup();
            })
        })
    },

    login:function(){
        login_btn.addEventListener('click',function(e){
            e.preventDefault();
            let loginData = controller.checkLogForm();
            if (loginData !== null){
                models.loginFetch(loginData).then(()=>{
                    if (loginResult.error === true) {
                        views.loginResultMessage.error(loginResult.message);
                    } else if(loginResult.ok === true) {
                        models.loginStatus = true;
                        views.loginResultMessage.success(loginResult.message);
                        setTimeout(() => {
                            location.reload();
                        },2000)
                    }
                })
            }
        })
    },

    register:function(){
        register_btn.addEventListener('click',function(e){
            e.preventDefault();
            reg_result.style.display = 'none';
            let registerData = controller.checkRegForm();
            if(registerData !== null){
                models.registerFetch(registerData).then(()=>{
                    if(registerResult.ok === true){
                        views.registerResultMessage.success(registerResult.message);
                    } else if (registerResult.error === true){
                        views.registerResultMessage.error(registerResult.message);
                    }
                })
            }
        })
    },

    checkLogForm: function(){
        let login_email = document.getElementById('login-email').value;
        let login_password = document.getElementById('login-password').value;
        if (login_email == '' || login_password == '') {
            views.formEmptyWarning.emptyLog();
            return null
        } else {
            return {"email":login_email, "password":login_password
            };
        }
        
    },

    checkRegForm: function(){
        register_name = document.getElementById('js_reg_name').value;
        register_email = document.getElementById('js_reg_email').value;
        register_password = document.getElementById('js_reg_password').value;
        register_birth = document.getElementById('js_reg_birth').value;

        if(register_name =='' || register_email == '' || register_password == '' || register_birth == '') {
            views.formEmptyWarning.emptyReg();
            return null
        }else{
            return{
                "name": register_name,
                "email": register_email,
                "password": register_password,
                "birth": register_birth,
            };
        }
    },

    logout: function(){
        logout_btn.addEventListener("click",function(){
            models.logoutFetch().then(()=>{
                models.loginStatus=false;
                location.href="/";
            })
        });

    },

    toBookingPage: function(){
        bookingPage.addEventListener('click',function(){
            if(models.loginStatus === false){
                views.showLogPage();
                controller.toLogAndReg();
            }else{
                location.href='http://'+host+':'+port+'/booking';
            }
        })
    },
};

controller.init();