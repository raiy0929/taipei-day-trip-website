//global settings
let url = location.pathname;
let attrId = url.split('/')[2];
let order_btn = document.getElementById('js_btn_order');

let orderReq = new Request('/api/booking',{
    method:'get',
    headers:userHeaders
});

let today = new Date()

let early = document.getElementById('trip-time-early');
let night = document.getElementById('trip-time-night');
let show_cost = document.querySelector('.cost-preview-price');


let attraction_models = {

    attrData:null,
    min_day:null,
    max_day:null,
    orderResult:null,

    getAttrData: async function(){
        await fetch(`/api/attraction/${attrId}`).then((response) => response.json()).then((result)=>{
            this.attrData = result.data;
        })
    },

    getToday: function(){
        min_day = new Date(today);
        min_day.setDate(today.getDate() + 3)
        this.min_day = min_day.toISOString().split('T')[0]

        max_day = new Date(today);
        max_day.setDate(today.getDate() + 60)
        this.max_day = max_day.toISOString().split('T')[0]

        attraction_views.showMinDay(this.min_day);

        attraction_views.datePick(this.min_day, this.max_day);
    },

    goBooking: async function(e){
        e.preventDefault();

        let date = document.getElementById('trip-date').value;
        let time = document.querySelector('input[type=radio]:checked').value;
        let price = document.querySelector('.cost-preview-price').textContent;

        let goOrder_body = JSON.stringify({
            "attractionId":attrId,
            "date":date,
            "time":time,
            "price":price,
        });

        let goOrderReq = new Request(orderReq,{method:"POST", body:goOrder_body});

        await fetch(goOrderReq).then(response => response.json()).then((result) =>{
            this.orderResult = result;
        })
    }
}

