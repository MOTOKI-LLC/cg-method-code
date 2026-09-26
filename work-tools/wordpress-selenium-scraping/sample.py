from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import csv

#オプション（エラーメッセージを非表示+ヘッドレスモード）
options = Options()
options.add_experimental_option('excludeSwitches', ['enable-logging'])
options.use_chromium = True
options.add_argument("--headless")
driver = webdriver.Chrome("C:/Users/suimin/python/chromedriver.exe",options=options)

#CSVファイル
filename = "sample"  + ".csv"
f = open(filename, "w", encoding="CP932", errors="ignore")
writer = csv.writer(f, lineterminator='\n')

#URL
site_url = "https://cg-method.com/work-tools/"
driver.execute_script("window.open()") 
driver.switch_to.window(driver.window_handles[-1])
driver.get(site_url)

#項目を記載
header = ["ID","TITLE","URL"]
writer.writerow(header)

#要素の取得
item = 1
elems= driver.find_elements(By.CLASS_NAME,"p-postList__item")
for elem in elems:
    csvlist = []
    csvlist.append(str(item)) 
    title = elem.find_elements(By.CLASS_NAME,"p-postList__title") 
    link = elem.find_elements(By.CLASS_NAME,"p-postList__link")     
    csvlist.append(title[0].text)
    csvlist.append(link[0].get_attribute("href") )
    writer.writerow(csvlist)
    item = item + 1

# 閉じる
f.close()
