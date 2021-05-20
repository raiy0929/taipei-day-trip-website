const landContainer = document.getElementById('landContainer');
const keywordBtn = document.querySelector('.header-btn');

let onloading = false;
let src = '';

let index_models = {

    page:0,
    keyword:null,
    attrContent:null,
    attrNextPage:null,

    attrFetch: async function (){
        onloading = true;
        keyword = document.getElementById('keyword').value;

        if(index_models.page !== null && keyword){
            src = '/api/attractions?page='+index_models.page+'&keyword='+keyword;
        }else if(index_models.page !== null){
            src = '/api/attractions?page='+index_models.page;
        }else{
            return;
        }

        return fetch(src).then((response) => {return response.json()}).then((result)=>{
            

            if(result.error === true){
                this.attrContent = null;
            }else{
                this.attrContent = result.data;
            }

            if(result.nextPage !==null){
                this.page = result.nextPage;
            }else{
                this.page = null
            }
        })
    }
};


let index_views = {

    showNoAttr:function(){
        landContainer.innerHTML='<div class="nodata">查無相關景點</div>';
    },

    showAttr:function(attractions){
        for(let i=0; i<attractions.length; i++){ 
            let li = document.createElement("li")
            li.setAttribute('class', 'content-land-item');
            let img = document.createElement("img");
            img.setAttribute('src',attractions[i].images[0])
            let section = document.createElement("section");
            section.setAttribute('class','content-land-item-text');
            let name = document.createElement("h5");
            name.textContent=attractions[i].name;
            
            let ulAddr = document.createElement("ul");
            ulAddr.setAttribute('class','d-flex');
            let mrtLi = document.createElement("li");
            mrtLi.textContent=attractions[i].mrt;
            let cateLi = document.createElement("li");
            cateLi.textContent=attractions[i].category;
    
            let a = document.createElement("a");
            let attrId = attractions[i].id;
            a.setAttribute('href','/attraction/'+attrId);
    
            ulAddr.appendChild(mrtLi);
            ulAddr.appendChild(cateLi);
    
            section.appendChild(name);
            section.appendChild(ulAddr);
    
            a.appendChild(img);
            a.appendChild(section);
            
            li.appendChild(a);
        
            landContainer.appendChild(li);
        }
    },


    resetAttr: function() {
        landContainer.textContent='';
    }


};


let index_controller = {

    init: function(){
        index_controller.get_attr();
        index_controller.keyword();
    },

    get_attr: function(){
        index_models.attrFetch().then(()=>{
            if(index_models.attrContent === null){
                index_views.showNoAttr();
            } else {
                index_views.showAttr(index_models.attrContent);
            }
                
            if(index_models.page !== null){
                onloading = false;
                index_controller.onScroll();
            }
        })
    },

    keyword:function(){
        keywordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            index_views.resetAttr();
            onloading = false;
            index_models.page = 0;
            index_controller.get_attr();
        })
    },

    onScroll:function(){
        window.addEventListener('scroll',function(){
            let position = landContainer.getBoundingClientRect();
            let scroll = window.innerHeight-position.top;
            if (scroll - position.height >= 0 && onloading === false ){
                index_controller.get_attr();
            }
        });
    }
};

index_controller.init();