let attraction_views = {
    showAttr:function(){
        let attrData = attraction_models.attrData
        
        // get html ele
        let attrName = document.querySelector('.attraction-preview h2')
        let attrCateg= document.querySelector('.category')
        let attrMrt = document.querySelector('.mrt')
        let attrProfile= document.querySelector('.profile')
        let attrAddr= document.querySelector('.address')
        let attrTransp=document.querySelector('.transport')
        
        // call img append
        attraction_views.showAllImg();
        
        // append data
        attrName.textContent = attrData.name;
        attrCateg.textContent = attrData.category;
        attrMrt.textContent = attrData.mrt;
        attrProfile.textContent = attrData.description;
        attrAddr.textContent = attrData.address;
        attrTransp.textContent = attrData.transport;
    },

    showAllImg: function (){
        let attrData= attraction_models.attrData

        for(let i = 0; i <attrData.images.length; i++) {
            let img_container = document.querySelector('.pic-sec');
            let attrImg = document.createElement('img');
            attrImg.className = 'pic d-none';
            attrImg.dataset.picnum = i;
            attrImg.setAttribute('src',attrData.images[i]);
            img_container.appendChild(attrImg);
    
            let a = document.createElement('a');
            let img = document.createElement('img');
    
            // circle
            let circle_container = document.querySelector('.pic-circle');
            img.setAttribute('src','../static/image/icon/icon-other_circle.png');
            img.className = 'icon-circle';
            img.dataset.circlenum = i;
    
            a.appendChild(img);
            circle_container.appendChild(a);
        }
    
        // first image & black circle
        let first_pic = document.querySelector('[data-picnum="0"]');
        first_pic.className = 'pic showing-pic fade';
    
        let current_cir = document.querySelector('[data-circlenum="0"]');
        current_cir.setAttribute('src','../static/image/icon/icon-current_circle.png');
        current_cir.className= 'icon-circle showing-cir';

        attraction_views.showImages_by_circle();
        attraction_views.showImages_by_arrow();
    },

    showImages_by_circle: function(){
        let circle_container =  document.querySelector('.pic-circle');
        circle_container.addEventListener('click',function(e){
            if(e.target.nodeName === 'IMG'){
                
                let opt_num = e.target.dataset.circlenum;

                // images
                let opt_img = '[data-picnum="'+opt_num+'"]';
                document.getElementsByClassName('showing-pic')[0].className = 'pic d-none';
                document.querySelector(opt_img).className = 'pic showing-pic fade';

                // circles
                // get current
                let opt_cir = '[data-circlenum="'+opt_num+'"]';
                document.getElementsByClassName('showing-cir')[0].setAttribute('src','../static/image/icon/icon-other_circle.png');
                document.getElementsByClassName('showing-cir')[0].className = 'icon-circle';
                document.querySelector(opt_cir).setAttribute('src','../static/image/icon/icon-current_circle.png');
                document.querySelector(opt_cir).className = 'icon-circle showing-cir';
            }
        })
    },

    showImages_by_arrow: function(){
        let arrow = document.querySelector('.arrow-container'); 

        arrow.addEventListener('click', function(e){
            let showing_pic = document.querySelector('.showing-pic');
            let showing_cir = document.getElementsByClassName('showing-cir')[0];
            let num =  parseInt(showing_pic.dataset.picnum);

            if(e.target.nodeName === 'IMG'){
                if(e.target.getAttribute('class') === 'btn-prev-pic btn-pic-arrow'){
                    let prev_num = num-1;
                    if(prev_num === -1){
                        return;
                    }else{
                        showing_pic.className='pic d-none';
                        showing_cir.setAttribute('src','../static/image/icon/icon-other_circle.png');
                        showing_cir.className='icon-circle';
                        change_show_pic(prev_num)
                    }
                }else if(e.target.getAttribute('class') === 'btn-next-pic btn-pic-arrow'){
                    let next_num = num+1; 
                    let picAmount= document.getElementsByClassName('pic');
                    if(next_num >= picAmount.length){
                        return;
                    }else{
                        showing_pic.className='pic d-none';
                        showing_cir.setAttribute('src','../static/image/icon/icon-other_circle.png');
                        showing_cir.className='icon-circle';
                        attraction_views.change_show_pic(next_num)
                    }
                }
            }else{
                return;
            }
        })
    },
     
    change_show_pic: function(new_num){
        document.querySelector('[data-picnum="'+new_num+'"]').className = 'pic showing-pic fade';
        document.querySelector('[data-circlenum="'+new_num+'"]').setAttribute('src','../static/image/icon/icon-current_circle.png');
        document.querySelector('[data-circlenum="'+new_num+'"]').className = 'icon-circle showing-cir';
    },

    showFee:function(){
        early.addEventListener('click', function(){
            show_cost.textContent = "2000";
        })
    
        night.addEventListener('click', function(){
            show_cost.textContent = "2500";
        })
    },

    showMinDay:function(min_day){
        // let min_day = attraction_models.min_day
        document.getElementById('trip-date').value = min_day
    },

    datePick: function(min, max){
        document.querySelector('.trip-date-picker').setAttribute('min',min)
        document.querySelector('.trip-date-picker').setAttribute('max',max)
        document.querySelector('.trip-date-picker').addEventListener('change', function(){
            let date = this.value;
            document.getElementById('trip-date').value=date;
        })
    }

}

let attraction_controller = {

    init:function(){
        attraction_models.getAttrData().then(() => {
            attraction_views.showAttr();
        });

        attraction_views.showFee();

        attraction_controller.tripDay();
        attraction_controller.booking();
    },

    tripDay:function(){
        attraction_models.getToday();
    },

    booking: function(){
        order_btn.addEventListener('click', function(e){
            attraction_models.goBooking(e).then(()=>{
                if(attraction_models.orderResult.ok === true){location.href='/booking'}
                else if(attraction_models.orderResult.error === true){
                    views.showLogPage();
                    controller.toLogAndReg();
                }
            }).catch((error)=>{console.log(error)});
        })
   }

}

attraction_controller.init();
