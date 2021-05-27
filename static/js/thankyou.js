const title_wrap = document.querySelector('.order_title');
const date_wrap = document.querySelector('.order_date');
const time_wrap = document.querySelector('.order_time');
const address_wrap = document.querySelector('.order_address');
const name_wrap = document.querySelector('.order_conName');
const phone_wrap = document.querySelector('.order_conPhone');
const img_wrap = document.querySelector('.order_image');
const btn_toMember = document.querySelector('.toMember_btn');

const main = document.querySelector('.main');
const no_order_popup = document.querySelector('.no_order_popup');
const no_order_btn = document.getElementById('no_order_btn');



let thank_models ={
    number:null,
    userData:null,
    finishOrderData:null,

    getUserData:function(){
        return fetch(models.Req).then((response) => {return response.json();}).then((result)=>{
            this.userData = result.data;
            
        })
    },

    getFinishOrder: function(){

        let url_string = window.location.href
        let url = new URL(url_string)
        number = url.searchParams.get('number')
        
        let src = '/api/order/' + number;
        
        return fetch(src).then((response)=> {return response.json()}).then((result)=>{
            this.finishOrderData=result;
        })

    }
}

let thank_views = {

    showFinishOrder: function(attr){

        title_wrap.textContent = "一日遊："+attr["trip"]["attraction"]["name"];
        date_wrap.textContent = attr["trip"]["date"];
        address_wrap.textContent = attr["trip"]["attraction"]["address"]
        img_wrap.setAttribute('src',attr["trip"]["attraction"]["image"])
        name_wrap.textContent = attr["contact"]["name"]
        phone_wrap.textContent = attr["contact"]["phone"]
        
        if(attr["trip"]["time"] === "morning"){
            time_wrap.textContent = "早上八點到下午四點";
        }else if(attr["trip"]["time"] === "afternoon"){
            time_wrap.textContent = "晚上八點到凌晨四點";
        }

    },

    showNoOrderPopup: function(){
        no_order_popup.style.display = "flex";
        blur_effect.style.display = "block";
    },

    hideNoOrderPopup: function(){
        no_order_popup.style.display = "none";
        blur_effect.style.display = "none";
    },

    hideMainContent: function(){
        main.style.display = "none";
    }
}

let thank_controller = {

    init: function(){
        thank_models.getUserData().then(()=>{
            if(thank_models.userData === null){
                thank_controller.toIndex();
            }
        });

        thank_models.getFinishOrder().then(()=>{
            let attr = thank_models.finishOrderData.data
            
            if(thank_models.finishOrderData.error === true){
                thank_views.hideMainContent();
                thank_views.showNoOrderPopup();
                thank_controller.listener.no_order();
            }else if(attr !== null){
                thank_views.showFinishOrder(attr);
            }

        });

        btn_toMember.addEventListener("click", ()=>{
            location.href = "/member"
        })
    },

    listener:{
        no_order:function(){
            no_order_btn.addEventListener('click', ()=>{
                location.href = "/member"
            }) 
        }
    },

    toIndex:function(){
        location.href='/';
    },



}

thank_controller.init();