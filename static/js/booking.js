let booking_models = {
    userData:null,
    attrData:null,
    orderID:null,
    
    bookingReq:new Request('/api/booking',{
        method:'GET',
        headers:userHeaders
    }),

    getUserData:function(){
        return fetch(models.Req).then((response) => {return response.json();}).then((result)=>{
            this.userData = result.data;
            
        })
    },
    
    getOrderData:function(){
         return fetch(booking_models.bookingReq).then((response) => {return response.json()}).then((result) =>{
            this.attrData = result.data;
            this.orderID = result.data.order;
        }).catch((error)=>{console.log(error)})
    },

    cancelOrderData: async function (order){
        cancelBody = JSON.stringify({
            "orderID":order
        });
    
        let cancelReq = new Request(booking_models.bookingReq,{method:"DELETE", body:cancelBody});
    
        await fetch(cancelReq).then((response)=>{return response.json()}).then((result)=>{
            if(result.ok === true){
                alert('已刪除行程');
                location.reload();
            }
        })
    },

    getCancelOrder:function(orderID){
        deleteIcon.addEventListener('click', function(){
            blur_effect.style.display='block';
            delete_check.style.display='flex';
        })
    },
};

// --- view global variables ---
const deleteIcon = document.querySelector('.icon-delete');
const delete_check = document.querySelector('.check_delete_popup');
const delete_no = document.getElementById('btn_delete_no');
const delete_yes = document.getElementById('btn_delete_yes');

let booking_views = {

    showUserName: function(){
        const userName = document.querySelector('.userName');
        userName.textContent = booking_models.userData.name;
    },

    showOrder: function(){
        
        let attr = booking_models.attrData;

        const noOrderPage = document.querySelector('.content-noOrder');
        const hasOrder = document.querySelector('.content-order');
        
        const title = document.querySelector('.order_title');
        const date = document.querySelector('.order_date');
        const time = document.querySelector('.order_time');
        const fee = document.querySelector('.order_fee');
        const address = document.querySelector('.order_address');
        const image = document.querySelector('.order_image');

        if(attr === null){
            noOrderPage.style.display = 'block';
            hasOrder.style.display = 'none';
        }else if (attr.error === true){
            alert('請先登入');
            location.reload();
        }else{
            title.textContent = "台北一日遊："+attr.attraction.name;
            date.textContent = attr.date;
            fee.textContent = attr.price;
            address.textContent = attr.attraction.address;
            image.setAttribute('src',attr.attraction.image);

            if (attr.time === "morning"){
                time.textContent = "上午六點到下午兩點";
            } else if (attr.time === "afternoon"){
                time.textContent = "下午四點到隔天早上四點";
            }
        }
    },

    showCancelPage: function(){
        blur_effect.style.display='block';
        delete_check.style.display='flex';
    }

};

let booking_controller = {
    init:function(){
            booking_models.getUserData().then(()=>{
                if(booking_models.userData === null){
                    booking_controller.toIndex();
                }else{
                    booking_views.showUserName();
                }
                
            });
    
            booking_models.getOrderData().then(()=>{
                booking_views.showOrder();
                booking_controller.removeOrder();
            });
    },

    removeOrder: function(){

        let orderID = booking_models.orderID
        
        deleteIcon.addEventListener('click', function(){
            booking_views.showCancelPage();
        });

        delete_no.addEventListener('click', function(){
            blur_effect.style.display='none';
            delete_check.style.display='none';
        });
    
        delete_yes.addEventListener('click', function(){
            booking_models.cancelOrderData(orderID);
        });
    },
    
    toIndex:function(){
        location.href='/';
    }
};

booking_controller.init();