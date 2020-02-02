from selenium import webdriver
from bs4 import BeautifulSoup
import pandas as pd
from collections import OrderedDict
from selenium.webdriver.support.ui import Select
import json


prodict = OrderedDict()
nutdict = OrderedDict()
driver = webdriver.Chrome("/usr/lib/chromium-browser/chromedriver")
driver.get("http://www.fitjog.com/nutrition-charts/indian-nutrition-charts-food-wise.php")


def parser():
    content = driver.page_source
    soup = BeautifulSoup(content)
    soup = soup.find("table", {"id": "graph_table"})
    usedkeys = list()

    for td in soup.find_all('td',{'id':'graph_td','class':'first'})[3:]:
        if 'class="value first"' in str(td):
            try:
                nutdict[usedkeys[-1]] = td.text[td.text.index('RDA')+4:].strip()
            except Exception as e:
                pass
        else:
            nutdict[td.text] = None
            usedkeys.append(td.text)
    nutdict['Quantity'] = soup.find_all('td', {'id': 'graph_td', 'class': 'first'})[2].text.strip()

    return nutdict


select = Select(driver.find_element_by_name('Food'))
select2 = driver.find_element_by_name('Food')
optsoup = BeautifulSoup(select2.get_attribute('innerHTML'))

optlen = len(optsoup.find_all('option'))

for i in range(0,optlen):
    try:
        select = Select(driver.find_element_by_name('Food'))
        select.select_by_index(i)
        btn = driver.find_element_by_name('submit')
        btn.click()
        nutdict = parser()
        prodict[optsoup.find_all('option')[i].text.strip()] = nutdict
        nutdict = OrderedDict()
        print(prodict)
    except Exception as e:
        continue

print(prodict)
print(len(prodict))
json = json.dumps(prodict)
f= open('a2.json','w')
f.write(json)
f.close()


