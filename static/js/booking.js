const submitButton = document.getElementById('btn-submit');
const deleteIcon = document.querySelector('.icon-delete');
const delete_check = document.querySelector('.check_delete_popup');
const delete_no = document.getElementById('btn_delete_no');
const delete_yes = document.getElementById('btn_delete_yes');

let card_name = '';
let card_email = '';
let card_phone = '';
let card_number = '';

let fields = {
    number: {
        // css selector
        element: document.getElementById('card-number'),
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: document.getElementById('card-cvv'),
        placeholder: 'CCV'
    }
};

let booking_models = {
    userData:null,
    attrData:null,
    cartID:null,
    pay_result:null,
    
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
            this.cartID = result.data.cartID;
        }).catch((error)=>{console.log(error)})
    },

    cancelOrderData: async function (cartID){

        cancelBody = JSON.stringify({
            "cartID":cartID
        });
    
        let cancelReq = new Request(booking_models.bookingReq,{method:"DELETE", body:cancelBody});
    
        await fetch(cancelReq).then((response)=>{return response.json()}).then((result)=>{
            if(result.ok === true){
                alert('已刪除行程');
                location.reload();
            }
        })
    },

    getCancelOrder:function(cartID){
        deleteIcon.addEventListener('click', function(){
            blur_effect.style.display='block';
            delete_check.style.display='flex';
        })
    },

    primeFetch: async function(prime_data){
        let apiBody = JSON.stringify(prime_data);

        return fetch('/api/order',
        {method:"POST",
        headers:{'Content-Type':"application/json"},
        body:apiBody,
        }).then((response) => {return response.json()}).then((result)=>{
            pay_result = result.data
        })
    }
};


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
    },

    checkCard:function(){
        TPDirect.card.onUpdate(function (update) {
            // var cardViewContainer = document.querySelector('#tappay-iframe')
        
            if (update.canGetPrime) {
                submitButton.removeAttribute('disabled')
            } else {
                submitButton.setAttribute('disabled', true)
            };
        
            if(update.status.number === 2){
                booking_views.card_status.error('.card-number-group');
                
            }else if(update.status.number === 0){
                booking_views.card_status.success('.card-number-group');
            }else{
                booking_views.card_status.normal('.card-number-group');
            };
        
            if(update.status.expiry === 2){
                booking_views.card_status.error('.card-expiry-group');
            }else if(update.status.expiry === 0){
                booking_views.card_status.success('.card-expiry-group');
                
            }else{
                booking_views.card_status.normal('.card-expiry-group');
            };
        
            if(update.status.ccv === 2){
                booking_views.card_status.error('.card-cvv-group');
            }else if(update.status.ccv === 0){
                booking_views.card_status.success('.card-cvv-group');
                
            }else{
                booking_views.card_status.normal('.card-cvv-group');
            };
        })
    },

    card_status:{
  
        success:function(selector){
          document.querySelector(selector).classList.remove('has_error');
          document.querySelector(selector).classList.add('has_success');
        },
        error:function(selector){
          document.querySelector(selector).classList.remove('has_success');
          document.querySelector(selector).classList.add('has_error');
        },
        normal:function(selector){
          document.querySelector(selector).classList.remove('has_success');
          document.querySelector(selector).classList.remove('has_error');
        }
    },

    pay_status:{
        success:function(){
            alert('付款成功');
        },
        error:function(){
            alert('付款失敗，請重新嘗試')
        }
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
                booking_controller.removeCart();
            });

            TPDirect.setupSDK('20276', 'app_WUyQYBHeNQViidXajjAq7FCQ7BVvSMKzfT3FY5iKyJlFxCxOSyAFCPYeooF5', 'sandbox');

            TPDirect.card.setup({
                fields: fields,
                styles: {
                  // Style all elements
                  // Styling ccv field
                  'input': {
                    'font-size': '16px'
                  },
                  // style focus state
                  ':focus': {
                    'color': 'black'
                  },
                  // style valid state
                  '.valid': {
                    color: 'green',
                  },
                  // style invalid state
                  '.invalid': {
                    color: 'red',
                  },
                  // Media queries
                  // Note that these apply to the iframe, not the root window.
                  '@media screen and (max-width: 400px)': {
                    input: {
                      color: 'orange',
                    },
                  },
                },
              });

            booking_views.checkCard();

            submitButton.addEventListener('click',booking_controller.onSubmit);

    },

    onSubmit: function(e){
        e.preventDefault();

        card_name = document.getElementById('name').value;
        card_email = document.getElementById('email').value;
        card_phone = document.getElementById('phone').value;
        // card_number = document.getElementById('cc-number').value;
        
        // amount = document.querySelector('.order_fee').textContent;
        
        let attr = booking_models.attrData;
        const tappayStatus = TPDirect.card.getTappayFieldsStatus();

    
        if(tappayStatus.canGetPrime === false){
            alert('請輸入正確的信用卡資料')
            return;
        }

        //get prime
        if(card_name==='' || card_email==='' || card_phone==='') {
            alert('請輸入聯絡信息')
        }else{
            TPDirect.card.getPrime((result)=>{
                if(result.status !== 0){
                    console.log('error:'+result.msg)
                    return;
                }
                let prime_data = {
                    "prime":result.card.prime,
                    "order":{
                        "price":attr.price,
                        "trip":{
                            "attraction":{
                                "id":attr.attraction.id,
                                "name":attr.attraction.name,
                                "address":attr.attraction.address,
                                "image":attr.attraction.image,
                            },
                            "date":attr.date,
                            "time":attr.time,
                        },
                    },
                    "contact":{
                        "card_name":card_name,
                        "card_email": card_email,
                        "card_phone":card_phone,
                    },
                    "cartID":attr.cartID
                }

                booking_models.primeFetch(prime_data).then(()=>{
                    
                    if (pay_result.payment.status === 0){
                        booking_views.pay_status.success();
                        location.href="thankyou?number="+pay_result.number;
                    }else if(pay_result.payment.status !== 0){
                        booking_views.pay_status.error();
                    }
                })
            })
        }
    },
    

    removeCart: function(){

        let cartID = booking_models.cartID
        
        deleteIcon.addEventListener('click', function(){
            booking_views.showCancelPage();
        });

        delete_no.addEventListener('click', function(){
            blur_effect.style.display='none';
            delete_check.style.display='none';
        });
    
        delete_yes.addEventListener('click', function(){
            booking_models.cancelOrderData(cartID);
        });
    },
    
    toIndex:function(){
        location.href='/';
    }
};


booking_controller.init();


