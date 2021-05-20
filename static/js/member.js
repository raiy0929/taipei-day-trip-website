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

    getUserProfileData: async function(){
        let userReq = new Request(models.Req,{ method:"GET"});

        return fetch(userReq).then((response)=>{return response.json()}).then((result)=>{
            this.userProfile = result.data;
        })
    },

    allOrderReq:new Request('/api/allOrder',{method:'get'}),
    orderData:null,

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
            "orderID":cancelId
        });

        let cancelReq = new Request(member_models.bookingReq,{method:"DELETE", body:cancelBody});

        return fetch(cancelReq).then((response)=>{return response.json()}).then((result)=>{
            this.cancelResult = result;
        })
        
    },

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

            order_ID = document.createElement('td');
            order_ID_href = document.createElement('a');
            order_Date = document.createElement('td');
            order_Status = document.createElement('td');
            order_Fee = document.createElement('td');
            order_btn = document.createElement('td');

            order_ID_href.textContent = orderData[i].orderId;
            order_Date.textContent = orderData[i].date;
            order_Status.textContent = orderData[i].status;
            order_Fee.textContent = orderData[i].fee;
            
            order_btn.innerHTML = '<button class="btn btn_pay">結帳</button><button class="btn btn_cancel" data-cancelId='+orderData[i].orderId+'>取消</button>';


            order_ID.appendChild(order_ID_href);
            order_tr.appendChild(order_ID);
            order_tr.appendChild(order_Date);
            order_tr.appendChild(order_Status);
            order_tr.appendChild(order_Fee);
            order_tr.appendChild(order_btn);

            order_wrap.appendChild(order_tr);
        }
    }

}


let member_controller ={
    init:function(){
        member_models.getUserProfileData().then(()=>{
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

    reload: function(){
        location.reload();
    }


}

member_controller.init();