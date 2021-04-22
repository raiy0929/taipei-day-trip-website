import urllib.request as request
import json
import ssl
import pymysql
ssl._create_default_https_context = ssl._create_unverified_context

db=pymysql.connect(host="127.0.0.1",user="root",password="5566",database="TravelWeb")

# db = mysql.connector.connect(
#     host="127.0.0.1", user="root", password="5566", database="TravelWeb"
# )

cur = db.cursor()


filename = "taipei-attractions.json"
with open(filename) as json_file:
    data = json.load(json_file)

landList = data["result"]["results"]

# 景點放入db
for n in landList:
    attrId = n["_id"] # 景點編號
    landName = n["stitle"]  # 景點名稱
    landMrt = n["MRT"]  # 景點捷運
    landType = n["CAT2"]  # 景點類別

    # 處理全部景點照片網址
    photoUrl = n["file"].split("http") #photoUrl是list
    pic_list=[]
    for i in photoUrl:  # 逐一檢查網址是否為圖片檔
        my_suffixes = ("JPG", "PNG", "jpg", "png")
        if i.endswith(my_suffixes) != True  or  i == '' :
            continue
        pic='http'+ i
        pic_list.append(pic) # pic_list為所有可用景點網址的列表
    pic_list = str(pic_list) 

    landIntro = n["xbody"] # 景點簡介
    landAddr = n["address"] # 景點地址
    landTrans = n["info"] # 景點交通
    landLati = n["latitude"] #景點緯度
    landLongi = n["longitude"] #景點經度
    cur.execute('insert into `attractions`(attrId, title, mrt, type, pic_link, introduction, address, transportation, latitude, longitude) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',(attrId, landName, landMrt, landType, pic_list, landIntro, landAddr, landTrans, landLati, landLongi))
    db.commit()
    # print(pic_list)

# 處理景點照片
# photoUrl = landList[0]["file"].split("http") #photoUrl是list
# pic_list=[]
# for i in photoUrl:  # 逐一檢查網址是否為圖片檔
#     my_suffixes = ("JPG", "PNG", "jpg", "png")
#     if i.endswith(my_suffixes) != True  or  i == '' :
#         continue
#     pic='http'+ i
#     pic_list.append(pic) # pic_list為所有可用景點網址的列表
# pic_list = str(pic_list) 
