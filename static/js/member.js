const profile_wrap = document.querySelector('.me_profile_content');
const allOrderWrap = document.querySelector('.me_order_content');
const order_wrap = document.getElementById('js_order_content_wrap');

const btn_profile = document.querySelector('.me_profile')
const btn_order = document.querySelector('.me_order');
const btn_ticket = document.querySelector('.me_ticket');

const profile_name = document.querySelector('.profile_name');
const profile_email = document.querySelector('.profile_email');
const profile_birth = document.querySelector('.profile_birth');


let member_models = {

    userProfile:null,
    cancelResult:null,
    orderData:null,

    getUserProfileData: async function(){
        let userReq = new Request(models.Req,{ method:"GET"});

        return fetch(userReq).then((response)=>{return response.json()}).then((result)=>{
            this.userProfile = result.data;
        })
    },

    allOrderReq:new Request('/api/allOrder',{method:'get'}),
    

    getOrderData: async function(){
        return fetch(member_models.allOrderReq).then((response)=>{return response.json()}).then((result)=>{
            
            this.orderData = result.data;
        })
    },

    bookingReq:new Request('/api/booking',{
        method:'GET',
        headers:userHeaders
    }),

    cancelOrderData: async function (btn){
        cancelId = btn.dataset.cancelid;
        cancelBody = JSON.stringify({
            "cartID":cancelId
        });

        let cancelReq = new Request(member_models.bookingReq,{method:"DELETE", body:cancelBody});

        return fetch(cancelReq).then((response)=>{return response.json()}).then((result)=>{
            this.cancelResult = result;
        })
        
    }

}


let member_views = {

    showUserProfile: function (){
        profile_name.textContent = member_models.userProfile.name;
        profile_email.textContent = member_models.userProfile.email;
        profile_birth.textContent = member_models.userProfile.birth;
    },

    swiftToProfile: function (){
        profile_wrap.style.display='block';
        allOrderWrap.style.display='none';
    },

    swiftToOrder: function (){
        profile_wrap.style.display='none';
        allOrderWrap.style.display='block';
    },

    showUserOrder: function (){

        orderData = member_models.orderData

        for (let i = 0 ; i < orderData.length; i++){
            order_tr = document.createElement('tr');

            order_number = document.createElement('td');
            
            order_Date = document.createElement('td');
            order_title = document.createElement('td');
            order_Status = document.createElement('td');
            order_Fee = document.createElement('td');
            order_btn = document.createElement('td');

            order_number.textContent = orderData[i].number;
            order_Date.textContent = orderData[i].date;
            order_title.textContent = orderData[i].title;
            order_Status.textContent = orderData[i].status;
            order_Fee.textContent = orderData[i].fee;

            if (orderData[i].status === '未付款'){
                order_btn.innerHTML = '<button class="btn btn_pay" data-cartID='+orderData[i].cartID+'>結帳</button><button class="btn btn_cancel" data-cancelId='+orderData[i].cartID+'>取消</button>';
            }else if(orderData[i].status === '已付款'){
                order_btn_href = "thankyou?number="+orderData[i].number
                order_btn.innerHTML = '<a href='+order_btn_href+' class="btn_thank" data-cartID='+orderData[i].cartID+'>訂單內容</a>';

            }
   
            // order_number.appendChild(order_number_href);
            order_tr.appendChild(order_number);
            order_tr.appendChild(order_Date);
            order_tr.appendChild(order_title);
            order_tr.appendChild(order_Status);
            order_tr.appendChild(order_Fee);
            
            order_tr.appendChild(order_btn);

            order_wrap.appendChild(order_tr);
        }
    },

    disabledOrderBtn: function(btn) {
        btn.setAttribute('disabled');
    }

}


let member_controller ={
    init:function(){
        member_models.getUserProfileData().then(()=>{
            if(member_models.userProfile === null){
                location.href = '/'
            }
            member_views.showUserProfile();
            member_controller.swiftContent();
        })
        member_controller.order();
    },

    swiftContent: function(){
        btn_profile.addEventListener('click', function(){
            member_views.swiftToProfile();
        })
    
        btn_order.addEventListener('click', function(){
            member_views.swiftToOrder();
        })
    },

    order: function(){
        member_models.getOrderData().then(()=>{
                member_views.showUserOrder();
                member_controller.cancelOrder();
                member_controller.toPayOrder();
            
        })
    },

    cancelOrder: function(){
        const btn_cancel =  document.querySelectorAll('.btn_cancel');

        btn_cancel.forEach(function(btn){
            btn.addEventListener('click', function(){
                member_models.cancelOrderData(btn).then(()=>{
                    if(member_models.cancelResult.ok === true){
                        alert('已刪除行程');
                        member_controller.reload();
                    }else if(member_models.cancelResult.error === true){
                        alert(member_models.cancelResult.message);
                    }
                })
            })
        })
    },

    toPayOrder: function(){
        
        const btn_pay =  document.querySelectorAll('.btn_pay');

        btn_pay.forEach(function(btn){
            btn.addEventListener('click', function(){
                console.log("123")
                let cartID = btn.dataset.cartid;
                location.href = 'booking/' + cartID;
            })
        })
    },

    reload: function(){
        location.reload();
    },



}

member_controller.init();